import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router'

import { cn } from '@/lib/cn'
import { Brand } from './Brand'
import { navItems } from './navItems'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/** Desktop sidebar. Collapses to icons only. */
export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => (
  <aside
    className={cn(
      'sticky top-0 hidden h-dvh shrink-0 flex-col bg-indigo text-white transition-[width] duration-200 lg:flex',
      collapsed ? 'w-[4.5rem]' : 'w-64',
    )}
  >
    <div className={cn('flex h-16 items-center border-b border-white/10', collapsed ? 'justify-center' : 'px-5')}>
      <Brand compact={collapsed} />
    </div>

    <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={collapsed ? label : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive ? 'bg-saffron text-indigo' : 'text-white/75 hover:bg-white/10 hover:text-white',
            )
          }
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span className={cn(collapsed && 'sr-only')}>{label}</span>
        </NavLink>
      ))}
    </nav>

    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="m-3 flex items-center justify-center gap-2 rounded-control px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      {collapsed ? <ChevronsRight className="size-5" aria-hidden="true" /> : <ChevronsLeft className="size-5" aria-hidden="true" />}
      {!collapsed && 'Collapse'}
    </button>
  </aside>
)
