import { Check, Clock, Gauge, MapPin, Sun, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useWatch, type Control } from 'react-hook-form'

import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { discountPercent, formatDuration, formatPrice } from '@/lib/format'
import type { AdminDestination } from '@/types/api'
import type { EditorValues } from './formSchema'

interface PreviewTabProps {
  control: Control<EditorValues>
  destination: AdminDestination | undefined
  categoryName: string
}

const difficultyLabel = { EASY: 'Easy', MODERATE: 'Moderate', HARD: 'Challenging' } as const

/** The trip as the public detail page shows it, built from the unsaved form values. */
export const PreviewTab = ({ control, destination, categoryName }: PreviewTabProps) => {
  const v = useWatch({ control }) as EditorValues
  const [active, setActive] = useState(0)
  const images = destination?.images ?? []
  const main = images[active] ?? images[0]

  const price = typeof v.priceInr === 'number' ? v.priceInr : 0
  const percent = discountPercent(price, v.originalPriceInr)
  const highlights = v.highlights.filter((item) => item.value.trim())
  const inclusions = v.inclusions.filter((item) => item.value.trim())
  const exclusions = v.exclusions.filter((item) => item.value.trim())

  return (
    <div className="overflow-hidden rounded-card border border-line bg-cream shadow-card" aria-label="Preview of the public trip page">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-danger/60" />
        <span className="size-2.5 rounded-full bg-gold/70" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-3 truncate rounded-full bg-cream px-3 py-1 text-xs text-muted">/destinations/{v.slug || 'your-trip'}</span>
        <Badge variant="info" className="ml-auto">Preview</Badge>
      </div>

      <div className="space-y-10 p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-w-0">
            <div className="aspect-[16/10] overflow-hidden rounded-card bg-cream-deep">
              {main ? (
                <img src={main.url} alt={main.alt} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted">No photos yet</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button key={image.id} type="button" aria-label={`Show photo ${index + 1}`} onClick={() => setActive(index)} className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-control border-2', index === active ? 'border-saffron' : 'border-transparent opacity-70')}>
                    <img src={image.url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-card border border-line/70 bg-surface p-6 shadow-card">
            <p className="text-xs font-semibold tracking-[0.16em] text-saffron-dark uppercase">{categoryName || 'Category'}</p>
            <h3 className="mt-2 font-heading text-3xl leading-tight">{v.title || 'Your trip title'}</h3>
            <p className="mt-2 text-muted">{v.tagline || 'Your tagline appears here.'}</p>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 border-t border-line pt-5">
              <span className="font-heading text-4xl font-semibold text-indigo">{formatPrice(price)}</span>
              {v.originalPriceInr && v.originalPriceInr > price && (
                <>
                  <span className="text-lg text-muted line-through">{formatPrice(v.originalPriceInr)}</span>
                  <Badge variant="danger">Save {percent}%</Badge>
                </>
              )}
            </div>

            <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2"><Clock className="size-4 text-saffron-dark" aria-hidden="true" />{formatDuration(v.durationDays ?? 1, v.durationNights ?? 0)}</li>
              <li className="flex items-center gap-2"><Users className="size-4 text-saffron-dark" aria-hidden="true" />Up to {v.maxGroupSize ?? 0} people</li>
              <li className="flex items-center gap-2"><Gauge className="size-4 text-saffron-dark" aria-hidden="true" />{difficultyLabel[v.difficulty]}</li>
              <li className="flex items-center gap-2"><Sun className="size-4 text-saffron-dark" aria-hidden="true" />{v.bestTimeToVisit || 'Best time'}</li>
              {v.meetingPoint && <li className="flex items-center gap-2 sm:col-span-2"><MapPin className="size-4 text-saffron-dark" aria-hidden="true" />{v.meetingPoint}</li>}
            </ul>

            <div className="mt-6 space-y-2">
              <div className="rounded-full bg-[#25d366] py-3 text-center text-sm font-semibold text-indigo">Book on WhatsApp</div>
              <div className="rounded-full border border-line py-3 text-center text-sm font-semibold text-indigo">Send an enquiry</div>
            </div>
          </div>
        </div>

        <section>
          <h3 className="mb-3 font-heading text-2xl">Overview</h3>
          <div className="max-w-3xl space-y-3 text-ink/90">
            {(v.overview || 'Your overview appears here.').split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        {highlights.length > 0 && (
          <section>
            <h3 className="mb-3 font-heading text-2xl">Highlights</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <li key={index} className="rounded-control bg-surface p-3 text-sm shadow-card">{item.value}</li>
              ))}
            </ul>
          </section>
        )}

        {v.itinerary.length > 0 && (
          <section>
            <h3 className="mb-3 font-heading text-2xl">Day-by-day itinerary</h3>
            <ol className="space-y-3">
              {v.itinerary.map((day, index) => (
                <li key={index} className="rounded-card border border-line bg-surface p-4">
                  <p className="font-semibold text-indigo"><span className="mr-2 rounded-full bg-saffron-soft px-2.5 py-0.5 text-xs font-bold text-saffron-dark uppercase">Day {index + 1}</span>{day.title}</p>
                  <p className="mt-2 text-sm whitespace-pre-line text-muted">{day.description}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {(inclusions.length > 0 || exclusions.length > 0) && (
          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-line/70 bg-surface p-5">
              <h3 className="mb-3 font-heading text-xl">What is included</h3>
              <ul className="space-y-2 text-sm">{inclusions.map((item, index) => <li key={index} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />{item.value}</li>)}</ul>
            </div>
            <div className="rounded-card border border-line/70 bg-surface p-5">
              <h3 className="mb-3 font-heading text-xl">What is not included</h3>
              <ul className="space-y-2 text-sm">{exclusions.map((item, index) => <li key={index} className="flex gap-2"><X className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden="true" />{item.value}</li>)}</ul>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
