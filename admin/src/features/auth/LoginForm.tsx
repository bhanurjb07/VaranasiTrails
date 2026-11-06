import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/toast'
import { isApiError } from '@/lib/apiClient'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { authApi } from './api'
import { useAuth } from './useAuth'

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Enter your password'),
})

type Values = z.input<typeof schema>

export const LoginForm = () => {
  const { startSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [visible, setVisible] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' })

  const login = useMutation({
    mutationFn: (values: { email: string; password: string }) => authApi.login(values.email, values.password),
    onSuccess: (session) => {
      if (startSession(session)) {
        navigate(from, { replace: true })
      } else {
        setNotice('This account does not have admin access.')
      }
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'ACCOUNT_BLOCKED') {
        setNotice('This account has been blocked.')
        return
      }
      if (isApiError(error) && error.code === 'EMAIL_NOT_VERIFIED') {
        setNotice('This account has not verified its email yet.')
        return
      }
      if (applyServerErrors(error, setError, ['email', 'password'])) return
      if (isApiError(error) && error.code === 'INVALID_CREDENTIALS') {
        setNotice('Incorrect email or password.')
        return
      }
      toast.error(errorMessage(error))
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        setNotice(null)
        login.mutate(schema.parse(values))
      })}
      className="space-y-5"
    >
      {notice && (
        <p role="alert" className="rounded-control border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          {notice}
        </p>
      )}

      <Field label="Email" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="email" autoComplete="username" invalid={invalid} aria-describedby={describedBy} {...register('email')} />
        )}
      </Field>

      <Field label="Password" error={errors.password?.message}>
        {({ id, describedBy, invalid }) => (
          <div className="relative">
            <Input
              id={id}
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              invalid={invalid}
              aria-describedby={describedBy}
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-indigo"
            >
              {visible ? <EyeOff className="size-4.5" aria-hidden="true" /> : <Eye className="size-4.5" aria-hidden="true" />}
            </button>
          </div>
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        Log in
      </Button>
    </form>
  )
}
