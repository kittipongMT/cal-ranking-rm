// src/components/CarRow.tsx
import { useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { LockIcon, UnlockIcon, PencilIcon } from './icons'
import CarSelect from './CarSelect'
import CarDialog from './CarDialog'
import { getCarsForSection, lower, normName } from '../lib/cars'
import type { SectionId } from '../config'
import type { AppState } from '../types'

interface CarRowProps {
  index: number
  sectionId: SectionId
  value: string
  isLocked: boolean
  carValue: string
  state: AppState
  onValueChange: (val: string) => void
  onToggleLock: () => void
  onCarChange: (val: string) => void
  onAddCustomCar: (name: string) => void
  onCalc: () => void
}

export default function CarRow({
  index,
  sectionId,
  value,
  isLocked,
  carValue,
  state,
  onValueChange,
  onToggleLock,
  onCarChange,
  onAddCustomCar,
  onCalc,
}: CarRowProps) {
  const [editOpen, setEditOpen] = useState(false)

  const cars = getCarsForSection(sectionId, state)

  function handleEditConfirm(next: string) {
    const n = normName(next)
    if (!n) return
    const exists = cars.some((c) => lower(c) === lower(n))
    if (!exists) onAddCustomCar(n)
    onCarChange(n)
    setEditOpen(false)
  }

  return (
    <Tooltip.Provider delayDuration={400}>
      <div className={`flex gap-[6px] items-center ${isLocked ? 'locked-row' : ''}`}>
        {/* Number input */}
        <input
          type="number"
          inputMode="numeric"
          placeholder={`ใส่แต้ม #${index + 1}`}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCalc()}
          className="w-[130px] flex-shrink-0 h-10 rounded-xl border-2 border-[#dfcd80]
            bg-white text-black font-extrabold text-base text-center px-2 outline-none
            placeholder:text-gray-400 placeholder:font-semibold
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none"
        />

        {/* Lock button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={onToggleLock}
              className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center
                cursor-pointer transition-all active:scale-[0.97]
                ${
                  isLocked
                    ? 'border border-[rgba(223,205,128,0.65)] bg-[rgba(223,205,128,0.12)] text-[#dfcd80]'
                    : 'border border-white/20 bg-transparent text-white/80 hover:bg-white/5'
                }`}
            >
              {isLocked ? <LockIcon /> : <UnlockIcon />}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-zinc-800 text-zinc-200 text-xs rounded-lg px-2 py-1 shadow-lg"
              sideOffset={4}
            >
              {isLocked ? 'ล็อคอยู่ (Reset จะไม่ล้าง)' : 'ไม่ได้ล็อค'}
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Car select */}
        <CarSelect
          value={carValue}
          onChange={onCarChange}
          options={cars}
        />

        {/* Edit car name button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="w-10 h-10 flex-shrink-0 rounded-xl border border-[rgba(223,205,128,0.55)]
                bg-[rgba(223,205,128,0.10)] text-[#dfcd80]
                flex items-center justify-center cursor-pointer
                hover:bg-[rgba(223,205,128,0.18)] active:scale-[0.97] transition-all"
            >
              <PencilIcon />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-zinc-800 text-zinc-200 text-xs rounded-lg px-2 py-1 shadow-lg"
              sideOffset={4}
            >
              แก้ชื่อรถ / เพิ่มชื่อใหม่
              <Tooltip.Arrow className="fill-zinc-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Edit dialog */}
        <CarDialog
          open={editOpen}
          title="แก้ชื่อรถ"
          label="พิมพ์ชื่อรถที่ต้องการ (จะเพิ่มเข้า dropdown ถ้ายังไม่มี)"
          defaultValue={carValue}
          onConfirm={handleEditConfirm}
          onCancel={() => setEditOpen(false)}
        />
      </div>
    </Tooltip.Provider>
  )
}
