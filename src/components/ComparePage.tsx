// src/components/ComparePage.tsx
import { useState } from 'react'
import { sections } from '../config'
import type { SectionId } from '../config'

type Scores = Record<SectionId, string[]>

const SLOTS = 5

function makeEmpty(): Scores {
  const out = {} as Scores
  for (const sec of sections) out[sec.id] = Array(SLOTS).fill('')
  return out
}

function sum(arr: string[]) {
  return arr.reduce((a, v) => a + (Number(v) || 0), 0)
}

export default function ComparePage() {
  const [mine, setMine] = useState<Scores>(makeEmpty)
  const [theirs, setTheirs] = useState<Scores>(makeEmpty)
  const [compared, setCompared] = useState(false)

  function setVal(who: 'mine' | 'theirs', secId: SectionId, i: number, val: string) {
    const setter = who === 'mine' ? setMine : setTheirs
    setter((prev) => {
      const next = { ...prev, [secId]: [...prev[secId]] }
      next[secId][i] = val
      return next
    })
  }

  function reset() {
    setMine(makeEmpty())
    setTheirs(makeEmpty())
    setCompared(false)
  }

  const myGrand = sections.reduce((a, s) => a + sum(mine[s.id]), 0)
  const theirGrand = sections.reduce((a, s) => a + sum(theirs[s.id]), 0)
  const grandDiff = myGrand - theirGrand

  return (
    <main className="max-w-[1320px] mx-auto px-3 py-6 flex flex-col gap-4">

      {/* 3 section columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sections.map((sec) => {
          const mySum = sum(mine[sec.id])
          const theirSum = sum(theirs[sec.id])
          const secDiff = mySum - theirSum

          return (
            <div key={sec.id}
              className="rounded-none bg-[#0c0c0c] border border-white/[0.07]
                shadow-[0_4px_24px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">

              {/* Header */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.08] flex-shrink-0">
                <span className="flex-shrink-0 w-[3px] h-5 bg-[#e60a3d]" />
                <span className="text-white font-extrabold text-[13px] uppercase tracking-widest">{sec.label}</span>
                <span className="text-zinc-600 text-[10px]">{SLOTS} ช่อง</span>
              </div>

              <div className="p-3 flex flex-col gap-3 flex-1">

                {/* เรา */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e60a3d]" />
                    <span className="text-[#e60a3d] text-[10px] font-extrabold uppercase tracking-widest">เรา</span>
                    {compared && (
                      <span className="ml-auto text-white font-extrabold text-sm tabular-nums">
                        {mySum.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {mine[sec.id].map((v, i) => (
                      <input
                        key={i}
                        type="number"
                        inputMode="numeric"
                        value={v}
                        onChange={(e) => setVal('mine', sec.id, i, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setCompared(true)}
                        placeholder={`${i + 1}`}
                        className="w-full h-9 rounded border-2 border-zinc-500
                          bg-white text-black font-bold text-sm text-center outline-none
                          focus:border-zinc-300 transition-colors
                          [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    ))}
                  </div>
                </div>

                {/* Divider + section diff */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  {compared ? (
                    <span className={`text-[11px] font-extrabold tabular-nums px-2 py-0.5 rounded
                      ${secDiff > 0 ? 'text-[#e60a3d] bg-[#e60a3d]/10'
                        : secDiff < 0 ? 'text-zinc-300 bg-zinc-800'
                        : 'text-zinc-600 bg-zinc-900'}`}>
                      {secDiff > 0 ? `+${secDiff.toLocaleString()}` : secDiff === 0 ? '=' : secDiff.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-zinc-800 text-[10px]">vs</span>
                  )}
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                {/* คนอื่น */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                    <span className="text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest">คนอื่น</span>
                    {compared && (
                      <span className="ml-auto text-zinc-300 font-extrabold text-sm tabular-nums">
                        {theirSum.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {theirs[sec.id].map((v, i) => (
                      <input
                        key={i}
                        type="number"
                        inputMode="numeric"
                        value={v}
                        onChange={(e) => setVal('theirs', sec.id, i, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setCompared(true)}
                        placeholder={`${i + 1}`}
                        className="w-full h-9 rounded border-2 border-zinc-600
                          bg-white text-black font-bold text-sm text-center outline-none
                          focus:border-zinc-400 transition-colors
                          [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>

      {/* Action + Grand Total */}
      <div className="rounded-none bg-[#0c0c0c] border border-white/[0.07]
        shadow-[0_4px_24px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-4 flex flex-col gap-4">

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCompared(true)}
              className="flex-1 h-11 rounded bg-[#e60a3d] text-white font-extrabold text-base
                cursor-pointer hover:brightness-110 active:scale-[0.985] transition-all"
            >
              เปรียบเทียบ
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

          {compared && (
            <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">รวมทุก Class — เรา</span>
                  <span className={`font-extrabold tabular-nums text-3xl
                    ${grandDiff >= 0 ? 'text-[#e60a3d]' : 'text-white'}`}>
                    {myGrand.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-zinc-700">ผลต่างรวม</span>
                  <span className={`font-extrabold tabular-nums text-xl
                    ${grandDiff > 0 ? 'text-[#e60a3d]' : grandDiff < 0 ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {grandDiff > 0 ? `+${grandDiff.toLocaleString()}` : grandDiff === 0 ? '=' : grandDiff.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">รวมทุก Class — คนอื่น</span>
                  <span className={`font-extrabold tabular-nums text-3xl
                    ${grandDiff < 0 ? 'text-[#e60a3d]' : 'text-zinc-300'}`}>
                    {theirGrand.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={`text-center py-2.5 rounded text-sm font-extrabold tracking-wider uppercase
                ${grandDiff > 0
                  ? 'bg-[#e60a3d]/10 text-[#e60a3d]'
                  : grandDiff < 0
                  ? 'bg-zinc-900 text-zinc-400'
                  : 'bg-zinc-900 text-zinc-500'}`}>
                {grandDiff > 0
                  ? `เราชนะ +${grandDiff.toLocaleString()} แต้ม 🏆`
                  : grandDiff < 0
                  ? `คนอื่นชนะ ${Math.abs(grandDiff).toLocaleString()} แต้ม`
                  : 'เสมอกัน'}
              </div>
            </div>
          )}
        </div>
      </div>

    </main>
  )
}
