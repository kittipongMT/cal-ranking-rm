// src/App.tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import SectionCard from './components/SectionCard'
import SummaryCard from './components/SummaryCard'
import AuthButton from './components/AuthButton'
import OcrDebugModal from './components/OcrDebugModal'
import { sections } from './config'
import type { SectionId } from './config'
import type { AppState, CalcResult } from './types'
import { loadState, saveStateToStorage, emptyState } from './lib/storage'
import { pointsToRank } from './lib/calc'
import { importScreenshot } from './lib/ocr'
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

  const userRef = useRef<User | null>(null)
  userRef.current = user

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
      for (const sec of sections) {
        next.sections[sec.id] = prev.sections[sec.id].map((v, i) =>
          prev.locked[sec.id][i] ? v : ''
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
      const { points, debugLog, imageUrl, badgeRightEdges } = await importScreenshot(sectionId, () => {})
      if (!points.length) return

      setState((prev) => {
        const arr = [...prev.sections[sectionId]]
        points.forEach((p, i) => { if (i < arr.length) arr[i] = p })
        const next: AppState = {
          ...prev,
          sections: { ...prev.sections, [sectionId]: arr },
        }
        setTimeout(() => calc(next), 400)
        return next
      })

      // Show debug modal always so user can verify boxes
      setDebugModal({ imageUrl, sectionId, points, badgeRightEdges })

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
          setStateRaw(cloudState)
          saveStateToStorage(cloudState)
          calc(cloudState)
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
    <div className="min-h-screen bg-black text-[#eaeaea] font-kanit flex justify-center
      overflow-y-auto -webkit-overflow-scrolling-touch px-[14px] py-4">

      <div className="w-full max-w-[1320px] flex flex-col">
        {/* Auth button */}
        <AuthButton
          user={user}
          onSignIn={() => signInGoogle().catch(console.error)}
          onSignOut={() => signOutUser().catch(console.error)}
        />

        {/* Title */}
        <h1 className="text-center text-[#dfcd80] text-[26px] font-bold tracking-[0.2px]
          mt-1.5 mb-3">
          คำนวณแต้มจัดอันดับ
        </h1>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 flex-1 min-h-0">
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
            />
          ))}

          <SummaryCard
            bonus={state.bonus}
            onBonusChange={(val) => setState((prev) => ({ ...prev, bonus: val }))}
            onCalc={() => calc()}
            onReset={resetUnlocked}
            result={result}
            isCalculating={isCalculating}
          />
        </div>
      </div>

      {/* OCR Debug Modal */}
      {debugModal && (
        <OcrDebugModal
          open={!!debugModal}
          imageUrl={debugModal.imageUrl}
          sectionId={debugModal.sectionId}
          points={debugModal.points}
          badgeRightEdges={debugModal.badgeRightEdges}
          onClose={() => {
            URL.revokeObjectURL(debugModal.imageUrl)
            setDebugModal(null)
          }}
        />
      )}
    </div>
  )
}
