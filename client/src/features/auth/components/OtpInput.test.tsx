import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { OtpInput } from './OtpInput'

const Harness = ({ onComplete }: { onComplete?: (code: string) => void }) => {
  const [value, setValue] = useState('')
  return (
    <>
      <OtpInput value={value} onChange={setValue} onComplete={onComplete} autoFocus />
      <output data-testid="value">{value}</output>
    </>
  )
}

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[]
const value = () => screen.getByTestId('value').textContent

describe('OtpInput', () => {
  it('renders six labelled boxes', () => {
    render(<Harness />)

    expect(boxes()).toHaveLength(6)
    expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'One-time code' })).toBeInTheDocument()
  })

  it('advances focus as digits are typed and reports completion', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<Harness onComplete={onComplete} />)

    await user.keyboard('123')
    expect(value()).toBe('123')
    expect(boxes()[3]).toHaveFocus()

    await user.keyboard('456')
    expect(value()).toBe('123456')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('ignores letters and symbols', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.keyboard('a1-b2')

    expect(value()).toBe('12')
  })

  it('fills every box from a pasted code, ignoring non-digits', async () => {
    const onComplete = vi.fn()
    const user = userEvent.setup()
    render(<Harness onComplete={onComplete} />)

    await user.click(boxes()[0]!)
    await user.paste('48 20-17')

    expect(value()).toBe('482017')
    expect(boxes().map((box) => box.value).join('')).toBe('482017')
    expect(onComplete).toHaveBeenCalledWith('482017')
  })

  it('truncates a pasted code longer than six digits', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(boxes()[0]!)
    await user.paste('123456789')

    expect(value()).toBe('123456')
  })

  it('backspace clears the current digit, then steps back', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.keyboard('123')
    await user.keyboard('{Backspace}')
    // Box 4 was empty and focused, so backspace removed digit 3 and stepped back.
    expect(value()).toBe('12')
    expect(boxes()[2]).toHaveFocus()

    await user.keyboard('{Backspace}')
    expect(value()).toBe('1')
  })

  it('arrow keys move between boxes', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.keyboard('12')
    await user.keyboard('{ArrowLeft}')
    expect(boxes()[1]).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(boxes()[2]).toHaveFocus()
  })
})
