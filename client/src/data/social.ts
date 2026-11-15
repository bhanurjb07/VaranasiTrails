// Social profiles. The URLs below are placeholders and are switched off until the real accounts exist.
// TODO(business): put the real URL and handle for each account, then set `enabled: true`.

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
    enabled: false,
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    handle: 'VaranasiTrails',
    url: 'https://www.facebook.com/varanasitrails',
    enabled: false,
  },
  {
    platform: 'x',
    label: 'X (Twitter)',
    handle: '@varanasitrails',
    url: 'https://x.com/varanasitrails',
    enabled: false,
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    handle: '@varanasitrails',
    url: 'https://www.youtube.com/@varanasitrails',
    enabled: false,
  },
]

export const activeSocialLinks = socialLinks.filter((link) => link.enabled)
