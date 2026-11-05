import { createBrowserRouter, type RouteObject } from 'react-router'

import { PageShell } from '@/components/layout/PageShell'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { RouteError } from './RouteError'
import { Splash } from './Splash'

// Every page is its own chunk, loaded when its route is first visited.
const page = <Name extends string>(load: () => Promise<Record<Name, React.ComponentType>>, name: Name) => ({
  lazy: async () => ({ Component: (await load())[name] }),
})

const routes: RouteObject[] = [
  {
    element: <PageShell />,
    errorElement: <RouteError />,
    HydrateFallback: Splash,
    children: [
      { index: true, ...page(() => import('@/pages/HomePage'), 'HomePage') },
      { path: 'destinations', ...page(() => import('@/pages/DestinationsPage'), 'DestinationsPage') },
      { path: 'destinations/:slug', ...page(() => import('@/pages/DestinationDetailPage'), 'DestinationDetailPage') },
      { path: 'signup', ...page(() => import('@/pages/SignupPage'), 'SignupPage') },
      { path: 'verify-email', ...page(() => import('@/pages/VerifyEmailPage'), 'VerifyEmailPage') },
      { path: 'login', ...page(() => import('@/pages/LoginPage'), 'LoginPage') },
      { path: 'forgot-password', ...page(() => import('@/pages/ForgotPasswordPage'), 'ForgotPasswordPage') },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', ...page(() => import('@/pages/ProfilePage'), 'ProfilePage') },
          { path: 'wishlist', ...page(() => import('@/pages/WishlistPage'), 'WishlistPage') },
        ],
      },
      { path: 'about', ...page(() => import('@/pages/AboutPage'), 'AboutPage') },
      { path: 'contact', ...page(() => import('@/pages/ContactPage'), 'ContactPage') },
      { path: 'privacy', ...page(() => import('@/pages/PrivacyPage'), 'PrivacyPage') },
      { path: 'terms', ...page(() => import('@/pages/TermsPage'), 'TermsPage') },
      { path: '*', ...page(() => import('@/pages/NotFoundPage'), 'NotFoundPage') },
    ],
  },
]

export const router = createBrowserRouter(routes)
