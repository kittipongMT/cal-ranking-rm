// src/components/SummaryCard.tsx
import type { CalcResult } from '../types'
import { STEP_POINTS } from '../config'

interface SummaryCardProps {
  bonus: number
  onBonusChange: (val: number) => void
  onCalc: () => void
  onReset: () => void
  result: CalcResult | null
  isCalculating: boolean
}

export default function SummaryCard({
  bonus,
  onBonusChange,
  onCalc,
  onReset,
  result,
  isCalculating,
}: SummaryCardProps) {
  return (
    <div className="flex flex-col rounded-[18px] bg-gradient-to-b from-[#0b0b0b] to-[#101010]
      border border-[rgba(223,205,128,0.22)] shadow-[0_10px_30px_rgba(0,0,0,0.55)]
      p-3 min-h-0 min-w-[280px]">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <span className="text-[#dfcd80] font-bold text-[17px]">สรุปผล</span>
        <span className="text-[12px] text-black bg-[#dfcd80] rounded-full px-[10px] py-[2px] font-bold">
          คำนวณ
        </span>
      </div>

      <div className="flex flex-col gap-[10px]">
        {/* Bonus + buttons grid */}
        <div className="rounded-2xl border border-dashed border-[rgba(223,205,128,0.35)]
          bg-white/[0.04] p-3 grid gap-3">

          {/* Bonus row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#dfcd80] font-bold whitespace-nowrap text-sm">
              แต้มบวกพิเศษจากเกม
            </span>
            <input
              type="number"
              value={bonus}
              onChange={(e) => onBonusChange(Number(e.target.value))}
              className="w-[110px] h-[42px] rounded-xl border-2 border-[#dfcd80]
                bg-white text-black font-extrabold text-base text-center
                outline-none [appearance:textfield]
                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-[10px]">
            <button
              type="button"
              onClick={onCalc}
              disabled={isCalculating}
              className="h-[46px] rounded-[14px] bg-[#dfcd80] text-black font-extrabold text-base
                cursor-pointer hover:brightness-[1.03] active:scale-[0.985] transition-all
                disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  คำนวณ...
                  <span className="inline-block w-4 h-4 border-2 border-black/35
                    border-t-black/85 rounded-full animate-spin-fast" />
                </>
              ) : (
                'คำนวณ'
              )}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="h-[46px] rounded-[14px] border border-[rgba(223,205,128,0.55)]
                text-[#dfcd80] font-extrabold text-base bg-transparent
                cursor-pointer hover:bg-[rgba(223,205,128,0.08)] active:scale-[0.985] transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-[18px] border border-[rgba(223,205,128,0.25)]
          bg-white/[0.04] p-[14px]">
          <div className="flex justify-between items-baseline gap-2 flex-wrap mb-1">
            <h2 className="m-0 text-[18px] text-[#dfcd80] font-extrabold">ผลลัพธ์แรงค์</h2>
            <span className="text-[#eaeaea] text-sm font-mono tabular-nums">
              {result
                ? `รวมแต้ม: ${result.total.toLocaleString()} (ช่องรวม ${result.sum.toLocaleString()} + โบนัส ${result.bonus.toLocaleString()})`
                : 'รวมแต้ม: -'}
            </span>
          </div>

          <div className="mt-1.5 text-[22px] font-extrabold text-white">
            {result
              ? `${result.rank.hat} ${result.rank.stepInHat} (${result.rank.inStep}/${result.rank.stepMax})`
              : '-'}
          </div>

          <div className="mt-1.5 text-[#a9a9a9] text-[13px] leading-[1.45]">
            {result
              ? `คำนวณจาก 1 ขั้น = ${STEP_POINTS} แต้ม • อยู่ใน "${result.rank.hat}" ขั้นที่ ${result.rank.stepInHat} / ${result.rank.hatSteps}`
              : `ระบบ: 1 ขั้น = ${STEP_POINTS} แต้ม • จะคำนวณจาก "แต้มทุกช่อง + แต้มพิเศษ"`}
          </div>
        </div>
      </div>
    </div>
  )
}
