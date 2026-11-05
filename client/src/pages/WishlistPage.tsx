import { Heart } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { SeoHead } from '@/components/common/SeoHead'
import { Container } from '@/components/layout/Container'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { DestinationGrid } from '@/features/destinations/components/DestinationGrid'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'

export const WishlistPage = () => {
  const { data, isPending, isError, error, refetch } = useWishlist()

  return (
    <>
      <SeoHead title="Your wishlist" noIndex />
      <PageHeader eyebrow="Saved trips" title="Your wishlist" subtitle="Trips you have saved to come back to." />

      <Container className="py-10">
        {isError ? (
          <ErrorState error={error} title="Could not load your wishlist" onRetry={() => void refetch()} />
        ) : !isPending && data?.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            text="Tap the heart on any trip to keep it here."
            action={<ButtonLink to="/destinations">Browse trips</ButtonLink>}
          />
        ) : (
          <DestinationGrid destinations={data} loading={isPending} skeletonCount={3} />
        )}
      </Container>
    </>
  )
}
