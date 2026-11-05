import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { RatingInput } from '@/components/ui/RatingInput'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import type { Review } from '@/types/api'
import { useCreateReview, useUpdateReview } from '../hooks/useReviews'

const schema = z.object({
  rating: z.number().int().min(1, 'Choose a star rating').max(5),
  title: z.string().trim().min(3, 'Add a short title (3+ characters)').max(100, 'Title is too long'),
  comment: z.string().trim().min(10, 'Tell us a bit more (10+ characters)').max(2000, 'Review is too long'),
})

type Values = z.input<typeof schema>

interface ReviewFormProps {
  slug: string
  /** When given, the form edits this review instead of creating one. */
  existing?: Review
  onDone?: () => void
}

export const ReviewForm = ({ slug, existing, onDone }: ReviewFormProps) => {
  const create = useCreateReview(slug)
  const update = useUpdateReview(slug)
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? { rating: existing.rating, title: existing.title, comment: existing.comment }
      : { rating: 0, title: '', comment: '' },
  })

  const onError = (error: unknown) => {
    if (applyServerErrors(error, setError, ['rating', 'title', 'comment'])) return
    if (isApiError(error) && error.code === 'REVIEW_EXISTS') {
      toast.info('You have already reviewed this trip.')
      return
    }
    toast.error(errorMessage(error))
  }

  const submit = handleSubmit((values) => {
    const input = schema.parse(values)
    if (existing) {
      update.mutate({ id: existing.id, input }, { onSuccess: onDone, onError })
    } else {
      create.mutate(input, {
        onSuccess: () => {
          reset({ rating: 0, title: '', comment: '' })
          onDone?.()
        },
        onError,
      })
    }
  })

  const pending = create.isPending || update.isPending

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-indigo">Your rating</span>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => <RatingInput value={field.value} onChange={field.onChange} />}
        />
        {errors.rating && (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {errors.rating.message}
          </p>
        )}
      </div>

      <Field label="Title" error={errors.title?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('title')} />
        )}
      </Field>
      <Field label="Your review" error={errors.comment?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} rows={4} invalid={invalid} aria-describedby={describedBy} {...register('comment')} />
        )}
      </Field>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {existing ? 'Save changes' : 'Post review'}
        </Button>
        {existing && (
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
