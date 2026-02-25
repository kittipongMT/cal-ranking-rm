// src/lib/ocr.ts
import { OCR_BOXES } from '../config'
import type { SectionId } from '../config'

/** Extract the best 4-digit score (1000–9999) from OCR text */
function extractScore(text: string): string {
  const allNums = [...String(text || '').matchAll(/\d+/g)].map((m) => m[0])
  const fourDigit = allNums.find((n) => n.length === 4 && Number(n) >= 1000)
  if (fourDigit) return fourDigit
  const digits = String(text || '').replace(/\D/g, '')
  if (digits.length >= 4) {
    for (let i = 0; i <= digits.length - 4; i++) {
      const chunk = digits.slice(i, i + 4)
      if (Number(chunk) >= 1000) return chunk
    }
  }
  return ''
}

/** Detect if pixel (r,g,b) is a vivid purple (the game's scoring badge color) */
function isVividPurple(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  if (delta < 25) return false          // too grey/dark
  // Blue must be dominant channel, red can be mid, green must be low-ish
  // Purple: R > G, B > G, and both R and B are significant
  if (g > r || g > b) return false      // green dominant = not purple
  if (b < 60) return false              // too dark in blue
  const hue = (() => {
    let h = 0
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / delta + 2) * 60
    else h = ((r - g) / delta + 4) * 60
    return h
  })()
  const l = (max + min) / 2 / 255
  const s = delta / 255 / (1 - Math.abs(2 * l - 1))
  // Purple/violet: hue 220–340, moderate saturation, not too dark or washed out
  return hue >= 220 && hue <= 340 && s > 0.20 && l > 0.10 && l < 0.85
}

/**
 * Scan a region of the image for purple badge pixels.
 * Returns the rightmost X pixel (in natural image coords) of the purple region,
 * or null if no purple badge found.
 */
function findBadgeRightEdge(
  img: HTMLImageElement,
  sx: number, sy: number, sw: number, sh: number
): number | null {
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = sw
  tmpCanvas.height = sh
  const ctx = tmpCanvas.getContext('2d')!
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
  const { data } = ctx.getImageData(0, 0, sw, sh)

  let rightmostPurpleCol = -1

  for (let col = 0; col < sw; col++) {
    let purpleCount = 0
    for (let row = 0; row < sh; row++) {
      const idx = (row * sw + col) * 4
      if (isVividPurple(data[idx], data[idx + 1], data[idx + 2])) purpleCount++
    }
    // Column is "purple" if >8% of its pixels are purple
    if (purpleCount > sh * 0.08) rightmostPurpleCol = col
  }

  return rightmostPurpleCol >= 0 ? sx + rightmostPurpleCol : null
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Crop the number area (right side of purple badge) and preprocess for Tesseract.
 * If badge not found, falls back to right 35% of the search zone.
 */
function buildNumberCanvas(
  img: HTMLImageElement,
  searchSx: number, searchSy: number, searchSw: number, searchSh: number,
  badgeRightX: number | null,
  threshold: number,
  invertBright: boolean
): HTMLCanvasElement {
  const margin = Math.round(img.naturalWidth * 0.005)
  const numStartX = badgeRightX !== null
    ? badgeRightX + margin
    : searchSx + Math.round(searchSw * 0.65)  // fallback: right 35%
  const numEndX = searchSx + searchSw
  const nw = Math.max(8, numEndX - numStartX)

  const canvas = document.createElement('canvas')
  const scale = 4
  canvas.width = nw * scale
  canvas.height = searchSh * scale

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, numStartX, searchSy, nw, searchSh, 0, 0, canvas.width, canvas.height)

  const im = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = im.data
  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
    const bright = gray > threshold
    const v = (invertBright ? bright : !bright) ? 0 : 255
    d[i] = d[i + 1] = d[i + 2] = v
    d[i + 3] = 255
  }
  ctx.putImageData(im, 0, 0)
  return canvas
}

async function ocrCanvas(
  canvas: HTMLCanvasElement,
  worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>>
): Promise<string> {
  const { data } = await worker.recognize(canvas)
  return (data.text || '').trim()
}

export interface OcrResult {
  points: string[]
  debugLog: string[]
  imageUrl: string
  /** badgeRightEdges[i] = absolute x pixel where badge ends for box i (null if not found) */
  badgeRightEdges: (number | null)[]
}

export async function importScreenshot(
  sectionId: SectionId,
  onProgress: (progress: number) => void
): Promise<OcrResult> {
  const boxes = OCR_BOXES[sectionId]
  if (!boxes?.length) throw new Error('ยังไม่มี OCR_BOXES ของหมวดนี้')

  return new Promise((resolve, reject) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0]
      document.body.removeChild(fileInput)
      if (!file) { resolve({ points: [], debugLog: [], imageUrl: '', badgeRightEdges: [] }); return }

      const imageUrl = URL.createObjectURL(file)
      try {
        const img = await fileToImage(file)
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker('eng')
        await worker.setParameters({ tessedit_char_whitelist: '0123456789' })

        const points: string[] = []
        const debugLog: string[] = []
        const badgeRightEdges: (number | null)[] = []

        for (let i = 0; i < boxes.length; i++) {
          const [bx, by, bw, bh] = boxes[i].pointBox
          const sx = Math.round(img.naturalWidth * bx)
          const sy = Math.round(img.naturalHeight * by)
          const sw = Math.max(1, Math.round(img.naturalWidth * bw))
          const sh = Math.max(1, Math.round(img.naturalHeight * bh))

          const badgeRightX = findBadgeRightEdge(img, sx, sy, sw, sh)
          badgeRightEdges.push(badgeRightX)

          const strategies: Array<[number, boolean]> = [
            [155, true],
            [120, true],
            [140, false],
          ]

          let best = ''
          const rawReadings: string[] = []

          for (const [thresh, inv] of strategies) {
            const canvas = buildNumberCanvas(img, sx, sy, sw, sh, badgeRightX, thresh, inv)
            const raw = await ocrCanvas(canvas, worker)
            rawReadings.push(`t${thresh}${inv ? 'i' : 'n'}:"${raw}"`)
            const score = extractScore(raw)
            if (score && !best) best = score
          }

          const badgeStr = badgeRightX !== null
            ? `badge→x${badgeRightX}`
            : 'no-badge(fallback)'
          const log = `box${i + 1}[${badgeStr}]: ${rawReadings.join(' | ')} → "${best}"`
          debugLog.push(log)
          console.log(`[OCR ${sectionId}] ${log}`)

          points.push(best)
          onProgress(Math.round(((i + 1) / boxes.length) * 100))
        }

        await worker.terminate()
        resolve({ points, debugLog, imageUrl, badgeRightEdges })
      } catch (e) {
        URL.revokeObjectURL(imageUrl)
        reject(e)
      }
    }

    fileInput.click()
  })
}

