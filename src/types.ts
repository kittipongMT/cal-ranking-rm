// src/types.ts
import type { SectionId } from './config'

export interface AppState {
  bonus: number
  sections: Record<SectionId, string[]>
  locked: Record<SectionId, boolean[]>
  cars: Record<SectionId, string[]>
  customCars: Record<SectionId, string[]>
}

export interface RankResult {
  hat: string
  stepInHat: number
  inStep: number
  stepMax: number
  hatSteps: number
}

export interface CalcResult {
  sum: number
  bonus: number
  total: number
  rank: RankResult
}
