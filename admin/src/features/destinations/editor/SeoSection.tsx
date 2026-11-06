import { useWatch, type UseFormReturn } from 'react-hook-form'

import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { SectionCard } from '@/components/ui/SectionCard'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/cn'
import { env } from '@/lib/env'
import type { EditorValues } from './formSchema'

const TITLE_LIMIT = 60
const DESCRIPTION_LIMIT = 160

const Counter = ({ length, limit }: { length: number; limit: number }) => (
  <span className={cn('text-xs tabular-nums', length > limit ? 'font-semibold text-danger' : 'text-muted')}>
    {length}/{limit}
  </span>
)

interface SeoSectionProps {
  form: UseFormReturn<EditorValues>
  disabled?: boolean
}

export const SeoSection = ({ form, disabled }: SeoSectionProps) => {
  const { register, control, formState } = form
  const { errors } = formState
  const title = useWatch({ control, name: 'title' }) ?? ''
  const tagline = useWatch({ control, name: 'tagline' }) ?? ''
  const slug = useWatch({ control, name: 'slug' }) ?? ''
  const metaTitle = useWatch({ control, name: 'metaTitle' }) ?? ''
  const metaDescription = useWatch({ control, name: 'metaDescription' }) ?? ''

  // What the public site falls back to when the SEO fields are empty.
  const shownTitle = (metaTitle || title || 'Your trip title') + ' | VaranasiTrails'
  const shownDescription = metaDescription || tagline || 'The tagline is used when there is no meta description.'
  const host = env.publicSiteUrl.replace(/^https?:\/\//, '')

  return (
    <SectionCard id="seo" title="Search appearance (SEO)" description="Optional. Leave empty to use the title and tagline.">
      <fieldset disabled={disabled} className="space-y-5">
        <Field label="Meta title" error={errors.metaTitle?.message} hint={undefined}>
          {({ id, describedBy, invalid }) => (
            <div className="space-y-1">
              <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('metaTitle')} />
              <div className="text-right">
                <Counter length={metaTitle.length} limit={TITLE_LIMIT} />
              </div>
            </div>
          )}
        </Field>

        <Field label="Meta description" error={errors.metaDescription?.message}>
          {({ id, describedBy, invalid }) => (
            <div className="space-y-1">
              <Textarea id={id} rows={3} invalid={invalid} aria-describedby={describedBy} {...register('metaDescription')} />
              <div className="text-right">
                <Counter length={metaDescription.length} limit={DESCRIPTION_LIMIT} />
              </div>
            </div>
          )}
        </Field>

        <div aria-label="Search result preview" className="rounded-card border border-line bg-white p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Search result preview</p>
          <p className="truncate text-xs text-muted">{host} &rsaquo; destinations &rsaquo; {slug || 'your-trip'}</p>
          <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{shownTitle.slice(0, 70)}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted">{shownDescription.slice(0, 170)}</p>
        </div>
      </fieldset>
    </SectionCard>
  )
}
