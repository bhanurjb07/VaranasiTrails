import { createBrowserRouter, type RouteObject } from 'react-router'

import { AppShell } from '@/components/layout/AppShell'
import { FullScreenSpinner, ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { RouteError } from './RouteError'

// Every screen is its own chunk, loaded when its route is first visited.
const page = <Name extends string>(load: () => Promise<Record<Name, React.ComponentType>>, name: Name) => ({
  lazy: async () => ({ Component: (await load())[name] }),
})

const routes: RouteObject[] = [
  { path: '/login', errorElement: <RouteError />, HydrateFallback: FullScreenSpinner, ...page(() => import('@/pages/LoginPage'), 'LoginPage') },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    HydrateFallback: FullScreenSpinner,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, ...page(() => import('@/pages/DashboardPage'), 'DashboardPage') },
          { path: 'destinations', ...page(() => import('@/pages/DestinationsPage'), 'DestinationsPage') },
          { path: 'destinations/new', ...page(() => import('@/pages/DestinationEditorPage'), 'DestinationEditorPage') },
          { path: 'destinations/:id', ...page(() => import('@/pages/DestinationEditorPage'), 'DestinationEditorPage') },
          { path: 'categories', ...page(() => import('@/pages/CategoriesPage'), 'CategoriesPage') },
          { path: 'careers', ...page(() => import('@/pages/CareersPage'), 'CareersPage') },
          { path: 'enquiries', ...page(() => import('@/pages/EnquiriesPage'), 'EnquiriesPage') },
          { path: 'users', ...page(() => import('@/pages/UsersPage'), 'UsersPage') },
          { path: 'reviews', ...page(() => import('@/pages/ReviewsPage'), 'ReviewsPage') },
          { path: 'audit-log', ...page(() => import('@/pages/AuditLogPage'), 'AuditLogPage') },
          { path: 'media', ...page(() => import('@/pages/MediaPage'), 'MediaPage') },
          { path: 'bookings', ...page(() => import('@/pages/BookingsPage'), 'BookingsPage') },
          { path: 'customers', ...page(() => import('@/pages/CustomersPage'), 'CustomersPage') },
          { path: 'availability', ...page(() => import('@/pages/AvailabilityPage'), 'AvailabilityPage') },
          { path: 'coupons', ...page(() => import('@/pages/CouponsPage'), 'CouponsPage') },
          { path: 'content', ...page(() => import('@/pages/ContentPage'), 'ContentPage') },
          { path: 'about-editor', ...page(() => import('@/pages/AboutEditorPage'), 'AboutEditorPage') },
          { path: 'legal', ...page(() => import('@/pages/LegalPage'), 'LegalPage') },
          { path: 'reports', ...page(() => import('@/pages/ReportsPage'), 'ReportsPage') },
          { path: 'export', ...page(() => import('@/pages/ExportPage'), 'ExportPage') },
          { path: 'settings', ...page(() => import('@/pages/SettingsPage'), 'SettingsPage') },
          { path: 'account', ...page(() => import('@/pages/AccountPage'), 'AccountPage') },
          { path: '*', ...page(() => import('@/pages/NotFoundPage'), 'NotFoundPage') },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
