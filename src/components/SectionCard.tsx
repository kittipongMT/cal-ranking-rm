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
    <div className="flex flex-col rounded-none
      border border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.8)]
      min-h-0 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#0c0c0c]/90 border-b border-white/[0.08] flex-shrink-0">
        <span className="flex-shrink-0 w-[3px] h-5 bg-[#e60a3d]" />
        <span className="text-white font-extrabold text-[14px] uppercase tracking-widest">{label}</span>
        <span className="text-[10px] text-zinc-500 font-semibold">{badgeText}</span>
        {hasDebug && (
          <button
            type="button"
            onClick={onShowDebug}
            title="ดู OCR Debug"
            className="flex items-center gap-1 h-6 px-2 rounded
              bg-white/5 text-zinc-400 text-[10px] cursor-pointer
              hover:bg-white/10 hover:text-zinc-200 active:scale-[0.97] transition-all"
          >
            <EyeIcon />
            Debug
          </button>
        )}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="ml-auto flex items-center gap-1 h-6 px-2 rounded
            bg-white/5 text-zinc-400 text-[11px] cursor-pointer
            hover:bg-white/10 hover:text-zinc-200 active:scale-[0.97] transition-all"
        >
          + รถ
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col p-3 min-h-0 flex-1 bg-[#0c0c0c]/70">

        {/* Import area */}
        {isImporting ? (
          <div className="mb-3 flex-shrink-0 rounded border border-zinc-700
            bg-zinc-900/50 px-3 py-2.5">
            <div className="flex items-center justify-between text-white text-xs font-bold mb-2">
              <span>กำลังอ่านแต้มจากรูป...</span>
              <span className="inline-block w-3.5 h-3.5 border-2 border-zinc-600
                border-t-zinc-300 rounded-full animate-spin" />
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-zinc-600 to-zinc-400
                rounded-full animate-pulse" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onImport(sectionId)}
            className="mb-3 flex-shrink-0 w-full flex items-center justify-center gap-2
              py-2 rounded border border-dashed border-zinc-700
              bg-transparent text-zinc-300 font-bold text-[13px]
              hover:bg-zinc-900 hover:border-zinc-500 hover:text-white
              active:scale-[0.99] transition-all cursor-pointer"
          >
            <CameraIcon />
            Import จากรูปเกม
          </button>
        )}

        {/* Empty hint */}
        {isEmpty && !isImporting && (
          <p className="text-[12px] text-center text-zinc-700 mb-2 leading-relaxed flex-shrink-0">
            กด <span className="text-zinc-500 font-semibold">Import</span> หรือพิมพ์แต้มด้านล่าง
          </p>
        )}

        {/* Car rows */}
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
