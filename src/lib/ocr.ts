// src/lib/ocr.ts
import { OCR_BOXES } from '../config'
import type { SectionId } from '../config'

/** Extract the best 4-digit score (1000–9999) from OCR text */
function extractScore(text: string): string {
  // Find all contiguous digit sequences
  const allNums = [...String(text || '').matchAll(/\d+/g)].map((m) => m[0])

  // Prefer exact 4-digit numbers in plausible game score range
  const fourDigit = allNums.find((n) => n.length === 4 && Number(n) >= 1000)
  if (fourDigit) return fourDigit

  // Fallback: strip all non-digits and look for 4+ digit run
  const digits = String(text || '').replace(/\D/g, '')
  if (digits.length >= 4) {
    // Try every 4-char window and pick one in 1000–9999
    for (let i = 0; i <= digits.length - 4; i++) {
      const chunk = digits.slice(i, i + 4)
      if (Number(chunk) >= 1000) return chunk
    }
  }

  return ''
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

/** Crop image region and apply threshold preprocessing for Tesseract */
function cropToCanvas(
  img: HTMLImageElement,
  box: [number, number, number, number],
  threshold: number,
  invertBright: boolean   // true = bright→black (white text on dark bg)
): HTMLCanvasElement {
  const [x, y, w, h] = box

  const sx = Math.round(img.naturalWidth * x)
  const sy = Math.round(img.naturalHeight * y)
  const sw = Math.max(1, Math.round(img.naturalWidth * w))
  const sh = Math.max(1, Math.round(img.naturalHeight * h))

  const canvas = document.createElement('canvas')
  const scale = 4
  canvas.width = sw * scale
  canvas.height = sh * scale

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

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

export async function importScreenshot(
  sectionId: SectionId,
  onProgress: (progress: number) => void
): Promise<{ points: string[]; debugLog: string[]; imageUrl: string }> {
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
      if (!file) { resolve({ points: [], debugLog: [], imageUrl: '' }); return }

      const imageUrl = URL.createObjectURL(file)
      try {
        const img = await fileToImage(file)
        const { createWorker } = await import('tesseract.js')
        const worker = await createWorker('eng')
        await worker.setParameters({ tessedit_char_whitelist: '0123456789' })

        const points: string[] = []
        const debugLog: string[] = []

        for (let i = 0; i < boxes.length; i++) {
          // Try two preprocessing strategies; pick whichever yields a valid score
          const strategies: Array<[number, boolean]> = [
            [155, true],   // white text on dark bg (primary: game UI style)
            [120, true],   // lower threshold fallback
            [140, false],  // dark text on light bg (alternative)
          ]

          let best = ''
          const rawReadings: string[] = []

          for (const [thresh, inv] of strategies) {
            const canvas = cropToCanvas(img, boxes[i].pointBox, thresh, inv)
            const raw = await ocrCanvas(canvas, worker)
            rawReadings.push(`t${thresh}${inv ? 'i' : 'n'}:"${raw}"`)
            const score = extractScore(raw)
            if (score && !best) best = score
          }

          const log = `box${i + 1}: ${rawReadings.join(' | ')} → "${best}"`
          debugLog.push(log)
          console.log(`[OCR ${sectionId}] ${log}`)

          points.push(best)
          onProgress(Math.round(((i + 1) / boxes.length) * 100))
        }

        await worker.terminate()
        resolve({ points, debugLog, imageUrl })
      } catch (e) {
        URL.revokeObjectURL(imageUrl)
        reject(e)
      }
    }

    fileInput.click()
  })
}
