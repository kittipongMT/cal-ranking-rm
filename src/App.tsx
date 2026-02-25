// src/App.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SectionCard from './components/SectionCard'
import SummaryCard from './components/SummaryCard'
import AuthButton from './components/AuthButton'
import OcrDebugModal from './components/OcrDebugModal'
import { sections } from './config'
import logoUrl from './images/image.png'
import type { SectionId } from './config'
import type { AppState, CalcResult } from './types'
import { loadState, saveStateToStorage, emptyState, normalizeState } from './lib/storage'
import { pointsToRank } from './lib/calc'
import { importScreenshot, matchCarName } from './lib/ocr'
import { getCarsForSection } from './lib/cars'
import {
  signInGoogle,
  signOutUser,
  loadCloudState,
  saveStateDebounced,
  onAuthChanged,
  type User,
} from './lib/cloud'

export default function App() {
  const [state, setStateRaw] = useState<AppState>(() => loadState())
  const [result, setResult] = useState<CalcResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [importingSection, setImportingSection] = useState<SectionId | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [debugModal, setDebugModal] = useState<{
    imageUrl: string
    sectionId: SectionId
    points: string[]
    badgeRightEdges: (number | null)[]
  } | null>(null)

  // Keep last debug data per section so users can re-open after closing
  const [savedDebug, setSavedDebug] = useState<
    Partial<Record<SectionId, {
      imageUrl: string
      sectionId: SectionId
      points: string[]
      badgeRightEdges: (number | null)[]
    }>>
  >({})

  const userRef = useRef<User | null>(null)
  userRef.current = user

  // Per-section point totals for the summary card
  const sectionTotals = useMemo(() => {
    const out = {} as Record<SectionId, number>
    for (const sec of sections) {
      out[sec.id] = state.sections[sec.id].reduce((a, v) => a + (Number(v) || 0), 0)
    }
    return out
  }, [state.sections])

  // Persist state on change
  function setState(updater: AppState | ((prev: AppState) => AppState)) {
    setStateRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveStateToStorage(next)
      saveStateDebounced(userRef.current, next)
      return next
    })
  }

  // Calculate rank
  const calc = useCallback((currentState?: AppState) => {
    const s = currentState ?? state
    setIsCalculating(true)
    setTimeout(() => {
      let sum = 0
      for (const sec of sections) {
        for (const v of s.sections[sec.id]) {
          const n = Number(v)
          if (Number.isFinite(n)) sum += n
        }
      }
      const bonusVal = Number.isFinite(s.bonus) ? s.bonus : 0
      const total = sum + bonusVal
      const rank = pointsToRank(total)
      setResult({ sum, bonus: bonusVal, total, rank })
      setIsCalculating(false)
    }, 350)
  }, [state])

  // Reset unlocked fields
  function resetUnlocked() {
    setState((prev) => {
      const next = { ...prev }
      next.sections = { ...prev.sections }
      next.cars = { ...prev.cars }
      next.ocrCars = { ...(prev.ocrCars ?? {}) }
      for (const sec of sections) {
        next.sections[sec.id] = prev.sections[sec.id].map((v, i) =>
          prev.locked[sec.id][i] ? v : ''
        )
        next.cars[sec.id] = prev.cars[sec.id].map((v, i) =>
          prev.locked[sec.id][i] ? v : ''
        )
        next.ocrCars[sec.id] = (prev.ocrCars?.[sec.id] ?? []).map((v, i) =>
          prev.locked[sec.id][i] ? v : false
        )
      }
      return next
    })
    setResult(null)
  }

  // OCR import
  async function handleImport(sectionId: SectionId) {
    if (importingSection) return
    setImportingSection(sectionId)
    try {
      const { points, carNames, debugLog, imageUrl, badgeRightEdges } = await importScreenshot(sectionId, () => {})
      if (!points.length) return

      setState((prev) => {
        const arr = [...prev.sections[sectionId]]
        points.forEach((p, i) => { if (i < arr.length) arr[i] = p })

        // Apply detected car names (mark as OCR-imported)
        const carsArr = [...prev.cars[sectionId]]
        const ocrArr = [...(prev.ocrCars?.[sectionId] ?? [])]
        const knownCars = getCarsForSection(sectionId, prev)
        carNames.forEach((name, i) => {
          if (i < carsArr.length) {
            const matched = matchCarName(name, knownCars)
            if (matched) {
              carsArr[i] = matched
              ocrArr[i] = true
            }
          }
        })
        const next: AppState = {
          ...prev,
          sections: { ...prev.sections, [sectionId]: arr },
          cars: { ...prev.cars, [sectionId]: carsArr },
          ocrCars: { ...prev.ocrCars, [sectionId]: ocrArr },
        }
        setTimeout(() => calc(next), 400)
        return next
      })

      // Show debug modal always so user can verify boxes
      const debugData = { imageUrl, sectionId, points, badgeRightEdges }
      setDebugModal(debugData)
      // Save for re-open — revoke old URL for this section first
      setSavedDebug((prev) => {
        if (prev[sectionId]) URL.revokeObjectURL(prev[sectionId]!.imageUrl)
        return { ...prev, [sectionId]: debugData }
      })

      const ok = points.filter(Boolean).length
      const failedSlots = points
        .map((p, i) => (!p ? `#${i + 1}: ${debugLog[i] ?? '-'}` : null))
        .filter(Boolean)

      if (failedSlots.length) {
        console.warn(`[OCR] Failed slots:\n${failedSlots.join('\n')}`)
      }
      console.log(`[OCR] ${sectionId} done: ${ok}/${points.length}`)
    } catch (e) {
      console.error(e)
      alert('Import ไม่สำเร็จ ❌\nเช็ก Console ได้ (F12) ว่ามี error อะไร')
    } finally {
      setImportingSection(null)
    }
  }

  // Firebase auth
  useEffect(() => {
    const unsub = onAuthChanged(async (u) => {
      setUser(u)
      if (!u) return
      try {
        const cloudState = await loadCloudState(u)
        if (cloudState) {
          const normalized = normalizeState(cloudState)
          setStateRaw(normalized)
          saveStateToStorage(normalized)
          calc(normalized)
        } else {
          // push local state to cloud
          saveStateDebounced(u, state)
        }
      } catch (e) {
        console.warn('Cloud load failed:', e)
      }
    })
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Calc on mount
  useEffect(() => {
    calc(state)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-black text-[#eaeaea] font-kanit">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm
        border-b border-[rgba(223,205,128,0.12)]">
        <div className="max-w-[1320px] mx-auto px-4 py-2.5 flex items-center gap-3">
          <img src={logoUrl} alt="Racing Master" className="w-8 h-8 rounded-lg object-cover" />
          <div className="flex flex-col leading-tight">
            <span className="text-[#dfcd80] font-bold text-sm tracking-wide">Racing Master</span>
            <span className="text-zinc-500 text-[11px]">คำนวณแต้มจัดอันดับ</span>
          </div>
          <div className="ml-auto">
            <AuthButton
              user={user}
              onSignIn={() => signInGoogle().catch(console.error)}
              onSignOut={() => signOutUser().catch(console.error)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1320px] mx-auto px-3 py-4 flex flex-col gap-3">
        {/* 3 section cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sections.map((sec) => (
            <SectionCard
              key={sec.id}
              sectionId={sec.id}
              label={sec.label}
              badgeText={`${sec.count} ช่อง`}
              state={state}
              isImporting={importingSection === sec.id}
              onStateChange={setState}
              onImport={handleImport}
              onCalc={() => calc()}
              hasDebug={!!savedDebug[sec.id]}
              onShowDebug={() => savedDebug[sec.id] && setDebugModal(savedDebug[sec.id]!)}
            />
          ))}
        </div>

        {/* Summary — full width below sections */}
        <SummaryCard
          bonus={state.bonus}
          sectionTotals={sectionTotals}
          onBonusChange={(val) => setState((prev) => ({ ...prev, bonus: val }))}
          onCalc={() => calc()}
          onReset={resetUnlocked}
          result={result}
          isCalculating={isCalculating}
        />
      </main>

      {/* OCR Debug Modal */}
      {debugModal && (
        <OcrDebugModal
          open={!!debugModal}
          imageUrl={debugModal.imageUrl}
          sectionId={debugModal.sectionId}
          points={debugModal.points}
          badgeRightEdges={debugModal.badgeRightEdges}
          onClose={() => setDebugModal(null)}
        />
      )}
    </div>
  )
}
