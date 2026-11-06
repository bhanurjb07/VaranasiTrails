import { createContext } from 'react'

import type { ApiUser, AuthResponse } from '@/types/api'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'forbidden'

export interface AuthContextValue {
  status: AuthStatus
  user: ApiUser | null
  /** Stores a session from login. Non-admins are refused (status becomes "forbidden"). */
  startSession: (session: AuthResponse) => boolean
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
