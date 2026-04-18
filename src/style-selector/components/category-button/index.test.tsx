import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './index'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('Button (category-button)', () => {
  it('renders with role="radio"', () => {
    render(<Button label="Classic" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('sets aria-label from the label prop', () => {
    render(<Button label="Classic" />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-label', 'Classic')
  })

  it('sets aria-checked="false" by default', () => {
    render(<Button label="Classic" />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false')
  })

  it('sets aria-checked="true" when selected=true', () => {
    render(<Button label="Classic" selected />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true')
  })

  it('applies yr-button__selected class when selected', () => {
    render(<Button label="Classic" selected />)
    expect(screen.getByRole('radio')).toHaveClass('yr-button__selected')
  })

  it('does not apply yr-button__selected when not selected', () => {
    render(<Button label="Classic" selected={false} />)
    expect(screen.getByRole('radio')).not.toHaveClass('yr-button__selected')
  })

  it('renders inner label span as aria-hidden', () => {
    render(<Button label="Classic" />)
    const span = screen.getByRole('radio').querySelector('span')
    expect(span).toHaveAttribute('aria-hidden', 'true')
  })

  it('sets tabIndex when provided', () => {
    render(<Button label="Classic" tabIndex={0} />)
    expect(screen.getByRole('radio')).toHaveAttribute('tabindex', '0')
    render(<Button label="Other" tabIndex={-1} />)
    // get second radio
    expect(screen.getAllByRole('radio')[1]).toHaveAttribute('tabindex', '-1')
  })

  it('fires onClick when clicked', () => {
    const handler = vi.fn()
    render(<Button label="Classic" onClick={handler} />)
    fireEvent.click(screen.getByRole('radio'))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('applies additional className when provided', () => {
    render(<Button label="Classic" className="my-class" />)
    expect(screen.getByRole('radio')).toHaveClass('my-class')
  })

  describe('skeleton mode', () => {
    it('renders a Skeleton instead of the label text', () => {
      render(<Button label="Classic" skeleton />)
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('does not render the visible label text in skeleton mode', () => {
      render(<Button label="Classic" skeleton />)
      expect(screen.queryByText('Classic')).not.toBeInTheDocument()
    })
  })
})
