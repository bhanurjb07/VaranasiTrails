import { z } from 'zod'

// Mirrors the server rules (server/src/schemas/common).

export const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'letter', label: 'One letter', test: (value: string) => /[A-Za-z]/.test(value) },
  { id: 'number', label: 'One number', test: (value: string) => /\d/.test(value) },
  { id: 'bytes', label: 'At most 72 bytes', test: (value: string) => new TextEncoder().encode(value).length <= 72 },
] as const

const email = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'))

const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ''))
  .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'))

const newPassword = z
  .string()
  .min(1, 'Create a password')
  .superRefine((value, ctx) => {
    const failed = passwordRules.find((rule) => !rule.test(value))
    if (failed) ctx.addIssue({ code: 'custom', message: `Password needs: ${failed.label.toLowerCase()}` })
  })

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80, 'Name is too long'),
  phone,
  email,
  password: newPassword,
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const forgotEmailSchema = z.object({ email })

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
})

export const resetPasswordSchema = z
  .object({
    newPassword,
    confirm: z.string().min(1, 'Re-enter your new password'),
  })
  .refine((value) => value.newPassword === value.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  })

export type SignupValues = z.input<typeof signupSchema>
export type LoginValues = z.input<typeof loginSchema>
export type ResetPasswordValues = z.input<typeof resetPasswordSchema>
