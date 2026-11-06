import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { sectionLabels } from './navItems'

/** Breadcrumb trail built from the URL. Detail pages show "Edit" / "New". */
export const Breadcrumbs = () => {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return <span className="text-sm font-semibold text-indigo">Dashboard</span>

  const crumbs = parts.map((part, index) => {
    const to = `/${parts.slice(0, index + 1).join('/')}`
    const label = index === 0 ? (sectionLabels[part] ?? part) : part === 'new' ? 'New' : 'Edit'
    return { to, label }
  })

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-muted">
        <li>
          <Link to="/" aria-label="Dashboard" className="flex items-center hover:text-indigo">
            <Home className="size-4" aria-hidden="true" />
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={crumb.to} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" aria-hidden="true" />
            {index === crumbs.length - 1 ? (
              <span aria-current="page" className="font-semibold text-indigo">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.to} className="hover:text-indigo hover:underline">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
