import {
  LayoutDashboard,
  MapPinned,
  MessageSquareText,
  ScrollText,
  Star,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const navItems: readonly NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/destinations', label: 'Destinations', icon: MapPinned },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/enquiries', label: 'Enquiries', icon: MessageSquareText },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/audit-log', label: 'Audit log', icon: ScrollText },
]

/** Human labels for breadcrumbs, by first path segment. */
export const sectionLabels: Record<string, string> = {
  destinations: 'Destinations',
  categories: 'Categories',
  enquiries: 'Enquiries',
  users: 'Users',
  reviews: 'Reviews',
  'audit-log': 'Audit log',
  account: 'Account',
}
