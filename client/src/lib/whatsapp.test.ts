import { describe, expect, it } from 'vitest'

import { contact } from '@/data/contact'
import { buildWhatsAppUrl, fillTemplate } from './whatsapp'

const decode = (url: string) => decodeURIComponent(new URL(url).searchParams.get('text') ?? '')

describe('fillTemplate', () => {
  it('fills every {token}', () => {
    expect(fillTemplate('Hi {name}, you chose {trip}.', { name: 'Asha', trip: 'Boat Ride' })).toBe(
      'Hi Asha, you chose Boat Ride.',
    )
  })

  it('accepts numbers and trims values', () => {
    expect(fillTemplate('From Rs {price} for {who}.', { price: 1499, who: '  Asha ' })).toBe('From Rs 1499 for Asha.')
  })

  it('drops a sentence whose token is missing, empty or null', () => {
    const template = 'Hi there. My name is {name}. See you soon.'

    expect(fillTemplate(template, {})).toBe('Hi there. See you soon.')
    expect(fillTemplate(template, { name: '' })).toBe('Hi there. See you soon.')
    expect(fillTemplate(template, { name: '   ' })).toBe('Hi there. See you soon.')
    expect(fillTemplate(template, { name: null })).toBe('Hi there. See you soon.')
    expect(fillTemplate(template, { name: undefined })).toBe('Hi there. See you soon.')
  })

  it('removes unknown tokens cleanly instead of printing them', () => {
    const text = fillTemplate('Hello. Your code is {secret}. Bye.', { name: 'Asha' })

    expect(text).toBe('Hello. Bye.')
    expect(text).not.toContain('{')
  })

  it('keeps a token that appears twice', () => {
    expect(fillTemplate('{a} and {a}.', { a: 'x' })).toBe('x and x.')
  })
})

describe('buildWhatsAppUrl', () => {
  it('targets the configured number on wa.me', () => {
    const url = buildWhatsAppUrl('generalEnquiry', { name: 'Asha' })

    expect(url.startsWith(`https://wa.me/${contact.whatsappNumber}?text=`)).toBe(true)
  })

  it('builds the destination enquiry message', () => {
    const url = buildWhatsAppUrl('destinationEnquiry', {
      destination: 'Ganga Aarti',
      duration: '1 day',
      price: '1,499',
      url: 'https://example.com/destinations/ganga-aarti',
      name: 'Asha',
    })

    expect(decode(url)).toBe(
      "Hi VaranasiTrails, I'm interested in *Ganga Aarti* (1 day, from ₹1,499). Link: https://example.com/destinations/ganga-aarti. My name is Asha.",
    )
  })

  it('omits the name sentence for visitors who are not logged in', () => {
    const message = decode(buildWhatsAppUrl('generalEnquiry', {}))

    expect(message).toContain("I'd like to plan a trip")
    expect(message).not.toContain('My name is')
  })

  it('percent-encodes the rupee sign, asterisks and newlines', () => {
    const url = buildWhatsAppUrl('destinationEnquiry', {
      destination: 'Line one\nLine two',
      duration: '1 day',
      price: '999',
      url: 'https://example.com',
    })

    expect(url).toContain('%E2%82%B9') // ₹
    expect(url).toContain('%2A') // *
    expect(url).toContain('%0A') // newline
    expect(url).not.toContain('*')
    expect(url).not.toContain('\n')
    expect(url).not.toContain('₹')
  })

  it('uses a custom number when given', () => {
    expect(buildWhatsAppUrl('generalEnquiry', {}, '911234567890').startsWith('https://wa.me/911234567890?text=')).toBe(
      true,
    )
  })
})
