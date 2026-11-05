import { contact, whatsappTemplates, type WhatsAppTemplateKey } from '@/data/contact'

export type TemplateVars = Readonly<Record<string, string | number | null | undefined>>

const TOKEN = /\{(\w+)\}/g

const hasValue = (value: string | number | null | undefined): value is string | number =>
  value !== undefined && value !== null && String(value).trim() !== ''

/**
 * Fills {tokens}. A sentence that references a token with no value (missing or
 * unknown) is dropped whole, so no dangling "My name is ." is ever sent.
 */
export const fillTemplate = (template: string, vars: TemplateVars): string => {
  const sentences = template.split(/(?<=[.!?])\s+/)

  const filled = sentences.flatMap((sentence) => {
    const tokens = [...sentence.matchAll(TOKEN)].map((match) => match[1] as string)
    if (tokens.some((token) => !hasValue(vars[token]))) return []
    return [sentence.replace(TOKEN, (_all, token: string) => String(vars[token]).trim())]
  })

  return filled.join(' ').replace(/[ \t]{2,}/g, ' ').trim()
}

const encode = (message: string) => encodeURIComponent(message).replace(/\*/g, '%2A')

export const buildWhatsAppUrl = (
  templateKey: WhatsAppTemplateKey,
  vars: TemplateVars = {},
  number: string = contact.whatsappNumber,
): string => {
  const message = fillTemplate(whatsappTemplates[templateKey], vars)
  return `https://wa.me/${number}?text=${encode(message)}`
}
