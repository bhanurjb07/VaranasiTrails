import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { emptyForm, editorSchema, toPayload, type EditorValues } from './formSchema'
import { computeReadiness, isReady } from './readiness'
import { ReadinessChecklist } from './ReadinessChecklist'

const complete = (): EditorValues => ({
  ...emptyForm('cat-1'),
  title: 'Sunrise Boat Ride',
  tagline: 'Watch the sun rise over the ghats',
  overview: 'A slow boat ride along the ghats of Varanasi at dawn, with a guide who explains every temple.',
  priceInr: 1500,
  originalPriceInr: 2000,
  highlights: [{ value: 'Sunrise from the river' }],
  itinerary: [{ title: 'Dawn cruise', description: 'Meet at the ghat and cruise for two hours.' }],
})

const check = (values: EditorValues, imageCount = 1, hasCover = true) => computeReadiness({ values, imageCount, hasCover })
const failing = (items: ReturnType<typeof check>) => items.filter((item) => !item.ok).map((item) => item.id)

describe('computeReadiness (mirrors the server publish rules)', () => {
  it('is ready when everything the server requires is present', () => {
    const items = check(complete())

    expect(isReady(items)).toBe(true)
    expect(failing(items)).toEqual([])
  })

  it('flags every missing piece of a blank draft', () => {
    expect(failing(check(emptyForm(), 0, false))).toEqual([
      'title',
      'tagline',
      'overview',
      'category',
      'price',
      'images',
      'cover',
      'highlights',
      'itinerary',
    ])
  })

  it.each<[string, Partial<EditorValues>, string]>([
    ['a title under 3 characters', { title: 'Hi' }, 'title'],
    ['a tagline under 10 characters', { tagline: 'Too short' }, 'tagline'],
    ['an overview under 50 characters', { overview: 'Short overview.' }, 'overview'],
    ['no category', { categoryId: '' }, 'category'],
    ['a zero price', { priceInr: 0, originalPriceInr: null }, 'price'],
    ['an original price below the price', { originalPriceInr: 1000 }, 'discount'],
    ['an original price equal to the price', { originalPriceInr: 1500 }, 'discount'],
    ['no highlights', { highlights: [] }, 'highlights'],
    ['only blank highlights', { highlights: [{ value: '  ' }] }, 'highlights'],
    ['no itinerary', { itinerary: [] }, 'itinerary'],
    ['an itinerary day without a description', { itinerary: [{ title: 'Day', description: '' }] }, 'itinerary'],
  ])('fails with %s', (_name, patch, id) => {
    expect(failing(check({ ...complete(), ...patch }))).toContain(id)
  })

  it('needs a photo and a cover', () => {
    expect(failing(check(complete(), 0, false))).toEqual(['images', 'cover'])
    expect(failing(check(complete(), 2, false))).toEqual(['cover'])
  })

  it('treats a missing original price as fine', () => {
    expect(check({ ...complete(), originalPriceInr: null }).find((item) => item.id === 'discount')?.ok).toBe(true)
  })
})

describe('ReadinessChecklist', () => {
  it('shows progress and links each missing item to its section', () => {
    render(<ReadinessChecklist items={check(emptyForm(), 0, false)} />)

    expect(screen.getByRole('progressbar', { name: 'Publish readiness' })).toHaveAttribute('aria-valuenow', '2')
    expect(screen.getByText('2/11')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /At least one photo/ })
    expect(link).toHaveAttribute('href', '#media')
    expect(within(link).getByText('(missing)')).toBeInTheDocument()
    expect(screen.queryByText(/Everything the site needs/)).not.toBeInTheDocument()
  })

  it('celebrates when everything is ready', () => {
    render(<ReadinessChecklist items={check(complete())} />)

    expect(screen.getByText('11/11')).toBeInTheDocument()
    expect(screen.getByText(/Everything the site needs is here/)).toBeInTheDocument()
    expect(screen.queryAllByText('(missing)')).toHaveLength(0)
  })
})

describe('form schema and payload', () => {
  it('turns a valid form into the API body', () => {
    const payload = toPayload(editorSchema.parse({ ...complete(), slug: '', meetingPoint: '  ', metaTitle: '' }))

    expect(payload).toMatchObject({
      title: 'Sunrise Boat Ride',
      slug: undefined,
      meetingPoint: null,
      metaTitle: null,
      highlights: ['Sunrise from the river'],
      itinerary: [{ title: 'Dawn cruise', description: 'Meet at the ghat and cruise for two hours.' }],
    })
  })

  it('rejects an original price that is not higher than the price', () => {
    const result = editorSchema.safeParse({ ...complete(), originalPriceInr: 1000 })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['originalPriceInr'])
  })

  it('rejects a bad slug and a missing category', () => {
    const result = editorSchema.safeParse({ ...complete(), slug: 'Bad Slug', categoryId: '' })

    expect(result.error?.issues.map((issue) => issue.path[0]).sort()).toEqual(['categoryId', 'slug'])
  })
})
