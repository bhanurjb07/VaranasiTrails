import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SortableItem, SortableList } from '@/components/ui/SortableList'
import type { EditorValues } from './formSchema'

type ListName = 'highlights' | 'inclusions' | 'exclusions'

interface StringListEditorProps {
  name: ListName
  control: Control<EditorValues>
  register: UseFormRegister<EditorValues>
  errors: FieldErrors<EditorValues>
  singular: string
  placeholder: string
  disabled?: boolean
}

/** Editable, drag-sortable list of short text lines (highlights, inclusions, exclusions). */
export const StringListEditor = ({ name, control, register, errors, singular, placeholder, disabled }: StringListEditorProps) => {
  const { fields, append, remove, move } = useFieldArray({ control, name })

  return (
    <div>
      {fields.length === 0 && <p className="mb-3 text-sm text-muted">Nothing here yet.</p>}

      <SortableList ids={fields.map((field) => field.id)} onMove={move}>
        <ul className="space-y-2">
          {fields.map((field, index) => (
            <li key={field.id}>
              <SortableItem id={field.id} handleLabel={`Reorder ${singular} ${index + 1}`}>
                {(handle) => (
                  <div>
                    <div className="flex items-center gap-2">
                      {handle}
                      <Input
                        aria-label={`${singular} ${index + 1}`}
                        placeholder={placeholder}
                        invalid={Boolean(errors[name]?.[index]?.value)}
                        disabled={disabled}
                        {...register(`${name}.${index}.value` as const)}
                      />
                      <Button variant="ghost" size="icon" aria-label={`Remove ${singular} ${index + 1}`} disabled={disabled} onClick={() => remove(index)}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                    {errors[name]?.[index]?.value && (
                      <p role="alert" className="mt-1 pl-10 text-sm text-danger">
                        {errors[name]?.[index]?.value?.message}
                      </p>
                    )}
                  </div>
                )}
              </SortableItem>
            </li>
          ))}
        </ul>
      </SortableList>

      <Button variant="outline" size="sm" className="mt-3" disabled={disabled} onClick={() => append({ value: '' })}>
        <Plus className="size-4" aria-hidden="true" /> Add {singular.toLowerCase()}
      </Button>
    </div>
  )
}
