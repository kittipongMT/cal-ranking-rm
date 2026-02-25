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
      className="flex items-center gap-2
        h-8 px-3 rounded-[10px] bg-[#dfcd80] text-black font-bold text-xs
        cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all"
    >
      <GoogleIcon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="max-w-[120px] truncate">
        {user ? (user.displayName?.split(' ')[0] || 'Google') : 'Sign in'}
      </span>
    </button>
  )
}
