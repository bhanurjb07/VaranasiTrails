import { Clock, Gauge, MapPin, Share2, Sun, Users } from 'lucide-react'
import type { ReactNode } from 'react'

import { WhatsAppIcon } from '@/components/common/BrandIcons'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Rating } from '@/components/ui/Rating'
import { toast } from '@/components/ui/toast'
import { WishlistButton } from '@/features/wishlist/components/WishlistButton'
import { formatDifficulty, formatDuration, formatPrice } from '@/lib/format'
import type { DestinationDetail } from '@/types/api'

interface BuyBoxProps {
  destination: DestinationDetail
  whatsappUrl: string
  onEnquire: () => void
}

const Fact = ({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 text-saffron-dark" aria-hidden="true">
      {icon}
    </span>
    <span>
      <span className="block text-xs text-muted">{label}</span>
      <span className="font-medium text-indigo">{children}</span>
    </span>
  </li>
)

const share = async (title: string) => {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  } catch (error) {
    // The user dismissing the native share sheet is not an error.
    if (error instanceof DOMException && error.name === 'AbortError') return
    toast.error('Could not share this page')
  }
}

export const BuyBox = ({ destination: d, whatsappUrl, onEnquire }: BuyBoxProps) => (
  <div className="rounded-card border border-line/70 bg-surface p-6 shadow-card sm:p-7">
    <p className="text-xs font-semibold tracking-[0.16em] text-saffron-dark uppercase">{d.category.name}</p>
    <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{d.title}</h1>
    <p className="mt-2 text-muted">{d.tagline}</p>

    <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm hover:underline">
      <span className="font-semibold text-indigo">{d.ratingCount > 0 ? d.ratingAvg.toFixed(1) : 'New'}</span>
      <Rating value={d.ratingAvg} size="sm" />
      <span className="text-muted">
        {d.ratingCount > 0 ? `${d.ratingCount} review${d.ratingCount === 1 ? '' : 's'}` : 'Be the first to review'}
      </span>
    </a>

    <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-line pt-6">
      <span className="font-heading text-4xl font-semibold text-indigo">{formatPrice(d.priceInr)}</span>
      {d.originalPriceInr && d.originalPriceInr > d.priceInr && (
        <>
          <span className="text-lg text-muted line-through">{formatPrice(d.originalPriceInr)}</span>
          <Badge variant="maroon" className="bg-maroon text-white">
            Save {d.discountPercent}%
          </Badge>
        </>
      )}
      <span className="w-full text-sm text-muted">per person, as listed under What is included</span>
    </div>

    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
      <Fact icon={<Clock className="size-5" />} label="Duration">
        {formatDuration(d.duration)}
      </Fact>
      <Fact icon={<Users className="size-5" />} label="Group size">
        Up to {d.maxGroupSize} people
      </Fact>
      <Fact icon={<Gauge className="size-5" />} label="Difficulty">
        {formatDifficulty(d.difficulty)}
      </Fact>
      <Fact icon={<Sun className="size-5" />} label="Best time to visit">
        {d.bestTimeToVisit}
      </Fact>
      {d.meetingPoint && (
        <li className="sm:col-span-2">
          <ul>
            <Fact icon={<MapPin className="size-5" />} label="Meeting point">
              {d.meetingPoint}
            </Fact>
          </ul>
        </li>
      )}
    </ul>

    <div className="mt-7 space-y-3">
      <ButtonLink href={whatsappUrl} variant="whatsapp" size="lg" className="w-full">
        <WhatsAppIcon className="size-5" />
        Book on WhatsApp
      </ButtonLink>
      <Button variant="outline" size="lg" className="w-full" onClick={onEnquire}>
        Send an enquiry
      </Button>
      <div className="flex gap-3">
        <WishlistButton destination={d} variant="labelled" className="flex-1" />
        <Button variant="outline" className="flex-1" onClick={() => void share(d.title)}>
          <Share2 className="size-5" aria-hidden="true" />
          Share
        </Button>
      </div>
    </div>

    <p className="mt-5 text-center text-xs text-muted">
      No online payment. We confirm dates, price and pickup with you on WhatsApp.
    </p>
  </div>
)
