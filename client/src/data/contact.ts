// Contact details and WhatsApp message templates.
// TODO(business): replace the placeholder phone and WhatsApp numbers.

export const contact = {
  phoneDisplay: '+91 98765 43210',
  phoneTel: '+919876543210',
  /** International format, digits only, no "+" (the wa.me format). */
  whatsappNumber: '919876543210',
  whatsappDisplay: '+91 98765 43210',
} as const

/**
 * Message templates. {tokens} are filled by buildWhatsAppUrl(). A sentence that
 * references a token with no value is dropped, so a visitor who is not logged in
 * simply gets a message without the "My name is ..." sentence.
 */
export const whatsappTemplates = {
  destinationEnquiry:
    "Hi VaranasiTrails, I'm interested in *{destination}* ({duration}, from ₹{price}). Link: {url}. My name is {name}.",
  generalEnquiry:
    "Hi VaranasiTrails, I'd like to plan a trip to Varanasi and would love some advice. My name is {name}.",
} as const

export type WhatsAppTemplateKey = keyof typeof whatsappTemplates
