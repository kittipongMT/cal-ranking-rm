// src/lib/calc.ts
import { STEP_POINTS, hats } from '../config'
import type { RankResult } from '../types'

export function pointsToRank(totalPoints: number): RankResult {
  if (!Number.isFinite(totalPoints) || totalPoints < 0) totalPoints = 0

  const totalStepsCompleted = Math.floor(totalPoints / STEP_POINTS)
  const inStep = totalPoints % STEP_POINTS

  let cum = 0
  for (const h of hats) {
    const next = cum + h.steps
    if (totalStepsCompleted < next) {
      const stepInHat = totalStepsCompleted - cum + 1
      return { hat: h.name, stepInHat, inStep, stepMax: STEP_POINTS, hatSteps: h.steps }
    }
    cum = next
  }

  const last = hats[hats.length - 1]
  return {
    hat: last.name,
    stepInHat: last.steps,
    inStep: STEP_POINTS - 1,
    stepMax: STEP_POINTS,
    hatSteps: last.steps,
  }
}
