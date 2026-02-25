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
  /** badgeRightEdges[i] = absolute X pixel (in natural image coords) where purple badge ends */
  badgeRightEdges?: (number | null)[]
  onClose: () => void
}

const SLOT_COLORS = [
  '#ff4444', '#ff8800', '#ffdd00', '#44ff88',
  '#00ccff', '#aa44ff', '#ff66cc', '#ffffff',
]

export default function OcrDebugModal({
  open,
  imageUrl,
  sectionId,
  points,
  badgeRightEdges = [],
  onClose,
}: OcrDebugModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!open || !imageUrl) return

    let cancelled = false

    // Defer one frame so the Dialog portal has time to mount the canvas into the DOM
    const raf = requestAnimationFrame(() => {
      if (cancelled || !canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onerror = (e) => console.error('[OcrDebug] image load failed', e)
      img.onload = () => {
        if (cancelled) return

        const maxW = Math.min(900, img.naturalWidth)
        const scale = maxW / img.naturalWidth
        canvas.width = maxW
        canvas.height = img.naturalHeight * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const margin = Math.round(img.naturalWidth * 0.005) // same as ocr.ts

        const boxes: OcrBox[] = OCR_BOXES[sectionId]
        boxes.forEach((box, i) => {
          const [bx, by, bw, bh] = box.pointBox
          const color = SLOT_COLORS[i % SLOT_COLORS.length]

          // ── Search zone (full wide box) ── dashed yellow
          const zx = bx * canvas.width
          const zy = by * canvas.height
          const zw = bw * canvas.width
          const zh = bh * canvas.height

          ctx.save()
          ctx.setLineDash([5, 4])
          ctx.strokeStyle = '#ffee00'
          ctx.lineWidth = 1.5
          ctx.strokeRect(zx, zy, zw, zh)
          ctx.restore()

          // ── Number crop zone (after badge) ── solid colored border
          const badgeRX = badgeRightEdges[i]
          const searchSx = Math.round(img.naturalWidth * bx)
          const searchSy = Math.round(img.naturalHeight * by)
          const searchSw = Math.round(img.naturalWidth * bw)
          const searchSh = Math.round(img.naturalHeight * bh)

          const numStartX = badgeRX !== null && badgeRX !== undefined
            ? badgeRX + margin
            : searchSx + Math.round(searchSw * 0.65) // fallback: right 35%
          const numEndX = searchSx + searchSw
          const nw = Math.max(0, numEndX - numStartX)

          // Convert back to canvas-display coords
          const nx = numStartX * scale
          const ny = searchSy * scale
          const nwDisplay = nw * scale
          const nhDisplay = searchSh * scale

          // Filled tint
          ctx.fillStyle = color + '28'
          ctx.fillRect(nx, ny, nwDisplay, nhDisplay)

          // Solid border
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.strokeRect(nx, ny, nwDisplay, nhDisplay)

          // Badge-end marker (vertical line)
          if (badgeRX !== null && badgeRX !== undefined) {
            const bLineX = (badgeRX + margin) * scale
            ctx.save()
            ctx.strokeStyle = '#ff69b4'
            ctx.lineWidth = 1.5
            ctx.setLineDash([3, 3])
            ctx.beginPath()
            ctx.moveTo(bLineX, ny)
            ctx.lineTo(bLineX, ny + nhDisplay)
            ctx.stroke()
            ctx.restore()
          }

          // Label: "#N: value" above the number zone
          const label = `#${i + 1}: ${points[i] || '❌'}`
          ctx.font = 'bold 13px monospace'
          const tw = ctx.measureText(label).width
          ctx.fillStyle = 'rgba(0,0,0,0.8)'
          ctx.fillRect(nx, ny - 21, tw + 8, 20)
          ctx.fillStyle = color
          ctx.fillText(label, nx + 4, ny - 6)
        })
      }

      // Set src AFTER onload is attached
      img.src = imageUrl
    })

    return () => { cancelled = true; cancelAnimationFrame(raf) }
  }, [open, imageUrl, sectionId, points, badgeRightEdges])

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[95vw] max-w-5xl max-h-[90vh] flex flex-col
            rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 flex-shrink-0 gap-4">
            <Dialog.Title className="text-white font-bold text-lg whitespace-nowrap">
              OCR Debug — {sectionId.toUpperCase()}
            </Dialog.Title>
            <Dialog.Description className="text-zinc-500 text-xs text-center flex-1">
              <span className="inline-block mr-3">
                <span className="text-yellow-300">- - -</span> = zone ค้นหา badge ม่วง
              </span>
              <span className="inline-block mr-3">
                <span className="text-pink-400">| |</span> = ขอบขวา badge
              </span>
              <span className="inline-block">
                <span className="text-green-400">───</span> = zone OCR ตัวเลข
              </span>
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white w-8 h-8 flex items-center justify-center
                  rounded-full hover:bg-zinc-700 text-xl transition-colors flex-shrink-0"
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
                  style={{ background: SLOT_COLORS[i % SLOT_COLORS.length] }}
                />
                <span className="text-zinc-400">#{i + 1}</span>
                <span className={p ? 'text-white font-bold' : 'text-red-400'}>
                  {p || 'ไม่ได้'}
                </span>
                {badgeRightEdges[i] != null
                  ? <span className="text-pink-400 text-[10px]">badge✓</span>
                  : <span className="text-zinc-600 text-[10px]">fallback</span>
                }
              </span>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

