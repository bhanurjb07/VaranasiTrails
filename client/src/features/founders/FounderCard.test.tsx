import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { Founder } from '@/data/founder'
import { FounderCard } from './FounderCard'

const founder = (overrides: Partial<Founder> = {}): Founder => ({
  id: 'f1',
  name: 'Asha Verma',
  role: 'Co-founder',
  photo: '/asha.jpg',
  photoAlt: 'Portrait of Asha Verma',
  shortIntro: 'Asha plans the trips.',
  fullIntro: ['She grew up in Varanasi.', 'She started the company in the old city.'],
  instagram: 'https://www.instagram.com/asha',
  facebook: 'https://www.facebook.com/asha',
  phone: '+919876543210',
  email: 'asha@example.com',
  ...overrides,
})

describe('FounderCard', () => {
  it('shows the photo, name, role and short introduction', () => {
    render(<FounderCard founder={founder()} />)

    expect(screen.getByRole('img', { name: 'Portrait of Asha Verma' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Asha Verma' })).toBeTruthy()
    expect(screen.getByText('Co-founder')).toBeTruthy()
    expect(screen.getByText('Asha plans the trips.')).toBeTruthy()
  })

  it('keeps the long introduction hidden until Know more is pressed, in the same card', async () => {
    render(<FounderCard founder={founder()} />)
    const button = screen.getByRole('button', { name: 'Know more' })

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.getByText('She grew up in Varanasi.').closest('div')?.hasAttribute('hidden')).toBe(true)

    await userEvent.click(button)

    expect(screen.getByRole('button', { name: 'Show less' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('She grew up in Varanasi.').closest('div')?.hasAttribute('hidden')).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: 'Show less' }))
    expect(screen.getByText('She grew up in Varanasi.').closest('div')?.hasAttribute('hidden')).toBe(true)
  })

  it('links the phone, email, Instagram and Facebook', () => {
    render(<FounderCard founder={founder()} />)

    expect(screen.getByRole('link', { name: '+91 98765 43210' }).getAttribute('href')).toBe('tel:+919876543210')
    expect(screen.getByRole('link', { name: 'asha@example.com' }).getAttribute('href')).toBe('mailto:asha@example.com')

    const instagram = screen.getByRole('link', { name: 'Asha Verma on Instagram' })
    expect(instagram.getAttribute('href')).toBe('https://www.instagram.com/asha')
    expect(instagram.getAttribute('target')).toBe('_blank')
    expect(instagram.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByRole('link', { name: 'Asha Verma on Facebook' }).getAttribute('href')).toBe('https://www.facebook.com/asha')
  })

  it('hides every contact item that is empty', () => {
    render(<FounderCard founder={founder({ instagram: '', facebook: '', phone: '', email: '' })} />)

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByLabelText(/on social media/i)).toBeNull()
  })

  it('shows only the contact items that are set', () => {
    render(<FounderCard founder={founder({ facebook: '', phone: '' })} />)

    expect(screen.getByRole('link', { name: 'Asha Verma on Instagram' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'asha@example.com' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /facebook/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /\+91/ })).toBeNull()
  })

  it('does not link social addresses that are not web links', () => {
    render(<FounderCard founder={founder({ instagram: 'javascript:alert(1)', facebook: '@asha' })} />)

    expect(screen.queryByRole('link', { name: /instagram|facebook/i })).toBeNull()
  })

  it('has no Know more button without a long introduction', () => {
    render(<FounderCard founder={founder({ fullIntro: [] })} />)

    expect(screen.queryByRole('button', { name: 'Know more' })).toBeNull()
  })
})
