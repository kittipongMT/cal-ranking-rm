// src/components/CarDialog.tsx
import React, { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

interface CarDialogProps {
  open: boolean
  title: string
  label: string
  defaultValue?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export default function CarDialog({
  open,
  title,
  label,
  defaultValue = '',
  onConfirm,
  onCancel,
}: CarDialogProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setValue(defaultValue)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, defaultValue])

  function handleConfirm() {
    const trimmed = value.trim()
    if (trimmed) onConfirm(trimmed)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[90vw] max-w-sm rounded-xl border border-zinc-700
            bg-zinc-900 p-6 shadow-2xl"
        >
          <Dialog.Title className="text-white font-bold text-lg mb-1">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-zinc-400 text-sm mb-4">
            {label}
          </Dialog.Description>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            className="w-full h-11 rounded border-2 border-zinc-500 bg-white
              text-black font-bold text-base px-3 outline-none"
            placeholder="ชื่อรถ..."
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleConfirm}
              className="flex-1 h-11 rounded bg-[#e60a3d] text-white font-extrabold
                text-base hover:brightness-110 active:scale-[0.985] transition-all"
            >
              ตกลง
            </button>
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded border border-zinc-700
                text-zinc-400 font-extrabold text-base bg-transparent
                hover:bg-zinc-800 hover:text-zinc-200 active:scale-[0.985] transition-all"
            >
              ยกเลิก
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300
                w-7 h-7 flex items-center justify-center rounded-full text-lg"
              onClick={onCancel}
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
