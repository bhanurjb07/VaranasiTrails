import type { EditorValues } from './formSchema'

export interface ReadinessItem {
  id: string
  label: string
  ok: boolean
  /** Section anchor the checklist links to. */
  section: 'basics' | 'pricing' | 'media' | 'highlights' | 'itinerary'
}

interface ReadinessInput {
  values: Pick<EditorValues, 'title' | 'tagline' | 'overview' | 'categoryId' | 'priceInr' | 'originalPriceInr' | 'durationDays' | 'highlights' | 'itinerary'>
  imageCount: number
  hasCover: boolean
}

/**
 * The checklist shown beside the editor. It mirrors the server's publish rules
 * (server: destinationMapper.checkReadiness), so what is ticked here is what the
 * server will accept.
 */
export const computeReadiness = ({ values, imageCount, hasCover }: ReadinessInput): ReadinessItem[] => {
  const price = typeof values.priceInr === 'number' ? values.priceInr : 0
  const original = values.originalPriceInr

  return [
    { id: 'title', label: 'Title (3+ characters)', ok: values.title.trim().length >= 3, section: 'basics' },
    { id: 'tagline', label: 'Tagline (10+ characters)', ok: values.tagline.trim().length >= 10, section: 'basics' },
    { id: 'overview', label: 'Overview (50+ characters)', ok: values.overview.trim().length >= 50, section: 'basics' },
    { id: 'category', label: 'Category chosen', ok: values.categoryId !== '', section: 'basics' },
    { id: 'price', label: 'Price above zero', ok: price > 0, section: 'pricing' },
    {
      id: 'discount',
      label: 'Original price higher than price',
      ok: original === null || (typeof original === 'number' && original > price),
      section: 'pricing',
    },
    { id: 'duration', label: 'Duration set', ok: (values.durationDays ?? 0) >= 1, section: 'pricing' },
    { id: 'images', label: 'At least one photo', ok: imageCount >= 1, section: 'media' },
    { id: 'cover', label: 'Cover photo chosen', ok: imageCount >= 1 && hasCover, section: 'media' },
    { id: 'highlights', label: 'At least one highlight', ok: values.highlights.some((item) => item.value.trim() !== ''), section: 'highlights' },
    {
      id: 'itinerary',
      label: 'At least one itinerary day',
      ok: values.itinerary.some((day) => day.title.trim() !== '' && day.description.trim() !== ''),
      section: 'itinerary',
    },
  ]
}

export const isReady = (items: readonly ReadinessItem[]) => items.every((item) => item.ok)
