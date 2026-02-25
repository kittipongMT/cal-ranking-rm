// src/lib/storage.ts
import { sections } from '../config'
import type { AppState } from '../types'
import type { SectionId } from '../config'

export const STORAGE_KEY = 'rm_rank_calc_split_v1'

export function emptyState(): AppState {
  return {
    bonus: 1200,
    sections: {
      extream: Array(8).fill(''),
      sport: Array(7).fill(''),
      standard: Array(7).fill(''),
    },
    locked: {
      extream: Array(8).fill(false),
      sport: Array(7).fill(false),
      standard: Array(7).fill(false),
    },
    cars: {
      extream: Array(8).fill(''),
      sport: Array(7).fill(''),
      standard: Array(7).fill(''),
    },
    customCars: {
      extream: [],
      sport: [],
      standard: [],
    },
    ocrCars: {
      extream: Array(8).fill(false),
      sport: Array(7).fill(false),
      standard: Array(7).fill(false),
    },
  }
}

/** Ensure all fields are present (handles old state missing new fields) */
export function normalizeState(partial: Partial<AppState>): AppState {
  const base = emptyState()
  for (const sec of sections) {
    const s = sec.id as SectionId
    if (Array.isArray(partial.sections?.[s]))
      base.sections[s] = partial.sections[s].slice(0, base.sections[s].length)
    if (Array.isArray(partial.locked?.[s]))
      base.locked[s] = partial.locked[s].slice(0, base.locked[s].length)
    if (Array.isArray(partial.cars?.[s]))
      base.cars[s] = partial.cars[s].slice(0, base.cars[s].length)
    if (Array.isArray(partial.customCars?.[s]))
      base.customCars[s] = partial.customCars[s]
    if (Array.isArray(partial.ocrCars?.[s]))
      base.ocrCars[s] = partial.ocrCars[s].slice(0, base.ocrCars[s].length)
  }
  if (Number.isFinite(Number(partial.bonus))) base.bonus = Number(partial.bonus)
  return base
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return normalizeState(parsed)
  } catch {
    return emptyState()
  }
}

export function saveStateToStorage(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
