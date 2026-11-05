import { z } from 'zod'

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(2000, 'Message is too long'),
})

export type EnquiryValues = z.input<typeof enquirySchema>
