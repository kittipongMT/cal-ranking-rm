// src/lib/cars.ts
import { defaultCars } from '../config'
import type { SectionId } from '../config'
import type { AppState } from '../types'

export function normName(s: string): string {
  return String(s || '').trim()
}

export function lower(s: string): string {
  return normName(s).toLowerCase()
}

export function getCarsForSection(sectionId: SectionId, state: AppState): string[] {
  const base = defaultCars[sectionId] || []
  const extra = state.customCars?.[sectionId] || []
  const all = [...base, ...extra].map(normName).filter(Boolean)

  const seen = new Set<string>()
  const out: string[] = []
  for (const n of all) {
    const k = lower(n)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(n)
    }
  }
  return out
}
