// src/lib/cloud.ts
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import type { AppState } from '../types'

const firebaseConfig = {
  apiKey: 'AIzaSyBsfan9ZXraevVDpTe8q1GL7DkfUER0wc0',
  authDomain: 'cal-ranking-rm.firebaseapp.com',
  projectId: 'cal-ranking-rm',
  storageBucket: 'cal-ranking-rm.firebasestorage.app',
  messagingSenderId: '937306488262',
  appId: '1:937306488262:web:4428898ff1903d6ffd46c7',
  measurementId: 'G-13CK76G4Q7',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const provider = new GoogleAuthProvider()

function stateDocRef(uid: string) {
  return doc(db, 'users', uid, 'apps', 'rm_rank_calc')
}

export function signInGoogle() {
  return signInWithPopup(auth, provider)
}

export function signOutUser() {
  return signOut(auth)
}

export async function loadCloudState(user: User): Promise<AppState | null> {
  const ref = stateDocRef(user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return data?.state || null
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export function saveStateDebounced(user: User | null, state: AppState) {
  if (!user) return
  if (saveTimer) clearTimeout(saveTimer)

  saveTimer = setTimeout(async () => {
    try {
      const ref = stateDocRef(user.uid)
      await setDoc(ref, { state, updatedAt: serverTimestamp() }, { merge: true })
    } catch (e) {
      console.warn('Cloud save failed:', e)
    }
  }, 700)
}

export function onAuthChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => cb(user || null))
}

export type { User }
