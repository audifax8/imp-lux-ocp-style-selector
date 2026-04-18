import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelCard } from './index'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('ModelCard', () => {
  describe('when onClick is provided', () => {
    it('renders as a <button>', () => {
      render(<ModelCard title="Aviator" onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('sets aria-label from the title', () => {
      render(<ModelCard title="Aviator" onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Aviator')
    })

    it('fires onClick when clicked', () => {
      const handler = vi.fn()
      render(<ModelCard title="Aviator" onClick={handler} />)
      fireEvent.click(screen.getByRole('button'))
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('when onClick is not provided', () => {
    it('renders as a <div>, not a button', () => {
      render(<ModelCard title="Aviator" />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('image', () => {
    it('renders the image when imageSrc is provided', () => {
      const { container } = render(<ModelCard title="Aviator" imageSrc="/aviator.jpg" imageAlt="Aviator sunglasses" onClick={vi.fn()} />)
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('src', '/aviator.jpg')
      expect(img).toHaveAttribute('alt', 'Aviator sunglasses')
      expect(img).toHaveAttribute('loading', 'eager')
    })

    it('renders a Skeleton when imageSrc is missing', () => {
      render(<ModelCard title="Aviator" onClick={vi.fn()} />)
      expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('image wrapper is aria-hidden', () => {
      const { container } = render(<ModelCard title="Aviator" imageSrc="/img.jpg" onClick={vi.fn()} />)
      const img = container.querySelector('img')
      expect(img?.closest('[aria-hidden="true"]')).toBeInTheDocument()
    })
  })

  describe('content area', () => {
    it('shows the title text', () => {
      render(<ModelCard title="Wayfarer" onClick={vi.fn()} />)
      expect(screen.getByText('Wayfarer')).toBeInTheDocument()
    })

    it('content wrapper is aria-hidden (VoiceOver reads aria-label only)', () => {
      const { container } = render(<ModelCard title="Wayfarer" onClick={vi.fn()} />)
      const content = container.querySelector('.model-card__content')
      expect(content).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
