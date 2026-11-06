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
import { authApi } from './api'

const schema = z
  .object({
    oldPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters')
      .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), 'Include a letter and a number')
      .refine((value) => new TextEncoder().encode(value).length <= 72, 'Use at most 72 bytes'),
    confirm: z.string().min(1, 'Re-enter the new password'),
  })
  .refine((value) => value.newPassword === value.confirm, { path: ['confirm'], message: 'Passwords do not match' })

type Values = z.input<typeof schema>

export const ChangePasswordForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' })

  const change = useMutation({
    mutationFn: (values: Values) => authApi.changePassword(values.oldPassword, values.newPassword),
    onSuccess: () => {
      toast.success('Password changed. Other devices were signed out.')
      reset()
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'INVALID_PASSWORD') {
        setError('oldPassword', { message: 'Your current password is incorrect' })
        return
      }
      if (!applyServerErrors(error, setError, ['oldPassword', 'newPassword'])) toast.error(errorMessage(error))
    },
  })

  return (
    <form noValidate onSubmit={handleSubmit((values) => change.mutate(values))} className="max-w-md space-y-5">
      <Field label="Current password" error={errors.oldPassword?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="current-password" invalid={invalid} aria-describedby={describedBy} {...register('oldPassword')} />
        )}
      </Field>
      <Field label="New password" error={errors.newPassword?.message} hint="At least 8 characters with a letter and a number.">
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" invalid={invalid} aria-describedby={describedBy} {...register('newPassword')} />
        )}
      </Field>
      <Field label="Confirm new password" error={errors.confirm?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" invalid={invalid} aria-describedby={describedBy} {...register('confirm')} />
        )}
      </Field>
      <Button type="submit" loading={change.isPending}>
        Change password
      </Button>
    </form>
  )
}
