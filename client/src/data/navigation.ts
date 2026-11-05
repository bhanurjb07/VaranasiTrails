export interface NavLink {
  label: string
  to: string
}

export interface NavGroup {
  title: string
  links: readonly NavLink[]
}

export const headerLinks: readonly NavLink[] = [
  { label: 'Trips', to: '/destinations' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const footerGroups: readonly NavGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'All trips', to: '/destinations' },
      { label: 'Ganga aarti and boat rides', to: '/destinations?category=spiritual' },
      { label: 'Heritage and culture', to: '/destinations?category=heritage' },
      { label: 'Food trails', to: '/destinations?category=food' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of service', to: '/terms' },
    ],
  },
  {
    title: 'Your account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Create an account', to: '/signup' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Profile', to: '/profile' },
    ],
  },
]
