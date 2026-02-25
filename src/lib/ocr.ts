// src/lib/ocr.ts
import { OCR_BOXES } from '../config'
import type { SectionId } from '../config'

declare global {
  interface Window {
    Tesseract: {
      recognize(
        image: HTMLCanvasElement,
        lang: string,
        options?: object
      ): Promise<{ data: { text: string } }>
    }
  }
}

function pick4Digits(text: string): string {
  const m = String(text || '').match(/(\d{4})/)
  return m ? m[1] : ''
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

function cropToCanvas(
  img: HTMLImageElement,
  box: [number, number, number, number]
): HTMLCanvasElement {
  const [x, y, w, h] = box

  const sx = Math.round(img.naturalWidth * x)
  const sy = Math.round(img.naturalHeight * y)
  const sw = Math.max(1, Math.round(img.naturalWidth * w))
  const sh = Math.max(1, Math.round(img.naturalHeight * h))

  const canvas = document.createElement('canvas')
  const scale = 3
  canvas.width = sw * scale
  canvas.height = sh * scale

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  const im = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = im.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const gray = r * 0.299 + g * 0.587 + b * 0.114
    const v = gray > 140 ? 255 : 0
    d[i] = d[i + 1] = d[i + 2] = v
  }
  ctx.putImageData(im, 0, 0)

  return canvas
}

async function ocrText(canvas: HTMLCanvasElement): Promise<string> {
  // Use npm tesseract.js
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const { data } = await worker.recognize(canvas)
  await worker.terminate()
  return (data.text || '').trim()
}

export async function importScreenshot(
  sectionId: SectionId,
  onProgress: (progress: number) => void
): Promise<string[]> {
  const boxes = OCR_BOXES[sectionId]
  if (!boxes?.length) throw new Error('ยังไม่มี OCR_BOXES ของหมวดนี้')

  return new Promise<string[]>((resolve, reject) => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'
    document.body.appendChild(fileInput)

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0]
      document.body.removeChild(fileInput)

      if (!file) {
        resolve([])
        return
      }

      try {
        const img = await fileToImage(file)
        const points: string[] = []

        for (let i = 0; i < boxes.length; i++) {
          const canvas = cropToCanvas(img, boxes[i].pointBox)
          const raw = await ocrText(canvas)
          points.push(pick4Digits(raw) || '')
          onProgress(Math.round(((i + 1) / boxes.length) * 100))
        }

        resolve(points)
      } catch (e) {
        reject(e)
      }
    }

    fileInput.click()
  })
}
