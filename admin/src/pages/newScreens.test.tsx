import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { AboutEditorPage } from './AboutEditorPage'
import { AvailabilityPage } from './AvailabilityPage'
import { BookingsPage } from './BookingsPage'
import { ContentPage } from './ContentPage'
import { CouponsPage } from './CouponsPage'
import { CustomersPage } from './CustomersPage'
import { ExportPage } from './ExportPage'
import { LegalPage } from './LegalPage'
import { MediaPage } from './MediaPage'
import { ReportsPage } from './ReportsPage'
import { SettingsPage } from './SettingsPage'

// jsdom has no <dialog> behaviour; give it just enough for the Modal component.
beforeEach(() => {
  localStorage.clear()
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
})

const wrap = (node: ReactNode) => (
  <QueryClientProvider client={new QueryClient()}>
    <MemoryRouter>{node}</MemoryRouter>
  </QueryClientProvider>
)

describe('screens that are saved in the browser', () => {
  it.each([
    ['Bookings', <BookingsPage />, /^bookings$/i],
    ['Customers', <CustomersPage />, /^customers$/i],
    ['Coupons', <CouponsPage />, /^coupons$/i],
    ['Media library', <MediaPage />, /media library/i],
    ['Availability', <AvailabilityPage />, /^availability$/i],
    ['Reports', <ReportsPage />, /^reports$/i],
    ['Export', <ExportPage />, /export and backup/i],
    ['Business details', <SettingsPage />, /business details/i],
    ['Offers and homepage', <ContentPage />, /offers and homepage/i],
    ['About and founders', <AboutEditorPage />, /about and founders/i],
    ['Legal pages', <LegalPage />, /legal pages/i],
  ])('%s opens with its title and the browser-only notice', (_name, page, title) => {
    render(wrap(page))

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
    expect(screen.getByText(/front end only for now/i)).toBeTruthy()
  })
})

describe('bookings', () => {
  it('starts empty, loads sample data on request and filters by status', async () => {
    render(wrap(<BookingsPage />))

    expect(screen.getByText('No bookings yet')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /load sample data/i }))

    expect(screen.getByText('Asha Verma')).toBeTruthy()
    await userEvent.click(screen.getByRole('tab', { name: /cancelled/i }))
    expect(screen.queryByText('Asha Verma')).toBeNull()
    expect(screen.getByText('Lena Fischer')).toBeTruthy()
  })

  it('asks for the required fields, then saves a new booking', async () => {
    render(wrap(<BookingsPage />))

    await userEvent.click(screen.getAllByRole('button', { name: /new booking/i })[0]!)
    await userEvent.click(screen.getByRole('button', { name: /add booking/i }))
    expect(screen.getByText('Enter customer name')).toBeTruthy()

    await userEvent.type(screen.getByLabelText(/customer name/i), 'Tara Singh')
    await userEvent.type(screen.getByLabelText(/phone or whatsapp/i), '+919800000000')
    await userEvent.type(screen.getByLabelText(/^trip \*/i), 'Sunrise boat ride')
    await userEvent.type(screen.getByLabelText(/total price/i), '3000')
    await userEvent.click(screen.getByRole('button', { name: /add booking/i }))

    expect(screen.getByText('Tara Singh')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('vt-admin:bookings') ?? '[]')).toHaveLength(1)
  })

  it('refuses an amount received that is more than the total', async () => {
    render(wrap(<BookingsPage />))

    await userEvent.click(screen.getAllByRole('button', { name: /new booking/i })[0]!)
    await userEvent.type(screen.getByLabelText(/customer name/i), 'Tara Singh')
    await userEvent.type(screen.getByLabelText(/phone or whatsapp/i), '+919800000000')
    await userEvent.type(screen.getByLabelText(/^trip \*/i), 'Sunrise boat ride')
    await userEvent.type(screen.getByLabelText(/total price/i), '1000')
    const received = screen.getByLabelText(/amount received/i)
    await userEvent.clear(received)
    await userEvent.type(received, '2000')
    await userEvent.click(screen.getByRole('button', { name: /add booking/i }))

    expect(screen.getByRole('alert').textContent).toMatch(/cannot be more than the total/i)
  })
})

describe('reports', () => {
  it('shows revenue once there are bookings', async () => {
    render(wrap(<ReportsPage />))

    expect(screen.getByText(/no bookings to report on yet/i)).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /load sample data/i }))

    expect(screen.getAllByText('Revenue').length).toBeGreaterThan(0)
    expect(screen.getByText('Enquiry to booking')).toBeTruthy()
  })
})

describe('coupons', () => {
  it('rejects a percentage over 100', async () => {
    render(wrap(<CouponsPage />))

    await userEvent.click(screen.getAllByRole('button', { name: /new coupon/i })[0]!)
    await userEvent.type(screen.getByLabelText(/^code \*/i), 'BIG')
    const amount = screen.getByLabelText(/^amount \*/i)
    await userEvent.clear(amount)
    await userEvent.type(amount, '150')
    await userEvent.click(screen.getByRole('button', { name: /add coupon/i }))

    expect(screen.getByRole('alert').textContent).toMatch(/cannot be more than 100/i)
  })
})

describe('availability', () => {
  it('marks a date as full and lists it for the month', async () => {
    render(wrap(<AvailabilityPage />))

    const today = new Date().getDate()
    const day = screen.getAllByRole('button').find((button) => button.getAttribute('aria-label')?.includes('no setting') && button.textContent?.startsWith(String(today)))
    expect(day).toBeTruthy()
    await userEvent.click(day!)

    const dialog = screen.getByRole('dialog', { hidden: true })
    await userEvent.selectOptions(within(dialog).getByLabelText('Status'), 'full')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))

    expect(screen.getAllByText('Full').length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('vt-admin:availability') ?? '[]')).toHaveLength(1)
  })
})

describe('export', () => {
  it('disables a download until the list has rows', () => {
    render(wrap(<ExportPage />))

    const row = screen.getByText('Bookings').closest('tr')!
    expect((within(row).getByRole('button', { name: /download csv/i }) as HTMLButtonElement).disabled).toBe(true)
  })
})
