import { MessageSquareText } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { getMyReviewId } from '../myReviews'
import { useReviews } from '../hooks/useReviews'
import { ReviewItem } from './ReviewItem'

export const ReviewList = ({ slug }: { slug: string }) => {
  const [page, setPage] = useState(1)
  const { user } = useAuth()
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useReviews(slug, page)
  const myReviewId = user ? getMyReviewId(user.id, slug) : undefined

  if (isPending) {
    return (
      <div className="space-y-4" aria-hidden="true">
        {[0, 1].map((key) => (
          <Skeleton key={key} className="h-32" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState error={error} title="Could not load reviews" onRetry={() => void refetch()} />

  if (data.data.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="No reviews yet"
        text="Be the first to share what this trip was like."
      />
    )
  }

  return (
    <div>
      <ul className={`space-y-4 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
        {data.data.map((review) => (
          <ReviewItem key={review.id} review={review} slug={slug} mine={review.id === myReviewId} />
        ))}
      </ul>
      <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-6" />
    </div>
  )
}
