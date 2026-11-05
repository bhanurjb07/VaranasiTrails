import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/toast'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { authApi } from '../api'
import { forgotEmailSchema } from '../schemas'

interface Values {
  email: string
}

export const ForgotEmailStep = ({ onSent }: { onSent: (email: string) => void }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(forgotEmailSchema), mode: 'onTouched' })

  const send = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    // The API answers the same way whether or not the account exists, and so do we.
    onSuccess: (_data, email) => onSent(email),
    onError: (error) => {
      if (!applyServerErrors(error, setError, ['email'])) toast.error(errorMessage(error))
    },
  })

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => send.mutate(forgotEmailSchema.parse(values).email))}
      className="space-y-5"
    >
      <Field label="Email" error={errors.email?.message} hint="We will send a 6-digit code if an account exists.">
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
      <Button type="submit" size="lg" className="w-full" loading={send.isPending}>
        Send code
      </Button>
    </form>
  )
}
