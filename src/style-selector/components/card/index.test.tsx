import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card } from './index'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('Card', () => {
  describe('when onClick is provided', () => {
    it('renders as a <button>', () => {
      render(<Card title="Sunglasses" onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('sets aria-label from title', () => {
      render(<Card title="Sunglasses" onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Sunglasses')
    })

    it('fires onClick when clicked', () => {
      const handler = vi.fn()
      render(<Card title="Sunglasses" onClick={handler} />)
      fireEvent.click(screen.getByRole('button'))
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('when onClick is not provided', () => {
    it('renders as a <div>, not a button', () => {
      render(<Card title="Sunglasses" />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('content rendering', () => {
    it('shows the title', () => {
      render(<Card title="Sunglasses" onClick={vi.fn()} />)
      expect(screen.getByText(/Sunglasses/)).toBeInTheDocument()
    })

    it('shows title with length in parentheses', () => {
      render(<Card title="Sunglasses" length={42} onClick={vi.fn()} />)
      expect(screen.getByText('Sunglasses (42)')).toBeInTheDocument()
    })

    it('does not append length when length is not provided', () => {
      render(<Card title="Sunglasses" onClick={vi.fn()} />)
      expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
    })

    it('renders the image with correct src and alt', () => {
      const { container } = render(<Card title="X" imageSrc="/img.jpg" imageAlt="Test img" onClick={vi.fn()} />)
      // img is inside aria-hidden, use DOM query
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('src', '/img.jpg')
      expect(img).toHaveAttribute('alt', 'Test img')
    })

    it('marks the card-content wrapper as aria-hidden', () => {
      const { container } = render(<Card title="Sunglasses" onClick={vi.fn()} />)
      const hidden = container.querySelectorAll('[aria-hidden="true"]')
      expect(hidden.length).toBeGreaterThanOrEqual(2) // card-content + card-image-wrapper
    })
  })

  describe('skeleton mode', () => {
    it('renders two Skeleton placeholders', () => {
      render(<Card skeleton onClick={vi.fn()} />)
      expect(screen.getAllByTestId('skeleton')).toHaveLength(2)
    })

    it('does not render a real image in skeleton mode', () => {
      render(<Card skeleton onClick={vi.fn()} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('does not render a text title in skeleton mode', () => {
      render(<Card title="Sunglasses" skeleton onClick={vi.fn()} />)
      expect(screen.queryByText('Sunglasses')).not.toBeInTheDocument()
    })
  })
})
