import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { passwordRules } from '../schemas'
import { userApi } from '../userApi'
import { PasswordInput } from './PasswordInput'
import { PasswordRules } from './PasswordRules'

const schema = z.object({
  oldPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z
    .string()
    .min(1, 'Choose a new password')
    .superRefine((value, ctx) => {
      const failed = passwordRules.find((rule) => !rule.test(value))
      if (failed) ctx.addIssue({ code: 'custom', message: `Password needs: ${failed.label.toLowerCase()}` })
    }),
})

type Values = z.input<typeof schema>

export const ChangePasswordForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' })

  const newPasswordValue = useWatch({ control, name: 'newPassword' })

  const change = useMutation({
    mutationFn: (values: Values) => userApi.changePassword(values.oldPassword, values.newPassword),
    onSuccess: () => {
      toast.success('Password changed. Other devices have been signed out.')
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
    <form noValidate onSubmit={handleSubmit((values) => change.mutate(values))} className="space-y-5">
      <Field label="Current password" error={errors.oldPassword?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="current-password"
            invalid={invalid}
            aria-describedby={describedBy}
            {...register('oldPassword')}
          />
        )}
      </Field>
      <Field label="New password" error={errors.newPassword?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="new-password"
            invalid={invalid}
            aria-describedby={describedBy}
            {...register('newPassword')}
          />
        )}
      </Field>
      <PasswordRules value={newPasswordValue ?? ''} />
      <Button type="submit" loading={change.isPending}>
        Change password
      </Button>
    </form>
  )
}
