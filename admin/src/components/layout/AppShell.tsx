import { Suspense, useCallback, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'

import { RouteErrorBoundary } from '@/app/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { MobileNav } from './MobileNav'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const COLLAPSE_KEY = 'vt_admin_sidebar_collapsed'

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

/** Sidebar + top bar + routed page. */
export const AppShell = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const toggle = () =>
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? '0' : '1')
      } catch {
        // Preference just will not persist.
      }
      return !value
    })

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-[60] rounded-control bg-saffron px-4 py-2 font-semibold text-indigo focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <MobileNav open={menuOpen} onClose={closeMenu} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main id="main" className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <RouteErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center py-24" role="status" aria-label="Loading">
                  <Spinner className="size-7 text-saffron" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
      <ScrollRestoration />
    </div>
  )
}
