import type { UseFormReturn } from 'react-hook-form'

import { SectionCard } from '@/components/ui/SectionCard'
import type { EditorValues } from './formSchema'
import { StringListEditor } from './StringListEditor'

interface SectionProps {
  form: UseFormReturn<EditorValues>
  disabled?: boolean
}

export const HighlightsSection = ({ form, disabled }: SectionProps) => (
  <SectionCard id="highlights" title="Highlights" description="Short selling points. Drag to reorder.">
    <StringListEditor
      name="highlights"
      control={form.control}
      register={form.register}
      errors={form.formState.errors}
      singular="Highlight"
      placeholder="Floating diya offering at sunset"
      disabled={disabled}
    />
  </SectionCard>
)

export const InclusionsSection = ({ form, disabled }: SectionProps) => (
  <SectionCard id="inclusions" title="Included and not included" description="Be specific, it avoids surprises later.">
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold tracking-wide text-success uppercase">Included</h3>
        <StringListEditor
          name="inclusions"
          control={form.control}
          register={form.register}
          errors={form.formState.errors}
          singular="Inclusion"
          placeholder="Boat ride with boatman"
          disabled={disabled}
        />
      </div>
      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold tracking-wide text-maroon uppercase">Not included</h3>
        <StringListEditor
          name="exclusions"
          control={form.control}
          register={form.register}
          errors={form.formState.errors}
          singular="Exclusion"
          placeholder="Hotel pickup and drop"
          disabled={disabled}
        />
      </div>
    </div>
  </SectionCard>
)
