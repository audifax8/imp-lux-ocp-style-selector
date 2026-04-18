import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ModelStep } from './index'
import { I18nContext } from '@/style-selector/context/i18n-context'
import { i18n } from '@/models/i18n'
import { StepType } from '@/declarations/enums'
import type { StepWithTranslation, FlatModel, LuxApiModel } from '@/declarations/interfaces'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}))

const makeI18n = () => new i18n({ globals: { i18n: {} } })

const WithI18n = ({ children }: { children: React.ReactNode }) =>
  React.createElement(I18nContext.Provider, { value: makeI18n() }, children)

const modelStep: StepWithTranslation = { id: 1, name: 'Model', type: StepType.MODEL }
const inspirationStep: StepWithTranslation = { id: 2, name: 'Inspiration', type: StepType.INSPIRATIONS }

const categories: FlatModel[] = [
  { modelKey: 'sunglasses', type: 'sunglasses', category: 'All', models: [] },
  { modelKey: 'sunglasses', type: 'sunglasses', category: 'Classic', models: [] },
]

const models: LuxApiModel[] = [
  { modelCode: 'RB2140', vendorId: 'v1', pageUrl: '/rb2140', label: 'Wayfarer', thumbnailUrl: '/w.jpg' },
  { modelCode: 'RB3025', vendorId: 'v2', pageUrl: '/rb3025', label: 'Aviator', thumbnailUrl: '/a.jpg' },
]

const baseProps = {
  selectedStep: modelStep,
  subCategories: categories,
  selectedFlatModel: categories[0],
  filteredModels: models,
  selectedModel: models[0],
  onCategoryClick: vi.fn(),
  onModelClick: vi.fn(),
}

describe('ModelStep', () => {
  describe('MODEL step', () => {
    it('renders a section with aria-label "Select a model"', () => {
      render(<ModelStep {...baseProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Select a model')
    })

    it('renders the CategoryFilterComponent (radiogroup)', () => {
      render(<ModelStep {...baseProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('renders one ModelCard per filtered model', () => {
      render(<ModelStep {...baseProps} />, { wrapper: WithI18n })
      // 2 model cards + category radio buttons — filter by label
      expect(screen.getByRole('button', { name: 'Wayfarer' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Aviator' })).toBeInTheDocument()
    })

    it('calls onModelClick with the correct model when a card is clicked', () => {
      const onModelClick = vi.fn()
      render(<ModelStep {...baseProps} onModelClick={onModelClick} />, { wrapper: WithI18n })
      fireEvent.click(screen.getByRole('button', { name: 'Wayfarer' }))
      expect(onModelClick).toHaveBeenCalledWith(models[0])
    })

    it('the model list has aria-label "Models"', () => {
      render(<ModelStep {...baseProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Models')
    })

    it('does not render the inspiration link', () => {
      render(<ModelStep {...baseProps} />, { wrapper: WithI18n })
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('calls onCategoryClick when a category radio is clicked', () => {
      const onCategoryClick = vi.fn()
      render(<ModelStep {...baseProps} onCategoryClick={onCategoryClick} />, { wrapper: WithI18n })
      fireEvent.click(screen.getAllByRole('radio')[0])
      expect(onCategoryClick).toHaveBeenCalledWith(categories[0])
    })
  })

  describe('INSPIRATIONS step', () => {
    const inspirationProps = { ...baseProps, selectedStep: inspirationStep }

    it('renders a section with aria-label "Trending styles"', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Trending styles')
    })

    it('does not render the CategoryFilterComponent', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    })

    it('renders the "skip to customization" link', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('skip link points to the selectedModel pageUrl', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('link')).toHaveAttribute('href', '/rb2140')
    })

    it('skip link opens in a new tab', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('skip link has rel="noopener noreferrer"', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('the models list has aria-label "Trending styles"', () => {
      render(<ModelStep {...inspirationProps} />, { wrapper: WithI18n })
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Trending styles')
    })

    it('calls onModelClick when an inspiration card is clicked', () => {
      const onModelClick = vi.fn()
      render(<ModelStep {...inspirationProps} onModelClick={onModelClick} />, { wrapper: WithI18n })
      fireEvent.click(screen.getByRole('button', { name: 'Wayfarer' }))
      expect(onModelClick).toHaveBeenCalledWith(models[0])
    })
  })

  describe('forwardRef', () => {
    it('forwards the ref to the root <section> element', () => {
      const ref = React.createRef<HTMLElement>()
      render(<ModelStep {...baseProps} ref={ref} />, { wrapper: WithI18n })
      expect(ref.current).not.toBeNull()
      expect(ref.current?.tagName).toBe('SECTION')
    })

    it('displayName is set to "ModelStep"', () => {
      expect(ModelStep.displayName).toBe('ModelStep')
    })
  })

  describe('empty filtered models', () => {
    it('renders an empty list when filteredModels is empty', () => {
      render(<ModelStep {...baseProps} filteredModels={[]} />, { wrapper: WithI18n })
      expect(screen.getByRole('list')).toBeEmptyDOMElement()
    })
  })
})
