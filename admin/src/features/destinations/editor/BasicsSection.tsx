import { useEffect, useRef } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { SectionCard } from '@/components/ui/SectionCard'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useCategories } from '@/features/categories/useCategories'
import { slugify } from '@/lib/slug'
import type { EditorValues } from './formSchema'

interface BasicsSectionProps {
  form: UseFormReturn<EditorValues>
  /** New trips derive the slug from the title until the admin edits it by hand. */
  isNew: boolean
  disabled?: boolean
}

export const BasicsSection = ({ form, isNew, disabled }: BasicsSectionProps) => {
  const { register, control, setValue, formState } = form
  const { errors, dirtyFields } = formState
  const categories = useCategories()
  const title = useWatch({ control, name: 'title' })
  const slug = useWatch({ control, name: 'slug' })
  const overview = useWatch({ control, name: 'overview' }) ?? ''
  const slugEdited = useRef(false)

  useEffect(() => {
    if (isNew && !slugEdited.current && !dirtyFields.slug) {
      setValue('slug', slugify(title ?? ''), { shouldDirty: false })
    }
  }, [isNew, title, setValue, dirtyFields.slug])

  const slugField = register('slug')

  return (
    <SectionCard id="basics" title="Basics" description="What visitors read first.">
      <fieldset disabled={disabled} className="space-y-5">
        <Field label="Title" error={errors.title?.message}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} invalid={invalid} aria-describedby={describedBy} placeholder="Ganga Aarti & Evening Boat Ride" {...register('title')} />
          )}
        </Field>

        <Field
          label="URL slug"
          error={errors.slug?.message}
          hint={isNew ? `Public address: /destinations/${slug || 'your-trip'}` : 'Changing the slug changes the public address of this trip.'}
        >
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              invalid={invalid}
              aria-describedby={describedBy}
              placeholder="ganga-aarti-evening-boat-ride"
              {...slugField}
              onChange={(event) => {
                slugEdited.current = true
                void slugField.onChange(event)
              }}
            />
          )}
        </Field>

        <Field label="Tagline" error={errors.tagline?.message} hint="One line that sells the trip (shown on cards).">
          {({ id, describedBy, invalid }) => (
            <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('tagline')} />
          )}
        </Field>

        <Field label="Overview" error={errors.overview?.message} hint={`${overview.length} characters. Leave a blank line between paragraphs.`}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} rows={8} invalid={invalid} aria-describedby={describedBy} {...register('overview')} />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Category" error={errors.categoryId?.message}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} invalid={invalid} aria-describedby={describedBy} {...register('categoryId')}>
                <option value="">Choose a category</option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isActive ? '' : ' (inactive)'}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="City" error={errors.city?.message}>
            {({ id, describedBy, invalid }) => <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('city')} />}
          </Field>
          <Field label="State" error={errors.state?.message}>
            {({ id, describedBy, invalid }) => <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('state')} />}
          </Field>
        </div>
      </fieldset>
    </SectionCard>
  )
}
