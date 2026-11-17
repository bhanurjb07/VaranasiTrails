import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  DatabaseBackup,
  FileText,
  Images,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  MessageSquareText,
  Scale,
  ScrollText,
  Settings,
  Star,
  Tags,
  TicketPercent,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface NavGroup {
  /** Small heading above the group. The first group has none. */
  title?: string
  items: readonly NavItem[]
}

export const navGroups: readonly NavGroup[] = [
  { items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    title: 'Catalog',
    items: [
      { to: '/destinations', label: 'Destinations', icon: MapPinned },
      { to: '/categories', label: 'Categories', icon: Tags },
      { to: '/media', label: 'Media library', icon: Images },
    ],
  },
  {
    title: 'Sales',
    items: [
      { to: '/enquiries', label: 'Enquiries', icon: MessageSquareText },
      { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
      { to: '/customers', label: 'Customers', icon: UsersRound },
      { to: '/availability', label: 'Availability', icon: CalendarDays },
      { to: '/coupons', label: 'Coupons', icon: TicketPercent },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/content', label: 'Offers and homepage', icon: Megaphone },
      { to: '/about-editor', label: 'About and founders', icon: FileText },
      { to: '/legal', label: 'Legal pages', icon: Scale },
      { to: '/careers', label: 'Careers', icon: Briefcase },
      { to: '/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/export', label: 'Export and backup', icon: DatabaseBackup },
    ],
  },
  {
    title: 'Admin',
    items: [
      { to: '/settings', label: 'Business details', icon: Settings },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/audit-log', label: 'Audit log', icon: ScrollText },
    ],
  },
]

export const navItems: readonly NavItem[] = navGroups.flatMap((group) => group.items)

/** Human labels for breadcrumbs, by first path segment. */
export const sectionLabels: Record<string, string> = {
  destinations: 'Destinations',
  categories: 'Categories',
  media: 'Media library',
  enquiries: 'Enquiries',
  bookings: 'Bookings',
  customers: 'Customers',
  availability: 'Availability',
  coupons: 'Coupons',
  content: 'Offers and homepage',
  'about-editor': 'About and founders',
  legal: 'Legal pages',
  careers: 'Careers',
  reviews: 'Reviews',
  reports: 'Reports',
  export: 'Export and backup',
  settings: 'Business details',
  users: 'Users',
  'audit-log': 'Audit log',
  account: 'Account',
}
