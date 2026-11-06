const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])

/**
 * Accepts watch, share (youtu.be), embed, shorts and live links and returns the
 * canonical embed URL, or null for anything else. Same rules as the server, so the
 * form can validate and preview before saving.
 */
export const parseYouTubeUrl = (input: string): string | null => {
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)
  let id: string | undefined

  if (host === 'youtu.be') {
    id = parts[0]
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (parts[0] === 'watch') id = url.searchParams.get('v') ?? undefined
    else if (['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '')) id = parts[1]
  }

  return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null
}
