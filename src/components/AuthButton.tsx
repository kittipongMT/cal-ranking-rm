// src/components/AuthButton.tsx
import { GoogleIcon } from './icons'
import type { User } from '../lib/cloud'

interface AuthButtonProps {
  user: User | null
  onSignIn: () => void
  onSignOut: () => void
}

export default function AuthButton({ user, onSignIn, onSignOut }: AuthButtonProps) {
  return (
    <button
      type="button"
      onClick={user ? onSignOut : onSignIn}
      className="fixed top-3 right-3 z-50 flex items-center gap-2
        h-9 px-3 rounded-[10px] bg-[#dfcd80] text-black font-bold text-sm
        cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all
        shadow-lg"
    >
      <GoogleIcon className="w-4 h-4" />
      {user ? `Logout (${user.displayName || 'Google'})` : 'Sign in with Google'}
    </button>
  )
}
