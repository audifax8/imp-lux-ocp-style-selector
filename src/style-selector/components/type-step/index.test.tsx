import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TypeStep } from './index'
import { I18nContext } from '@/style-selector/context/i18n-context'
import { i18n } from '@/models/i18n'
import type { ModelsTranslated } from '@/declarations/interfaces'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))
vi.mock('@/white-label/detect', () => ({ activeBrand: 'rbn' }))
vi.mock('@/shared/assets', () => ({
  getSVGURLByType: vi.fn(() => 'mock://svg'),
}))

const makeI18n = () => new i18n({ globals: { i18n: {} } })

const types: ModelsTranslated[] = [
  { name: 'sunglasses', translation: 'Sunglasses', length: 10 },
  { name: 'eyeglasses', translation: 'Eyeglasses', length: 5 },
]

const WithI18n = ({ children }: { children: React.ReactNode }) =>
  React.createElement(I18nContext.Provider, { value: makeI18n() }, children)

describe('TypeStep', () => {
  describe('default aria-labels (no i18n provider)', () => {
    it('section has aria-label "Select glasses type"', () => {
      render(<TypeStep modelsTypes={types} onClick={vi.fn()} />)
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Select glasses type')
    })

    it('list has aria-label "Glasses types"', () => {
      render(<TypeStep modelsTypes={types} onClick={vi.fn()} />)
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Glasses types')
    })
  })

  describe('when modelsTypes is provided', () => {
    it('renders one Card button per type', () => {
      render(<TypeStep modelsTypes={types} onClick={vi.fn()} />, { wrapper: WithI18n })
      expect(screen.getAllByRole('button')).toHaveLength(2)
    })

    it('shows the translated type name as the card label', () => {
      render(<TypeStep modelsTypes={types} onClick={vi.fn()} />, { wrapper: WithI18n })
      expect(screen.getByRole('button', { name: /sunglasses/i })).toBeInTheDocument()
    })

    it('shows the length in parentheses inside the card', () => {
      render(<TypeStep modelsTypes={types} onClick={vi.fn()} />, { wrapper: WithI18n })
      expect(screen.getByText('Sunglasses (10)')).toBeInTheDocument()
    })

    it('calls onClick with the type name when a card is clicked', () => {
      const handler = vi.fn()
      render(<TypeStep modelsTypes={types} onClick={handler} />, { wrapper: WithI18n })
      fireEvent.click(screen.getAllByRole('button')[0])
      expect(handler).toHaveBeenCalledWith('sunglasses')
    })

    it('calls onClick with the correct name for the second type', () => {
      const handler = vi.fn()
      render(<TypeStep modelsTypes={types} onClick={handler} />, { wrapper: WithI18n })
      fireEvent.click(screen.getAllByRole('button')[1])
      expect(handler).toHaveBeenCalledWith('eyeglasses')
    })
  })

  describe('when modelsTypes is undefined (loading skeleton)', () => {
    it('renders 3 list items', () => {
      const { container } = render(<TypeStep modelsTypes={undefined} onClick={vi.fn()} />)
      expect(container.querySelectorAll('li')).toHaveLength(3)
    })

    it('all 3 skeleton items are aria-hidden', () => {
      const { container } = render(<TypeStep modelsTypes={undefined} onClick={vi.fn()} />)
      const hidden = Array.from(container.querySelectorAll('li')).filter(
        li => li.getAttribute('aria-hidden') === 'true',
      )
      expect(hidden).toHaveLength(3)
    })

    it('does not render any real buttons in skeleton state', () => {
      render(<TypeStep modelsTypes={undefined} onClick={vi.fn()} />)
      // Card in skeleton mode renders as a div, not a button
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })
  })
})
