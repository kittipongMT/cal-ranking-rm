// src/components/OcrDebugModal.tsx
import { useEffect, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { OcrBox, SectionId } from '../config'
import { OCR_BOXES } from '../config'

interface OcrDebugModalProps {
  open: boolean
  imageUrl: string
  sectionId: SectionId
  points: string[]
  onClose: () => void
}

const BOX_COLORS = [
  '#ff4444', '#ff8800', '#ffdd00', '#44ff44',
  '#00ccff', '#8844ff', '#ff44cc', '#ffffff',
]

export default function OcrDebugModal({
  open,
  imageUrl,
  sectionId,
  points,
  onClose,
}: OcrDebugModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!open || !imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.src = imageUrl

    img.onload = () => {
      // Fit image to max 900px wide
      const maxW = Math.min(900, img.naturalWidth)
      const scale = maxW / img.naturalWidth
      canvas.width = maxW
      canvas.height = img.naturalHeight * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const boxes: OcrBox[] = OCR_BOXES[sectionId]
      boxes.forEach((box, i) => {
        const [bx, by, bw, bh] = box.pointBox
        const rx = bx * canvas.width
        const ry = by * canvas.height
        const rw = bw * canvas.width
        const rh = bh * canvas.height

        const color = BOX_COLORS[i % BOX_COLORS.length]

        // Semi-transparent fill
        ctx.fillStyle = color + '33'
        ctx.fillRect(rx, ry, rw, rh)

        // Border
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.strokeRect(rx, ry, rw, rh)

        // Label: box number + read value
        const label = `#${i + 1}: ${points[i] || '❌'}`
        ctx.font = 'bold 13px monospace'
        const tw = ctx.measureText(label).width
        ctx.fillStyle = 'rgba(0,0,0,0.75)'
        ctx.fillRect(rx, ry - 20, tw + 8, 20)
        ctx.fillStyle = color
        ctx.fillText(label, rx + 4, ry - 5)
      })
    }
  }, [open, imageUrl, sectionId, points])

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[95vw] max-w-5xl max-h-[90vh] flex flex-col
            rounded-2xl border border-[rgba(223,205,128,0.3)] bg-zinc-900 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 flex-shrink-0">
            <Dialog.Title className="text-[#dfcd80] font-bold text-lg">
              OCR Debug — {sectionId.toUpperCase()}
            </Dialog.Title>
            <Dialog.Description className="text-zinc-500 text-xs">
              กรอบสีแสดงตำแหน่งที่อ่านแต้ม • ตัวเลขในกรอบ = ผลที่อ่านได้
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white w-8 h-8 flex items-center justify-center
                  rounded-full hover:bg-zinc-700 text-xl transition-colors"
              >
                ×
              </button>
            </Dialog.Close>
          </div>

          <div className="overflow-auto p-4 flex-1">
            <canvas
              ref={canvasRef}
              className="w-full rounded-xl border border-zinc-700"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 px-5 py-3 border-t border-zinc-800 flex-shrink-0">
            {points.map((p, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-lg bg-zinc-800"
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: BOX_COLORS[i % BOX_COLORS.length] }}
                />
                <span className="text-zinc-400">#{i + 1}</span>
                <span className={p ? 'text-white font-bold' : 'text-red-400'}>
                  {p || 'ไม่ได้'}
                </span>
              </span>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
