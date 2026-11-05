import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { authApi } from '../api'
import { loginSchema, type LoginValues } from '../schemas'
import { useAuth } from '../useAuth'
import { PasswordInput } from './PasswordInput'

interface LocationState {
  from?: string
}

export const LoginForm = () => {
  const { startSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onTouched' })

  const login = useMutation({
    mutationFn: (values: { email: string; password: string }) => authApi.login(values.email, values.password),
    onSuccess: (session) => {
      startSession(session)
      toast.success(`Welcome back, ${session.user.name.split(' ')[0]}`)
      navigate(from, { replace: true })
    },
    onError: (error, variables) => {
      if (isApiError(error) && error.code === 'EMAIL_NOT_VERIFIED') {
        toast.info('Please verify your email to continue.')
        navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`, { state: { from } })
        return
      }
      if (applyServerErrors(error, setError, ['email', 'password'])) return
      toast.error(errorMessage(error))
    },
  })

  return (
    <form noValidate onSubmit={handleSubmit((values) => login.mutate(loginSchema.parse(values)))} className="space-y-5">
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

      <Field label="Password" error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <PasswordInput
            id={id}
            autoComplete="current-password"
            invalid={invalid}
            aria-describedby={describedBy}
            {...register('password')}
          />
        )}
      </Field>

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-sm font-medium text-saffron-dark hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        Log in
      </Button>
    </form>
  )
}
