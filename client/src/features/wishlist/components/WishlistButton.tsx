import { Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

import { toast } from '@/components/ui/toast'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'
import type { DestinationCard } from '@/types/api'
import { useToggleWishlist, useWishlistIds } from '../hooks/useWishlist'

interface WishlistButtonProps {
  destination: DestinationCard
  /** "overlay" floats over an image; "labelled" is a normal outlined button. */
  variant?: 'overlay' | 'labelled'
  className?: string
}

export const WishlistButton = ({ destination, variant = 'overlay', className }: WishlistButtonProps) => {
  const { status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const ids = useWishlistIds()
  const toggle = useToggleWishlist()
  const saved = ids.has(destination.id)

  const onClick = (event: React.MouseEvent) => {
    // The button sits inside a card link.
    event.preventDefault()
    event.stopPropagation()

    if (status !== 'authenticated') {
      toast.info('Log in to save trips to your wishlist.')
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
      return
    }
    toggle.mutate({ item: destination, add: !saved })
  }

  const label = saved ? 'Remove from wishlist' : 'Save to wishlist'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-500 ease-out',
        variant === 'overlay'
          ? 'size-9 rounded-control bg-canvas/85 text-ink hover:bg-canvas'
          : 'h-11 gap-2 rounded-control border border-ink/25 px-5 text-sm font-medium text-ink hover:border-ink',
        className,
      )}
    >
      <Heart
        className={cn('size-[1.05rem] transition-colors duration-500', saved && 'fill-danger text-danger')}
        aria-hidden="true"
      />
      {variant === 'labelled' && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
