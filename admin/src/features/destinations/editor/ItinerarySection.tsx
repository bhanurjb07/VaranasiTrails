import { CircleAlert, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { SectionCard } from '@/components/ui/SectionCard'
import { SortableItem, SortableList } from '@/components/ui/SortableList'
import { Textarea } from '@/components/ui/Textarea'
import type { EditorValues } from './formSchema'

interface ItinerarySectionProps {
  form: UseFormReturn<EditorValues>
  disabled?: boolean
}

export const ItinerarySection = ({ form, disabled }: ItinerarySectionProps) => {
  const { control, register, formState } = form
  const { fields, append, remove, move } = useFieldArray({ control, name: 'itinerary' })
  const days = useWatch({ control, name: 'durationDays' })
  const errors = formState.errors.itinerary

  const mismatch = fields.length > 0 && typeof days === 'number' && days !== fields.length

  return (
    <SectionCard id="itinerary" title="Itinerary" description="One card per day. Drag to reorder; days are numbered automatically.">
      {mismatch && (
        <p className="mb-4 flex items-start gap-2 rounded-control bg-saffron-soft px-4 py-3 text-sm text-saffron-dark" role="status">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          The trip is set to {days} day{days === 1 ? '' : 's'} but the itinerary has {fields.length}. That is allowed, just check it is intended.
        </p>
      )}

      <SortableList ids={fields.map((field) => field.id)} onMove={move}>
        <ol className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.id}>
              <SortableItem id={field.id} handleLabel={`Reorder day ${index + 1}`} className="rounded-card border border-line bg-cream/40 p-4">
                {(handle) => (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      {handle}
                      <span className="rounded-full bg-saffron-soft px-2 py-0.5 text-xs font-bold text-saffron-dark">Day {index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <Field label={`Day ${index + 1} title`} error={errors?.[index]?.title?.message}>
                        {({ id, describedBy, invalid }) => (
                          <Input id={id} invalid={invalid} aria-describedby={describedBy} disabled={disabled} placeholder="Ghats, aarti and diyas" {...register(`itinerary.${index}.title` as const)} />
                        )}
                      </Field>
                      <Field label={`Day ${index + 1} description`} error={errors?.[index]?.description?.message}>
                        {({ id, describedBy, invalid }) => (
                          <Textarea id={id} rows={3} invalid={invalid} aria-describedby={describedBy} disabled={disabled} {...register(`itinerary.${index}.description` as const)} />
                        )}
                      </Field>
                    </div>
                    <Button variant="ghost" size="icon" aria-label={`Remove day ${index + 1}`} disabled={disabled} onClick={() => remove(index)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </SortableItem>
            </li>
          ))}
        </ol>
      </SortableList>

      <Button variant="outline" size="sm" className="mt-4" disabled={disabled} onClick={() => append({ title: '', description: '' })}>
        <Plus className="size-4" aria-hidden="true" /> Add day
      </Button>
    </SectionCard>
  )
}
