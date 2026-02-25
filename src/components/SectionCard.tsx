// src/components/SectionCard.tsx
import { useState } from 'react'
import { CameraIcon } from './icons'
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
  onStateChange: (updater: (prev: AppState) => AppState) => void
  onImport: (sectionId: SectionId) => void
  onCalc: () => void
}

export default function SectionCard({
  sectionId,
  label,
  badgeText,
  state,
  isImporting,
  onStateChange,
  onImport,
  onCalc,
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

  return (
    <div className="flex flex-col rounded-[18px] bg-gradient-to-b from-[#0b0b0b] to-[#101010]
      border border-[rgba(223,205,128,0.22)] shadow-[0_10px_30px_rgba(0,0,0,0.55)]
      p-3 min-h-0">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <span className="text-[#dfcd80] font-bold text-[17px]">{label}</span>
        <span className="text-[12px] text-black bg-[#dfcd80] rounded-full px-[10px] py-[2px] font-bold">
          {badgeText}
        </span>

        {/* Import button */}
        <button
          type="button"
          onClick={() => onImport(sectionId)}
          disabled={isImporting}
          className="ml-auto flex items-center gap-1.5 h-7 px-[10px] rounded-full
            border border-[rgba(223,205,128,0.55)] bg-[rgba(223,205,128,0.10)]
            text-[#dfcd80] font-extrabold text-[12px] cursor-pointer
            hover:bg-[rgba(223,205,128,0.16)] active:scale-[0.98] transition-all
            disabled:opacity-50 disabled:cursor-wait"
        >
          <CameraIcon />
          Import
        </button>

        {/* Add car button */}
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 h-7 px-[10px] rounded-full
            border border-[rgba(223,205,128,0.55)] bg-[rgba(223,205,128,0.10)]
            text-[#dfcd80] font-extrabold text-[12px] cursor-pointer
            hover:bg-[rgba(223,205,128,0.16)] active:scale-[0.98] transition-all"
        >
          + Add
        </button>
      </div>

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
