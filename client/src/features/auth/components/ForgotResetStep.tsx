import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { authApi } from '../api'
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas'
import { PasswordInput } from './PasswordInput'
import { PasswordRules } from './PasswordRules'

interface ForgotResetStepProps {
  email: string
  resetToken: string
  onDone: () => void
  onTokenExpired: () => void
}

export const ForgotResetStep = ({ email, resetToken, onDone, onTokenExpired }: ForgotResetStepProps) => {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), mode: 'onTouched' })

  const newPasswordValue = useWatch({ control, name: 'newPassword' })

  const reset = useMutation({
    mutationFn: (newPassword: string) => authApi.resetPassword(email, resetToken, newPassword),
    onSuccess: onDone,
    onError: (error) => {
      if (isApiError(error) && error.code === 'RESET_TOKEN_INVALID') return onTokenExpired()
      if (applyServerErrors(error, setError, ['newPassword'])) return
      toast.error(errorMessage(error))
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => reset.mutate(values.newPassword))}
      className="space-y-5"
    >
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

      <Field label="Confirm new password" error={errors.confirm?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="new-password"
            invalid={invalid}
            aria-describedby={describedBy}
            {...register('confirm')}
          />
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={reset.isPending}>
        Update password
      </Button>
    </form>
  )
}
