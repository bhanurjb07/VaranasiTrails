import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { RouteErrorBoundary } from '@/app/ErrorBoundary'
import { FloatingWhatsApp } from './FloatingWhatsApp'
import { Footer } from './Footer'
import { Header } from './Header'

/** Header + routed page + footer. The home page lets its hero sit under the header. */
export const PageShell = () => {
  const { pathname } = useLocation()

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-control bg-navy px-4 py-2 font-semibold text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className={pathname === '/' ? 'pt-[7.5rem] md:pt-0' : 'pt-[7.5rem] pb-10 md:pt-24 md:pb-28'}>
        {/* Keyed so a crash on one page does not survive navigating away. */}
        <RouteErrorBoundary key={pathname}>
          <div className="animate-page">
            <Outlet />
          </div>
        </RouteErrorBoundary>
      </main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollRestoration />
    </>
  )
}
