import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { refreshSession, registerSessionHandlers, setAccessToken } from '@/lib/apiClient'
import { toast } from '@/components/ui/toast'
import type { ApiUser, AuthResponse } from '@/types/api'
import { authApi } from './api'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext'

interface AuthState {
  status: AuthStatus
  user: ApiUser | null
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  const startSession = useCallback((session: AuthResponse) => {
    setAccessToken(session.accessToken)
    setState({ status: 'authenticated', user: session.user })
  }, [])

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setState({ status: 'anonymous', user: null })
    queryClient.removeQueries({ queryKey: ['wishlist'] })
  }, [queryClient])

  useEffect(() => {
    registerSessionHandlers({
      onRefreshed: startSession,
      onFailure: () => {
        clearSession()
        toast.info('Your session has expired. Please log in again.')
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

  const updateUser = useCallback((user: ApiUser) => {
    setState((current) => ({ ...current, user }))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, startSession, updateUser, logout }),
    [state, startSession, updateUser, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
