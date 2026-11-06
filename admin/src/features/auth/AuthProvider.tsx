import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { toast } from '@/components/ui/toast'
import { refreshSession, registerSessionHandlers, setAccessToken } from '@/lib/apiClient'
import type { ApiUser, AuthResponse } from '@/types/api'
import { authApi } from './api'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext'

interface AuthState {
  status: AuthStatus
  user: ApiUser | null
}

/**
 * Session state for the admin panel. Only ADMIN users are let in: anyone else who manages
 * to log in is signed straight back out and shown "no access".
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  const clearSession = useCallback(
    (status: AuthStatus = 'anonymous') => {
      setAccessToken(null)
      setState({ status, user: null })
      queryClient.clear()
    },
    [queryClient],
  )

  const startSession = useCallback(
    (session: AuthResponse): boolean => {
      if (session.user.role !== 'ADMIN') {
        // End the server session too, so a normal account never stays signed in here.
        setAccessToken(session.accessToken)
        void authApi.logout().catch(() => undefined)
        clearSession('forbidden')
        return false
      }
      setAccessToken(session.accessToken)
      setState({ status: 'authenticated', user: session.user })
      return true
    },
    [clearSession],
  )

  useEffect(() => {
    registerSessionHandlers({
      onRefreshed: (session) => {
        startSession(session)
      },
      onFailure: () => {
        clearSession()
        toast.info('Your session has ended. Please log in again.')
      },
    })

    // Restore the session from the refresh-token cookie, if there is one.
    refreshSession().catch(() => setState({ status: 'anonymous', user: null }))
  }, [startSession, clearSession])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the request fails, the local session must end.
    }
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(() => ({ ...state, startSession, logout }), [state, startSession, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}
