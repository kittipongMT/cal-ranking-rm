// src/components/SummaryCard.tsx
import type { CalcResult } from '../types'
import type { SectionId } from '../config'
import { STEP_POINTS, sections } from '../config'

// Load all rank images from src/images/rank*.png
const rankImages = import.meta.glob<{ default: string }>('../images/rank*.png', { eager: true })
function getRankImageUrl(filename: string): string {
  const entry = rankImages[`../images/${filename}`]
  return entry?.default ?? ''
}

interface SummaryCardProps {
  bonus: number
  sectionTotals: Record<SectionId, number>
  onBonusChange: (val: number) => void
  onCalc: () => void
  onReset: () => void
  result: CalcResult | null
  isCalculating: boolean
}

function hatColor(name: string): string {
  if (name.includes('เทา')) return '#9ca3af'
  if (name.includes('เขียวอ่อน')) return '#86efac'
  if (name.includes('เขียวเข้ม')) return '#22c55e'
  if (name.includes('ฟ้า')) return '#60a5fa'
  if (name.includes('ม่วง')) return '#c084fc'
  if (name.includes('ส้ม')) return '#fb923c'
  if (name.includes('แดงทอง')) return '#f97316'
  if (name.includes('แดง')) return '#f87171'
  if (name.includes('เขียวทอง')) return '#a3e635'
  return '#dfcd80'
}

export default function SummaryCard({
  bonus,
  sectionTotals,
  onBonusChange,
  onCalc,
  onReset,
  result,
  isCalculating,
}: SummaryCardProps) {
  const color = result ? hatColor(result.rank.hat) : '#dfcd80'
  const progressPct = result
    ? Math.round((result.rank.inStep / result.rank.stepMax) * 100)
    : 0

  return (
    <div className="rounded-[18px] bg-gradient-to-b from-[#0b0b0b] to-[#101010]
      border border-[rgba(223,205,128,0.22)] shadow-[0_10px_30px_rgba(0,0,0,0.55)] p-4">

      {/* Breakdown row */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-3.5
        border-b border-[rgba(223,205,128,0.10)]">
        {sections.map((sec) => (
          <div key={sec.id}
            className="flex items-center gap-2 bg-zinc-900/80 rounded-xl px-3 py-1.5
              border border-zinc-800">
            <span className="text-zinc-500 text-xs">{sec.label}</span>
            <span className="text-white font-bold text-sm tabular-nums tracking-tight">
              {sectionTotals[sec.id].toLocaleString()}
            </span>
          </div>
        ))}

        <span className="text-zinc-700 text-sm font-light">+</span>

        <div className="flex items-center gap-2 bg-zinc-900/80 rounded-xl px-3 py-1.5
          border border-zinc-800">
          <span className="text-zinc-500 text-xs">โบนัส</span>
          <span className="text-white font-bold text-sm tabular-nums">{bonus.toLocaleString()}</span>
        </div>

        {result && (
          <>
            <span className="text-zinc-700 text-sm font-light">=</span>
            <div className="flex items-center gap-2 bg-zinc-900/80 rounded-xl px-3 py-1.5
              border border-[rgba(223,205,128,0.28)]">
              <span className="text-[#dfcd80] text-xs">รวม</span>
              <span className="text-[#dfcd80] font-extrabold text-sm tabular-nums">
                {result.total.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Rank + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">

        {/* Rank display */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-2">
            อันดับปัจจุบัน
          </div>
          <div className="flex items-center gap-3 mb-1">
            {result && (
              <img
                key={result.rank.image}
                src={getRankImageUrl(result.rank.image)}
                alt={result.rank.hat}
                className="w-14 h-14 object-contain flex-shrink-0 drop-shadow-lg
                  transition-all duration-500"
              />
            )}
            <div
              className="font-extrabold leading-none truncate transition-colors duration-500"
              style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', color }}
            >
              {result ? result.rank.hat : '—'}
            </div>
          </div>
          <div className="text-zinc-400 text-sm font-medium mb-3">
            {result
              ? `ขั้นที่ ${result.rank.stepInHat} จาก ${result.rank.hatSteps} ขั้น`
              : 'กรอกแต้มหรือ Import รูปเกม แล้วกดคำนวณ'}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: `linear-gradient(90deg, ${color}60, ${color})`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-600">
                {result
                  ? `${result.rank.inStep.toLocaleString()} / ${result.rank.stepMax.toLocaleString()} แต้มในขั้นนี้`
                  : `ระบบ: 1 ขั้น = ${STEP_POINTS} แต้ม`}
              </span>
              {result && (
                <span className="font-bold tabular-nums" style={{ color }}>
                  {progressPct}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
          {/* Bonus input */}
          <div className="flex items-center gap-2">
            <label className="text-[#dfcd80] text-[11px] font-bold whitespace-nowrap hidden sm:block">
              โบนัสพิเศษ
            </label>
            <input
              type="number"
              value={bonus}
              onChange={(e) => onBonusChange(Number(e.target.value))}
              placeholder="โบนัส"
              className="w-[88px] h-10 rounded-xl border-2 border-[#dfcd80]
                bg-white text-black font-extrabold text-sm text-center
                outline-none [appearance:textfield]
                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCalc}
              disabled={isCalculating}
              className="h-10 px-5 rounded-[12px] bg-[#dfcd80] text-black font-extrabold text-sm
                cursor-pointer hover:brightness-[1.05] active:scale-[0.985] transition-all
                disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-1.5
                whitespace-nowrap"
            >
              {isCalculating ? (
                <>
                  คำนวณ...
                  <span className="inline-block w-3.5 h-3.5 border-2 border-black/30
                    border-t-black/80 rounded-full animate-spin" />
                </>
              ) : 'คำนวณ'}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="h-10 px-4 rounded-[12px] border border-[rgba(223,205,128,0.45)]
                text-[#dfcd80] font-extrabold text-sm bg-transparent
                cursor-pointer hover:bg-[rgba(223,205,128,0.08)] active:scale-[0.985] transition-all
                whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}