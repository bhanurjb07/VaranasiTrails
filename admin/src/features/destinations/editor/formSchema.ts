import { z } from 'zod'

import { SLUG_PATTERN } from '@/lib/slug'
import type { AdminDestination } from '@/types/api'
import type { DestinationInput } from '../api'

/** useFieldArray needs objects, so plain string lists are wrapped as { value }. */
const listItem = z.object({ value: z.string().trim().min(1, 'Cannot be empty').max(200, 'Keep it under 200 characters') })

const requiredNumber = (message: string) => z.number({ error: message })

export const editorSchema = z
  .object({
    title: z.string().trim().min(3, 'Add a title (at least 3 characters)').max(120, 'Keep the title under 120 characters'),
    slug: z
      .string()
      .trim()
      .max(120)
      .refine((value) => value === '' || SLUG_PATTERN.test(value), 'Use lowercase letters, numbers and hyphens'),
    tagline: z.string().trim().max(200, 'Keep the tagline under 200 characters'),
    overview: z.string().trim().max(10000, 'Keep the overview under 10,000 characters'),
    categoryId: z.string().min(1, 'Choose a category'),
    city: z.string().trim().max(80),
    state: z.string().trim().max(80),
    priceInr: requiredNumber('Enter a price').int('Use whole rupees').min(0, 'Price cannot be negative').max(10_000_000),
    originalPriceInr: z.number().int('Use whole rupees').min(0).max(10_000_000).nullable(),
    durationDays: requiredNumber('Enter the number of days').int().min(1, 'At least 1 day').max(60),
    durationNights: requiredNumber('Enter the number of nights').int().min(0).max(60),
    maxGroupSize: requiredNumber('Enter the group size').int().min(1, 'At least 1 person').max(500),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD']),
    bestTimeToVisit: z.string().trim().max(200),
    meetingPoint: z.string().trim().max(200),
    metaTitle: z.string().trim().max(70, 'Search engines show about 60 characters'),
    metaDescription: z.string().trim().max(200, 'Search engines show about 160 characters'),
    highlights: z.array(listItem).max(20),
    itinerary: z
      .array(
        z.object({
          title: z.string().trim().min(1, 'Give this day a title').max(120),
          description: z.string().trim().min(1, 'Describe this day').max(2000),
        }),
      )
      .max(60),
    inclusions: z.array(listItem).max(30),
    exclusions: z.array(listItem).max(30),
  })
  .refine((value) => value.originalPriceInr === null || value.originalPriceInr > value.priceInr, {
    path: ['originalPriceInr'],
    message: 'Original price must be higher than the price',
  })

export type EditorValues = z.input<typeof editorSchema>

export const emptyForm = (categoryId = ''): EditorValues => ({
  title: '',
  slug: '',
  tagline: '',
  overview: '',
  categoryId,
  city: 'Varanasi',
  state: 'Uttar Pradesh',
  priceInr: 0,
  originalPriceInr: null,
  durationDays: 1,
  durationNights: 0,
  maxGroupSize: 10,
  difficulty: 'EASY',
  bestTimeToVisit: '',
  meetingPoint: '',
  metaTitle: '',
  metaDescription: '',
  highlights: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
})

const wrap = (items: string[]) => items.map((value) => ({ value }))

/** Server destination to form values. */
export const toFormValues = (d: AdminDestination): EditorValues => ({
  title: d.title,
  slug: d.slug,
  tagline: d.tagline,
  overview: d.overview,
  categoryId: d.categoryId,
  city: d.city,
  state: d.state,
  priceInr: d.priceInr,
  originalPriceInr: d.originalPriceInr,
  durationDays: d.durationDays,
  durationNights: d.durationNights,
  maxGroupSize: d.maxGroupSize,
  difficulty: d.difficulty,
  bestTimeToVisit: d.bestTimeToVisit,
  meetingPoint: d.meetingPoint ?? '',
  metaTitle: d.metaTitle ?? '',
  metaDescription: d.metaDescription ?? '',
  highlights: wrap(d.highlights),
  itinerary: d.itinerary.map(({ title, description }) => ({ title, description })),
  inclusions: wrap(d.inclusions),
  exclusions: wrap(d.exclusions),
})

const orNull = (value: string) => (value.trim() === '' ? null : value.trim())

/** Validated form values to the API body (the whole form, as the editor sends it). */
export const toPayload = (values: z.output<typeof editorSchema>): DestinationInput => ({
  title: values.title,
  slug: values.slug || undefined,
  tagline: values.tagline,
  overview: values.overview,
  categoryId: values.categoryId,
  city: values.city,
  state: values.state,
  priceInr: values.priceInr,
  originalPriceInr: values.originalPriceInr,
  durationDays: values.durationDays,
  durationNights: values.durationNights,
  maxGroupSize: values.maxGroupSize,
  difficulty: values.difficulty,
  bestTimeToVisit: values.bestTimeToVisit,
  meetingPoint: orNull(values.meetingPoint),
  metaTitle: orNull(values.metaTitle),
  metaDescription: orNull(values.metaDescription),
  highlights: values.highlights.map((item) => item.value),
  itinerary: values.itinerary,
  inclusions: values.inclusions.map((item) => item.value),
  exclusions: values.exclusions.map((item) => item.value),
})

/** Field names the server may report errors for. */
export const serverFields = [
  'title', 'slug', 'tagline', 'overview', 'categoryId', 'city', 'state', 'priceInr', 'originalPriceInr',
  'durationDays', 'durationNights', 'maxGroupSize', 'difficulty', 'bestTimeToVisit', 'meetingPoint',
  'metaTitle', 'metaDescription',
] as const
