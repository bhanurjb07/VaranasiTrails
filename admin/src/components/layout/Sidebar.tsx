import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router'

import { cn } from '@/lib/cn'
import { Brand } from './Brand'
import { navGroups } from './navItems'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

/** Desktop sidebar. Collapses to icons only. */
export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => (
  <aside
    className={cn(
      'bg-navy sticky top-0 hidden h-dvh shrink-0 flex-col text-ivory transition-[width] duration-300 ease-[var(--ease-out-soft)] lg:flex',
      collapsed ? 'w-[4.5rem]' : 'w-64',
    )}
  >
    <div className={cn('flex h-16 items-center border-b border-ivory/10', collapsed ? 'justify-center' : 'px-5')}>
      <Brand compact={collapsed} />
    </div>

    <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
      {navGroups.map((group, index) => (
        <div key={group.title ?? 'top'} className={cn(index > 0 && 'mt-4')}>
          {group.title &&
            (collapsed ? (
              <div className="mx-3 mb-2 border-t border-ivory/15" aria-hidden="true" />
            ) : (
              <p className="mb-1 px-3 text-xs font-medium text-ivory/55">{group.title}</p>
            ))}
          <div className="space-y-1">
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                    collapsed && 'justify-center px-0',
                    isActive ? 'bg-ivory/10 text-ivory shadow-[inset_1px_0_0_var(--color-brand)]' : 'text-ivory/70 hover:bg-ivory/5 hover:text-ivory',
                  )
                }
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className={cn(collapsed && 'sr-only')}>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>

    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className="m-3 flex items-center justify-center gap-2 rounded-control px-3 py-2 text-sm text-ivory/60 transition-colors hover:bg-ivory/10 hover:text-ivory"
    >
      {collapsed ? <ChevronsRight className="size-5" aria-hidden="true" /> : <ChevronsLeft className="size-5" aria-hidden="true" />}
      {!collapsed && 'Collapse'}
    </button>
  </aside>
)
