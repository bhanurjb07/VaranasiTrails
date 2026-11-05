import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Rating } from '@/components/ui/Rating'
import { formatDate } from '@/lib/format'
import type { Review } from '@/types/api'
import { useDeleteReview } from '../hooks/useReviews'
import { ReviewForm } from './ReviewForm'

interface ReviewItemProps {
  review: Review
  slug: string
  /** Whether the current browser created this review (can edit or delete it). */
  mine: boolean
}

export const ReviewItem = ({ review, slug, mine }: ReviewItemProps) => {
  const [editing, setEditing] = useState(false)
  const remove = useDeleteReview(slug)

  if (editing) {
    return (
      <li className="rounded-card border border-line bg-surface p-5">
        <ReviewForm slug={slug} existing={review} onDone={() => setEditing(false)} />
      </li>
    )
  }

  return (
    <li className="rounded-card border border-line/70 bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-full bg-indigo font-semibold text-white"
            aria-hidden="true"
          >
            {review.user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-indigo">{review.user.name}</p>
            <p className="text-xs text-muted">
              {formatDate(review.createdAt)}
              {review.updatedAt !== review.createdAt && ' (edited)'}
            </p>
          </div>
        </div>
        <Rating value={review.rating} size="sm" />
      </div>
      <h4 className="mt-4 font-sans text-base font-semibold text-indigo">{review.title}</h4>
      <p className="mt-1.5 whitespace-pre-line text-muted">{review.comment}</p>

      {mine && (
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden="true" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            loading={remove.isPending}
            onClick={() => window.confirm('Delete your review?') && remove.mutate(review.id)}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Delete
          </Button>
        </div>
      )}
    </li>
  )
}
