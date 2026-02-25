// src/components/ScorePage.tsx
import { useState } from 'react'

const BONUS = 1200

export default function ScorePage() {
  const [scores, setScores] = useState<string[]>(['', '', '', '', ''])
  const [fillValue, setFillValue] = useState('')
  const [total, setTotal] = useState<number | null>(null)

  function handleChange(i: number, val: string) {
    setScores((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  function fillAll() {
    if (!fillValue) return
    setScores(Array(5).fill(fillValue))
  }

  function calculate() {
    const sum = scores.reduce((acc, v) => acc + (Number(v) || 0), 0)
    setTotal(sum + BONUS)
  }

  function reset() {
    setScores(['', '', '', '', ''])
    setFillValue('')
    setTotal(null)
  }

  return (
    <main className="max-w-[600px] mx-auto px-3 py-8 flex flex-col gap-4">
      <div className="rounded-none bg-[#0c0c0c] border border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.08]">
          <span className="flex-shrink-0 w-[3px] h-5 bg-[#e60a3d]" />
          <span className="text-white font-extrabold text-[14px] uppercase tracking-widest">
            Score Calculator
          </span>
          <span className="text-zinc-500 text-[11px]">คำนวณแต้มจัดอันดับ</span>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Fill All */}
          <div className="flex items-center gap-3">
            <label className="text-zinc-400 text-sm whitespace-nowrap">ใส่ทุกช่อง:</label>
            <input
              type="number"
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fillAll()}
              placeholder="เลข..."
              className="w-28 h-9 rounded border border-zinc-700 bg-black/40
                text-white font-bold text-sm text-center outline-none
                [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
                focus:border-zinc-500 transition-colors"
            />
            <button
              type="button"
              onClick={fillAll}
              className="h-9 px-4 rounded border border-zinc-700 bg-white/5
                text-zinc-300 text-sm font-semibold cursor-pointer
                hover:bg-white/10 hover:text-white active:scale-[0.97] transition-all"
            >
              Fill All
            </button>
          </div>

          {/* 5 score inputs */}
          <div className="flex flex-col gap-2.5">
            <span className="text-zinc-500 text-xs uppercase tracking-widest">คะแนนแต่ละช่อง</span>
            <div className="grid grid-cols-5 gap-2">
              {scores.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-zinc-600 text-[10px]">#{i + 1}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && calculate()}
                    className="w-full h-12 rounded border-2 border-zinc-600
                      bg-white text-black font-extrabold text-base text-center
                      outline-none focus:border-zinc-400 transition-colors
                      [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                      [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bonus note */}
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span className="w-[3px] h-3 bg-zinc-700 flex-shrink-0" />
            โบนัสคงที่ {BONUS.toLocaleString()} แต้ม บวกเข้าอัตโนมัติ
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={calculate}
              className="flex-1 h-11 rounded bg-[#e60a3d] text-white font-extrabold text-base
                cursor-pointer hover:brightness-110 active:scale-[0.985] transition-all"
            >
              คำนวณ
            </button>
            <button
              type="button"
              onClick={reset}
              className="h-11 px-6 rounded border border-zinc-700
                text-zinc-400 font-extrabold text-base bg-transparent
                cursor-pointer hover:bg-zinc-900/50 hover:text-zinc-200 active:scale-[0.985] transition-all"
            >
              Reset
            </button>
          </div>

          {/* Result */}
          {total !== null && (
            <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
              <span className="text-zinc-500 text-sm">แต้มรวมทั้งหมด</span>
              <span className="text-white font-extrabold tabular-nums"
                style={{ fontSize: 'clamp(28px, 5vw, 42px)' }}>
                {total.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
