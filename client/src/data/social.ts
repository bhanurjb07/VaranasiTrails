// Social profiles. TODO(business): replace every placeholder URL and handle.
// Hiding a platform is one line: set `enabled: false`.

export type SocialPlatform = 'instagram' | 'facebook' | 'x' | 'youtube'

export interface SocialLink {
  platform: SocialPlatform
  label: string
  handle: string
  url: string
  enabled: boolean
}

export const socialLinks: readonly SocialLink[] = [
  {
    platform: 'instagram',
    label: 'Instagram',
    handle: '@varanasitrails',
    url: 'https://www.instagram.com/varanasitrails',
    enabled: true,
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    handle: 'VaranasiTrails',
    url: 'https://www.facebook.com/varanasitrails',
    enabled: true,
  },
  {
    platform: 'x',
    label: 'X (Twitter)',
    handle: '@varanasitrails',
    url: 'https://x.com/varanasitrails',
    enabled: true,
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    handle: '@varanasitrails',
    url: 'https://www.youtube.com/@varanasitrails',
    enabled: true,
  },
]

export const activeSocialLinks = socialLinks.filter((link) => link.enabled)
