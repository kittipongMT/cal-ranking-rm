// src/components/SectionCard.tsx
import { useState } from 'react'
import { CameraIcon, EyeIcon } from './icons'
import CarRow from './CarRow'
import CarDialog from './CarDialog'
import { getCarsForSection, lower, normName } from '../lib/cars'
import type { SectionId } from '../config'
import type { AppState } from '../types'

interface SectionCardProps {
  sectionId: SectionId
  label: string
  badgeText: string
  state: AppState
  isImporting: boolean
  hasDebug: boolean
  onStateChange: (updater: (prev: AppState) => AppState) => void
  onImport: (sectionId: SectionId) => void
  onCalc: () => void
  onShowDebug: () => void
}

export default function SectionCard({
  sectionId,
  label,
  badgeText,
  state,
  isImporting,
  hasDebug,
  onStateChange,
  onImport,
  onCalc,
  onShowDebug,
}: SectionCardProps) {
  const [addOpen, setAddOpen] = useState(false)

  const values = state.sections[sectionId]
  const locked = state.locked[sectionId]
  const cars = state.cars[sectionId]

  function updateSection(idx: number, field: 'sections' | 'locked' | 'cars', val: string | boolean) {
    onStateChange((prev) => {
      const arr = [...(prev[field][sectionId] as (string | boolean)[])]
      arr[idx] = val
      return {
        ...prev,
        [field]: { ...prev[field], [sectionId]: arr },
      }
    })
  }

  function addCustomCar(name: string) {
    const n = normName(name)
    if (!n) return
    const exists = getCarsForSection(sectionId, state).some((c) => lower(c) === lower(n))
    if (exists) return
    onStateChange((prev) => ({
      ...prev,
      customCars: {
        ...prev.customCars,
        [sectionId]: [...(prev.customCars[sectionId] || []), n],
      },
    }))
  }

  function handleAddConfirm(name: string) {
    const n = normName(name)
    if (!n) return
    const exists = getCarsForSection(sectionId, state).some((c) => lower(c) === lower(n))
    if (!exists) addCustomCar(n)
    setAddOpen(false)
  }

  const isEmpty = values.every((v) => !v)

  return (
    <div className="flex flex-col rounded-[18px] bg-gradient-to-b from-[#0b0b0b] to-[#101010]
      border border-[rgba(223,205,128,0.22)] shadow-[0_10px_30px_rgba(0,0,0,0.55)]
      p-3 min-h-0">

      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5 flex-shrink-0">
        <span className="text-[#dfcd80] font-bold text-[17px]">{label}</span>
        <span className="text-[12px] text-black bg-[#dfcd80] rounded-full px-[10px] py-[2px] font-bold">
          {badgeText}
        </span>
        {hasDebug && (
          <button
            type="button"
            onClick={onShowDebug}
            title="ดู OCR Debug"
            className="flex items-center gap-1 h-6 px-[8px] rounded-full
              border border-[rgba(120,200,255,0.4)] bg-[rgba(120,200,255,0.08)]
              text-sky-400 text-[11px] cursor-pointer
              hover:bg-[rgba(120,200,255,0.18)] hover:border-[rgba(120,200,255,0.65)]
              active:scale-[0.97] transition-all"
          >
            <EyeIcon />
            ดูรูปที่อัพโหลด
          </button>
        )}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="ml-auto flex items-center gap-1 h-6 px-[8px] rounded-full
            border border-[rgba(223,205,128,0.35)] bg-transparent
            text-[#dfcd80]/60 text-[11px] cursor-pointer
            hover:bg-[rgba(223,205,128,0.10)] hover:text-[#dfcd80] active:scale-[0.97] transition-all"
        >
          + รถ
        </button>
      </div>

      {/* Import area */}
      {isImporting ? (
        <div className="mb-3 flex-shrink-0 rounded-xl border border-[rgba(223,205,128,0.25)]
          bg-[rgba(223,205,128,0.05)] px-3 py-2.5">
          <div className="flex items-center justify-between text-[#dfcd80] text-xs font-bold mb-2">
            <span>กำลังอ่านแต้มจากรูป...</span>
            <span className="inline-block w-3.5 h-3.5 border-2 border-[#dfcd80]/30
              border-t-[#dfcd80] rounded-full animate-spin" />
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-[#dfcd80]/60 to-[#dfcd80]
              rounded-full animate-pulse" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onImport(sectionId)}
          className="mb-3 flex-shrink-0 w-full flex items-center justify-center gap-2
            py-2.5 rounded-xl border border-dashed border-[rgba(223,205,128,0.4)]
            bg-[rgba(223,205,128,0.04)] text-[#dfcd80] font-bold text-[13px]
            hover:bg-[rgba(223,205,128,0.10)] hover:border-[rgba(223,205,128,0.65)]
            active:scale-[0.99] transition-all cursor-pointer"
        >
          <CameraIcon />
          Import จากรูปเกม
        </button>
      )}

      {/* Empty hint — shown above rows when no data yet */}
      {isEmpty && !isImporting && (
        <p className="text-[12px] text-center text-zinc-600 mb-2 leading-relaxed flex-shrink-0">
          กด <span className="text-[#dfcd80]/50 font-semibold">Import</span> หรือพิมพ์แต้มด้านล่าง
        </p>
      )}

      {/* Car rows — always visible */}
      <div className="flex flex-col gap-[10px] overflow-auto section-scroll min-h-0 pr-1">
        {values.map((val, i) => (
          <CarRow
            key={i}
            index={i}
            sectionId={sectionId}
            value={val}
            isLocked={locked[i]}
            carValue={cars[i]}
            isOcrCar={!!(state.ocrCars?.[sectionId]?.[i])}
            state={state}
            onValueChange={(v) => updateSection(i, 'sections', v)}
            onToggleLock={() => updateSection(i, 'locked', !locked[i])}
            onCarChange={(v) => updateSection(i, 'cars', v)}
            onAddCustomCar={addCustomCar}
            onCalc={onCalc}
          />
        ))}
      </div>

      {/* Add car dialog */}
      <CarDialog
        open={addOpen}
        title={`เพิ่มรถในหมวด ${label}`}
        label="พิมพ์ชื่อรถที่ต้องการเพิ่มเข้า dropdown"
        onConfirm={handleAddConfirm}
        onCancel={() => setAddOpen(false)}
      />
    </div>
  )
}
