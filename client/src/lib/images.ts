// Wikimedia thumbnails are served at fixed widths, so one source can offer a
// responsive srcset. Other sources (R2) are used as-is.

const WIKI_THUMB = /^(https:\/\/thumb\.wikimedia\.org\/.+\/)1920px-(.+)$/

export const WIKI_WIDTHS = [500, 960, 1920] as const

export const buildSrcSet = (url: string): string | undefined => {
  const match = WIKI_THUMB.exec(url)
  if (!match) return undefined
  return WIKI_WIDTHS.map((width) => `${match[1]}${width}px-${match[2]} ${width}w`).join(', ')
}
