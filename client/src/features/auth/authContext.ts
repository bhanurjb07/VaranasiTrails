import { createContext } from 'react'

import type { ApiUser, AuthResponse } from '@/types/api'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  status: AuthStatus
  user: ApiUser | null
  /** Stores a session returned by login / verify-email. */
  startSession: (session: AuthResponse) => void
  updateUser: (user: ApiUser) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
