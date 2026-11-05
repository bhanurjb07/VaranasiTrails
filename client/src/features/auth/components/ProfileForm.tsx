import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { userApi } from '../userApi'
import { useAuth } from '../useAuth'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')),
})

type Values = z.input<typeof schema>

export const ProfileForm = () => {
  const { user, updateUser } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone.replace(/^\+91/, '') ?? '' },
  })

  const save = useMutation({
    mutationFn: userApi.update,
    onSuccess: ({ user: updated }, variables) => {
      updateUser(updated)
      reset({ name: updated.name, phone: updated.phone.replace(/^\+91/, '') || variables.phone || '' })
      toast.success('Profile updated')
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'PHONE_EXISTS') {
        setError('phone', { message: 'That number is already used by another account' })
        return
      }
      if (!applyServerErrors(error, setError, ['name', 'phone'])) toast.error(errorMessage(error))
    },
  })

  if (!user) return null

  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(schema.parse(values)))} className="space-y-5">
      <Field label="Email" hint={user.emailVerified ? 'Verified' : 'Not verified yet'}>
        {({ id, describedBy }) => <Input id={id} value={user.email} readOnly disabled aria-describedby={describedBy} />}
      </Field>
      <Field label="Full name" error={errors.name?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} autoComplete="name" invalid={invalid} aria-describedby={describedBy} {...register('name')} />
        )}
      </Field>
      <Field label="Mobile number" error={errors.phone?.message}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            invalid={invalid}
            aria-describedby={describedBy}
            {...register('phone')}
          />
        )}
      </Field>
      <Button type="submit" loading={save.isPending} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  )
}
