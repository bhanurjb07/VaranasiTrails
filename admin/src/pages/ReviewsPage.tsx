import { Eye, EyeOff, Search, Star, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import { useDestinationList } from '@/features/destinations/useDestinations'
import { useReviewActions, useReviewList } from '@/features/reviews/useReviews'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlParams } from '@/hooks/useUrlParams'
import { cn } from '@/lib/cn'
import { timeAgo } from '@/lib/format'
import type { AdminReview } from '@/types/api'

const Stars = ({ value }: { value: number }) => (
  <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={cn('size-4', star <= value ? 'fill-gold text-gold' : 'text-line')} aria-hidden="true" />
    ))}
  </span>
)

export const ReviewsPage = () => {
  const { get, page, update } = useUrlParams()
  const searchId = useId()
  const [toDelete, setToDelete] = useState<AdminReview | null>(null)
  const { setHidden, remove } = useReviewActions()
  const destinations = useDestinationList({ status: 'all', sort: 'title', limit: 100 })

  const [search, setSearch] = useState(get('q'))
  const debounced = useDebounce(search, 350)
  const synced = useRef(get('q'))
  useEffect(() => {
    const text = debounced.trim()
    if (text !== synced.current) {
      synced.current = text
      update({ q: text || undefined })
    }
  }, [debounced, update])

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useReviewList({
    q: get('q') || undefined,
    hidden: get('hidden') === 'true' ? true : get('hidden') === 'false' ? false : undefined,
    rating: Number(get('rating')) || undefined,
    destinationId: get('destination') || undefined,
    page,
    limit: 20,
  })

  return (
    <>
      <PageHeader title="Reviews" description="Hide a review to remove it from the public site and from the trip's rating. Delete removes it for good." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-xs">
          <label htmlFor={searchId} className="sr-only">
            Search reviews
          </label>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input id={searchId} type="search" placeholder="Search text or author" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
        <div className="w-40">
          <Select aria-label="Visibility" value={get('hidden')} onChange={(event) => update({ hidden: event.target.value || undefined })}>
            <option value="">All reviews</option>
            <option value="false">Visible</option>
            <option value="true">Hidden</option>
          </Select>
        </div>
        <div className="w-36">
          <Select aria-label="Rating" value={get('rating')} onChange={(event) => update({ rating: event.target.value || undefined })}>
            <option value="">Any rating</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} star{rating === 1 ? '' : 's'}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-56">
          <Select aria-label="Destination" value={get('destination')} onChange={(event) => update({ destination: event.target.value || undefined })}>
            <option value="">All destinations</option>
            {destinations.data?.data.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isError ? (
        <ErrorState error={error} title="Could not load reviews" onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-2" aria-hidden="true">
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20 rounded-card" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" text="Try clearing a filter." />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <Table>
            <THead>
              <tr>
                <Th>Review</Th>
                <Th>Trip</Th>
                <Th>Author</Th>
                <Th>Posted</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </THead>
            <TBody>
              {data.data.map((review) => (
                <Tr key={review.id} className={review.isHidden ? 'bg-cream/70' : undefined}>
                  <Td className="max-w-md">
                    <div className="flex items-center gap-2">
                      <Stars value={review.rating} />
                      {review.isHidden && <Badge variant="archived">Hidden</Badge>}
                    </div>
                    <p className="mt-1 font-semibold text-indigo">{review.title}</p>
                    <p className="line-clamp-2 text-muted">{review.comment}</p>
                  </Td>
                  <Td className="max-w-48">
                    <Link to={`/destinations/${review.destination.id}`} className="block truncate font-medium text-indigo hover:underline">
                      {review.destination.title}
                    </Link>
                  </Td>
                  <Td>
                    <span className="block font-medium text-indigo">{review.user.name}</span>
                    <span className="block text-xs text-muted">{review.user.email}</span>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{timeAgo(review.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        loading={setHidden.isPending && setHidden.variables?.id === review.id}
                        onClick={() => setHidden.mutate({ id: review.id, hidden: !review.isHidden })}
                      >
                        {review.isHidden ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                        {review.isHidden ? 'Unhide' : 'Hide'}
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete review "${review.title}"`} onClick={() => setToDelete(review)}>
                        <Trash2 className="size-4 text-danger" aria-hidden="true" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{data.meta.total} review{data.meta.total === 1 ? '' : 's'}</p>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={(next) => update({ page: String(next) })} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
        loading={remove.isPending}
        danger
        title="Delete this review?"
        confirmLabel="Delete review"
      >
        The review by <strong>{toDelete?.user.name}</strong> will be deleted permanently and the trip's rating recalculated. Consider hiding it instead.
      </ConfirmDialog>
    </>
  )
}
