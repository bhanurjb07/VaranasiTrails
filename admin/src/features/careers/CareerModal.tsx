import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import type { AdminCareer } from '@/types/api'
import type { CareerInput } from './api'
import { departmentSuggestions, employmentLabels, todayInIndia, workModeLabels } from './labels'
import { useCareerMutations, useDepartments } from './useCareers'

const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

const isApplyLink = (value: string) => {
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

const schema = z.object({
  title: z.string().trim().min(3, 'Add a role title (at least 3 characters)').max(120, 'Keep the title under 120 characters'),
  department: z.string().trim().min(2, 'Add a department, for example Backend').max(80),
  location: z.string().trim().min(2, 'Add a location, or write Remote').max(120),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  workMode: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
  experience: z.string().trim().max(80),
  salary: z.string().trim().max(80),
  aboutRole: z.string().trim().min(20, 'Describe the role in at least 20 characters').max(5000),
  responsibilities: z.string().refine((value) => lines(value).length <= 30, 'Use at most 30 lines'),
  requirements: z.string().refine((value) => lines(value).length >= 1, 'Add at least one requirement'),
  applyUrl: z.string().trim().refine(isApplyLink, 'Use a link starting with https:// or an email link like mailto:jobs@example.com'),
  closesAt: z.string().refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Pick a date'),
  isPublished: z.boolean(),
})

type Values = z.input<typeof schema>

const toPayload = (values: Values): CareerInput => ({
  title: values.title.trim(),
  department: values.department.trim(),
  location: values.location.trim(),
  employmentType: values.employmentType,
  workMode: values.workMode,
  experience: values.experience.trim() || null,
  salary: values.salary.trim() || null,
  aboutRole: values.aboutRole.trim(),
  responsibilities: lines(values.responsibilities),
  requirements: lines(values.requirements),
  applyUrl: values.applyUrl.trim(),
  closesAt: values.closesAt || null,
  isPublished: values.isPublished,
})

const initialValues = (career?: AdminCareer): Values => ({
  title: career?.title ?? '',
  department: career?.department ?? '',
  location: career?.location ?? 'Varanasi',
  employmentType: career?.employmentType ?? 'FULL_TIME',
  workMode: career?.workMode ?? 'ONSITE',
  experience: career?.experience ?? '',
  salary: career?.salary ?? '',
  aboutRole: career?.aboutRole ?? '',
  responsibilities: (career?.responsibilities ?? []).join('\n'),
  requirements: (career?.requirements ?? []).join('\n'),
  applyUrl: career?.applyUrl ?? '',
  closesAt: career?.closesAt ? career.closesAt.slice(0, 10) : '',
  isPublished: career?.isPublished ?? false,
})

const serverFields = [
  'title', 'department', 'location', 'employmentType', 'workMode', 'experience', 'salary',
  'aboutRole', 'responsibilities', 'requirements', 'applyUrl', 'closesAt',
] as const

interface CareerModalProps {
  open: boolean
  onClose: () => void
  /** The listing being edited, or undefined to create one. */
  career?: AdminCareer
}

export const CareerModal = ({ open, onClose, career }: CareerModalProps) => {
  const departmentListId = useId()
  const { create, update } = useCareerMutations()
  const used = useDepartments()
  const departments = useMemo(
    () => [...new Set([...(used.data ?? []), ...departmentSuggestions])].sort((a, b) => a.localeCompare(b)),
    [used.data],
  )

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: initialValues(career), mode: 'onTouched' })

  const saving = create.isPending || update.isPending
  const today = todayInIndia()
  const keptDate = career?.closesAt ? career.closesAt.slice(0, 10) : null

  const onError = (error: unknown) => {
    if (!applyServerErrors(error, setError, serverFields)) toast.error(errorMessage(error))
  }

  const submit = handleSubmit((values) => {
    const payload = toPayload(schema.parse(values))
    // A new closing date cannot be in the past. An unchanged old date on a closed listing is left alone.
    if (payload.closesAt && payload.closesAt < today && payload.closesAt !== keptDate) {
      setError('closesAt', { message: 'That date has already passed. Pick today or a later date.' })
      return
    }
    if (career) update.mutate({ id: career.id, input: payload }, { onSuccess: onClose, onError })
    else create.mutate(payload, { onSuccess: onClose, onError })
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={career ? 'Edit job listing' : 'New job listing'}
      description="Published listings appear on the Careers page of the website."
      className="max-w-2xl"
    >
      <form noValidate onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Role" error={errors.title?.message}>
            {({ id, describedBy, invalid }) => (
              <Input id={id} invalid={invalid} aria-describedby={describedBy} placeholder="Backend Developer" {...register('title')} />
            )}
          </Field>
          <Field label="Department" error={errors.department?.message} hint="Pick one or type your own.">
            {({ id, describedBy, invalid }) => (
              <>
                <Input id={id} list={departmentListId} invalid={invalid} aria-describedby={describedBy} placeholder="Backend" {...register('department')} />
                <datalist id={departmentListId}>
                  {departments.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
          <Field label="Location" error={errors.location?.message}>
            {({ id, describedBy, invalid }) => <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('location')} />}
          </Field>
          <Field label="Closing date" error={errors.closesAt?.message} hint="Optional. The listing hides itself at the end of this day (India time).">
            {({ id, describedBy, invalid }) => (
              <Input id={id} type="date" min={keptDate && keptDate < today ? keptDate : today} invalid={invalid} aria-describedby={describedBy} {...register('closesAt')} />
            )}
          </Field>
          <Field label="Type" error={errors.employmentType?.message}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} invalid={invalid} aria-describedby={describedBy} {...register('employmentType')}>
                {Object.entries(employmentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Work mode" error={errors.workMode?.message}>
            {({ id, describedBy, invalid }) => (
              <Select id={id} invalid={invalid} aria-describedby={describedBy} {...register('workMode')}>
                {Object.entries(workModeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Experience" error={errors.experience?.message} hint="Optional, for example 2+ years or Fresher.">
            {({ id, describedBy, invalid }) => <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('experience')} />}
          </Field>
          <Field label="Pay" error={errors.salary?.message} hint="Optional, for example 6 to 9 LPA.">
            {({ id, describedBy, invalid }) => <Input id={id} invalid={invalid} aria-describedby={describedBy} {...register('salary')} />}
          </Field>
        </div>

        <Field label="About the role" error={errors.aboutRole?.message}>
          {({ id, describedBy, invalid }) => (
            <Textarea id={id} rows={4} invalid={invalid} aria-describedby={describedBy} placeholder="What the person will work on and who they will work with." {...register('aboutRole')} />
          )}
        </Field>

        <Field label="Responsibilities" error={errors.responsibilities?.message} hint="Optional. One per line.">
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={4} invalid={invalid} aria-describedby={describedBy} {...register('responsibilities')} />}
        </Field>

        <Field label="Requirements" error={errors.requirements?.message} hint="One per line, for example Node.js and TypeScript.">
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={4} invalid={invalid} aria-describedby={describedBy} {...register('requirements')} />}
        </Field>

        <Field label="Apply link" error={errors.applyUrl?.message} hint="A form or page, or an email link such as mailto:jobs@example.com.">
          {({ id, describedBy, invalid }) => (
            <Input id={id} type="url" inputMode="url" invalid={invalid} aria-describedby={describedBy} placeholder="https://" {...register('applyUrl')} />
          )}
        </Field>

        <div className="flex items-center justify-between gap-4 rounded-control border border-line px-4 py-3">
          <div>
            <p className="text-sm font-medium text-indigo">Show on the Careers page</p>
            <p className="text-xs text-muted">Leave this off to keep the listing as a draft.</p>
          </div>
          <Controller control={control} name="isPublished" render={({ field }) => <Switch label="Show on the Careers page" checked={field.value} onChange={field.onChange} />} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {career ? 'Save changes' : 'Create listing'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
