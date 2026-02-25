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
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    const base = emptyState()

    for (const sec of sections) {
      const s = sec.id as SectionId
      if (Array.isArray(parsed.sections?.[s]))
        base.sections[s] = parsed.sections[s].slice(0, base.sections[s].length)
      if (Array.isArray(parsed.locked?.[s]))
        base.locked[s] = parsed.locked[s].slice(0, base.locked[s].length)
      if (Array.isArray(parsed.cars?.[s]))
        base.cars[s] = parsed.cars[s].slice(0, base.cars[s].length)
      if (Array.isArray(parsed.customCars?.[s]))
        base.customCars[s] = parsed.customCars[s]
    }
    if (Number.isFinite(Number(parsed.bonus))) base.bonus = Number(parsed.bonus)

    return base
  } catch {
    return emptyState()
  }
}

export function saveStateToStorage(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
