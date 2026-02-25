// src/types.ts
import type { SectionId } from './config'

export interface AppState {
  bonus: number
  sections: Record<SectionId, string[]>
  locked: Record<SectionId, boolean[]>
  cars: Record<SectionId, string[]>
  customCars: Record<SectionId, string[]>
  /** Slots whose car name was set by OCR import — cannot be edited manually */
  ocrCars: Record<SectionId, boolean[]>
}

export interface RankResult {
  hat: string
  image: string
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
