import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { authApi } from '../api'
import { signupSchema, type SignupValues } from '../schemas'
import { PasswordInput } from './PasswordInput'
import { PasswordRules } from './PasswordRules'

export const SignupForm = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: 'onTouched' })

  const signup = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (_data, variables) => {
      toast.success('Account created. Check your email for the code.')
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`, { state: { fromSignup: true } })
    },
    onError: (error) => {
      if (applyServerErrors(error, setError, ['name', 'phone', 'email', 'password'])) return
      if (isApiError(error) && error.code === 'ACCOUNT_EXISTS') {
        setError('email', { message: error.message })
        return
      }
      toast.error(errorMessage(error))
    },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        // Parsed values carry the normalised email and phone.
        const parsed = signupSchema.parse(values)
        signup.mutate(parsed)
      })}
      className="space-y-5"
    >
      <Field label="Full name" error={errors.name?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} autoComplete="name" invalid={invalid} aria-describedby={describedBy} {...register('name')} />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              invalid={invalid}
              aria-describedby={describedBy}
              {...register('email')}
            />
          )}
        </Field>
        <Field label="Mobile number" error={errors.phone?.message} hint="10-digit Indian number">
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="98765 43210"
              invalid={invalid}
              aria-describedby={describedBy}
              {...register('phone')}
            />
          )}
        </Field>
      </div>

      <Field label="Password" error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="new-password"
            invalid={invalid}
            aria-describedby={describedBy}
            {...register('password')}
          />
        )}
      </Field>
      <PasswordRules value={password} />

      <Button type="submit" size="lg" className="w-full" loading={signup.isPending}>
        Create account
      </Button>
    </form>
  )
}
