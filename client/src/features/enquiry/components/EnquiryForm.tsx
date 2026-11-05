import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/toast'
import { useAuth } from '@/features/auth/useAuth'
import { applyServerErrors, errorMessage } from '@/lib/formErrors'
import { enquiryApi } from '../api'
import { enquirySchema, type EnquiryValues } from '../schemas'

interface EnquiryFormProps {
  /** When set, the enquiry is attached to this trip. */
  destination?: { id: string; title: string }
  onSent?: () => void
}

export const EnquiryForm = ({ destination, onSent }: EnquiryFormProps) => {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    mode: 'onTouched',
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone?.replace(/^\+91/, '') ?? '',
      message: destination ? `Hi, I'd like to know more about "${destination.title}".` : '',
    },
  })

  const send = useMutation({
    mutationFn: enquiryApi.create,
    onSuccess: () => {
      toast.success('Thanks! We will get back to you soon.')
      reset()
      onSent?.()
    },
    onError: (error) => {
      if (!applyServerErrors(error, setError, ['name', 'email', 'phone', 'message'])) {
        toast.error(errorMessage(error))
      }
    },
  })

  if (send.isSuccess) {
    return (
      <div className="flex flex-col items-center py-8 text-center" role="status">
        <CircleCheck className="mb-3 size-12 text-success" aria-hidden="true" />
        <h3 className="text-2xl">Enquiry sent</h3>
        <p className="mt-2 text-muted">We usually reply within a few hours. Keep an eye on your phone and email.</p>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        send.mutate({ ...enquirySchema.parse(values), destinationId: destination?.id }),
      )}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={errors.name?.message}>
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
      </div>
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
      <Field label="Message" error={errors.message?.message}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} rows={5} invalid={invalid} aria-describedby={describedBy} {...register('message')} />
        )}
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={send.isPending}>
        Send enquiry
      </Button>
    </form>
  )
}
