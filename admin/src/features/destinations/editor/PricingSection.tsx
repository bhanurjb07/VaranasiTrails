import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'

import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { NumberInput } from '@/components/ui/NumberInput'
import { SectionCard } from '@/components/ui/SectionCard'
import { Select } from '@/components/ui/Select'
import { discountPercent, formatPrice } from '@/lib/format'
import type { EditorValues } from './formSchema'

interface PricingSectionProps {
  form: UseFormReturn<EditorValues>
  disabled?: boolean
}

export const PricingSection = ({ form, disabled }: PricingSectionProps) => {
  const { register, control, formState } = form
  const { errors } = formState
  const price = useWatch({ control, name: 'priceInr' })
  const original = useWatch({ control, name: 'originalPriceInr' })
  const percent = typeof price === 'number' ? discountPercent(price, original) : 0

  return (
    <SectionCard id="pricing" title="Pricing and trip details" description="Prices are whole rupees, per person.">
      <fieldset disabled={disabled} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price (₹)" error={errors.priceInr?.message}>
            {({ id, describedBy, invalid }) => (
              <Controller
                control={control}
                name="priceInr"
                render={({ field }) => (
                  <NumberInput id={id} min={0} step={1} invalid={invalid} aria-describedby={describedBy} value={field.value} onChange={(v) => field.onChange(v ?? undefined)} onBlur={field.onBlur} />
                )}
              />
            )}
          </Field>

          <Field
            label="Original price (₹), optional"
            error={errors.originalPriceInr?.message}
            hint={original && percent > 0 ? undefined : 'Shown struck through when higher than the price.'}
          >
            {({ id, describedBy, invalid }) => (
              <Controller
                control={control}
                name="originalPriceInr"
                render={({ field }) => (
                  <NumberInput id={id} min={0} step={1} invalid={invalid} aria-describedby={describedBy} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                )}
              />
            )}
          </Field>
        </div>

        {typeof price === 'number' && price > 0 && (
          <p className="flex flex-wrap items-center gap-3 rounded-control bg-cream px-4 py-3 text-sm" aria-live="polite">
            <span className="text-muted">Visitors will see</span>
            <span className="font-heading text-2xl font-semibold text-indigo">{formatPrice(price)}</span>
            {original !== null && original > price && (
              <>
                <span className="text-muted line-through">{formatPrice(original)}</span>
                <Badge variant="danger">Save {percent}%</Badge>
              </>
            )}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Days" error={errors.durationDays?.message}>
            {({ id, describedBy, invalid }) => (
              <Controller control={control} name="durationDays" render={({ field }) => (
                <NumberInput id={id} min={1} invalid={invalid} aria-describedby={describedBy} value={field.value} onChange={(v) => field.onChange(v ?? undefined)} onBlur={field.onBlur} />
              )} />
            )}
          </Field>
          <Field label="Nights" error={errors.durationNights?.message}>
            {({ id, describedBy, invalid }) => (
              <Controller control={control} name="durationNights" render={({ field }) => (
                <NumberInput id={id} min={0} invalid={invalid} aria-describedby={describedBy} value={field.value} onChange={(v) => field.onChange(v ?? undefined)} onBlur={field.onBlur} />
              )} />
            )}
          </Field>
          <Field label="Max group size" error={errors.maxGroupSize?.message}>
            {({ id, describedBy, invalid }) => (
              <Controller control={control} name="maxGroupSize" render={({ field }) => (
                <NumberInput id={id} min={1} invalid={invalid} aria-describedby={describedBy} value={field.value} onChange={(v) => field.onChange(v ?? undefined)} onBlur={field.onBlur} />
              )} />
            )}
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Difficulty" error={errors.difficulty?.message}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} invalid={invalid} aria-describedby={describedBy} {...register('difficulty')}>
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HARD">Challenging</option>
              </Select>
            )}
          </Field>
          <Field label="Best time to visit" error={errors.bestTimeToVisit?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} invalid={invalid} aria-describedby={describedBy} placeholder="October to March" {...register('bestTimeToVisit')} />
            )}
          </Field>
        </div>

        <Field label="Meeting point" error={errors.meetingPoint?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} invalid={invalid} aria-describedby={describedBy} placeholder="Dashashwamedh Ghat, Steps 12" {...register('meetingPoint')} />
          )}
        </Field>
      </fieldset>
    </SectionCard>
  )
}
