import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { MobileMenu } from '@/components/layout/MobileMenu'
import { ProfilePage } from '@/pages/ProfilePage'
import type { ApiUser } from '@/types/api'
import { AuthContext, type AuthContextValue } from './authContext'

const user: ApiUser = {
  id: 'u1',
  name: 'Sachin Singh',
  email: 'sachin@example.com',
  phone: '+919876543210',
  role: 'USER',
  emailVerified: true,
  createdAt: '2026-11-06T00:00:00.000Z',
}

const auth = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  status: 'authenticated',
  user,
  startSession: vi.fn(),
  updateUser: vi.fn(),
  logout: vi.fn(async () => undefined),
  ...overrides,
})

const wrap = (value: AuthContextValue, children: ReactNode, path = '/') => (
  <QueryClientProvider client={new QueryClient()}>
    <AuthContext value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    </AuthContext>
  </QueryClientProvider>
)

describe('mobile menu account block', () => {
  it('greets the user and offers See all, Switch account and Sign out', () => {
    render(wrap(auth(), <MobileMenu open onClose={() => undefined} />))

    expect(screen.getByText('Hello, Sachin')).toBeTruthy()
    expect(screen.getByText('Account holder')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'See all' }).getAttribute('href')).toBe('/profile')
    expect(screen.getByRole('button', { name: 'Switch account' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy()
  })

  it('does not show the edit forms in the menu', () => {
    render(wrap(auth(), <MobileMenu open onClose={() => undefined} />))

    expect(screen.queryByText(/change password/i)).toBeNull()
    expect(screen.queryByLabelText(/full name/i)).toBeNull()
  })

  it('signs out through the auth context', async () => {
    const logout = vi.fn(async () => undefined)
    render(wrap(auth({ logout }), <MobileMenu open onClose={() => undefined} />))

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('shows log in and sign up links for visitors', () => {
    render(wrap(auth({ status: 'anonymous', user: null }), <MobileMenu open onClose={() => undefined} />))

    expect(screen.getByText('Welcome')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Log in' }).getAttribute('href')).toBe('/login')
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull()
  })
})

describe('profile page', () => {
  it('shows the details and keeps both forms hidden until asked', () => {
    render(wrap(auth(), <ProfilePage />, '/profile'))

    expect(screen.getByText('sachin@example.com')).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit name/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit mobile number/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit password/i })).toBeTruthy()
    expect(screen.queryByLabelText('Current password')).toBeNull()
    expect(screen.queryByLabelText('Full name')).toBeNull()
  })

  it('opens one form at a time and closes it again', async () => {
    render(wrap(auth(), <ProfilePage />, '/profile'))

    await userEvent.click(screen.getByRole('button', { name: /edit password/i }))
    expect(screen.getByLabelText('Current password')).toBeTruthy()
    expect(screen.getByLabelText('Confirm new password')).toBeTruthy()
    expect(screen.queryByLabelText('Full name')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /edit name/i }))
    expect(screen.getByLabelText('Full name')).toBeTruthy()
    expect(screen.queryByLabelText('Current password')).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: /cancel editing name/i }))
    expect(screen.queryByLabelText('Full name')).toBeNull()
  })
})
