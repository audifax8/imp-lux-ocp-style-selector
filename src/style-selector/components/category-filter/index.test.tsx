import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilterComponent } from './index'
import type { FlatModel } from '@/declarations/interfaces'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}))

const makeCategory = (name: string): FlatModel => ({
  modelKey: name,
  type: 'sunglasses',
  category: name,
  models: [],
})

const categories = [
  makeCategory('All'),
  makeCategory('Classic'),
  makeCategory('Kids'),
]

describe('CategoryFilterComponent', () => {
  it('renders a radiogroup', () => {
    render(<CategoryFilterComponent subCategories={categories} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('uses default aria-label when no label or i18n', () => {
    render(<CategoryFilterComponent subCategories={categories} />)
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Filter by category')
  })

  it('uses the label prop when provided', () => {
    render(<CategoryFilterComponent subCategories={categories} label="My label" />)
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'My label')
  })

  it('renders one radio per category', () => {
    render(<CategoryFilterComponent subCategories={categories} />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('renders nothing when subCategories is undefined', () => {
    render(<CategoryFilterComponent />)
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  it('renders nothing when subCategories is empty', () => {
    render(<CategoryFilterComponent subCategories={[]} />)
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  describe('tabIndex management', () => {
    it('first radio has tabIndex=0 when no selection', () => {
      render(<CategoryFilterComponent subCategories={categories} />)
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toHaveAttribute('tabindex', '0')
      expect(radios[1]).toHaveAttribute('tabindex', '-1')
      expect(radios[2]).toHaveAttribute('tabindex', '-1')
    })

    it('selected radio has tabIndex=0, others have tabIndex=-1', () => {
      render(<CategoryFilterComponent subCategories={categories} selectedCategory={categories[1]} />)
      const radios = screen.getAllByRole('radio')
      expect(radios[0]).toHaveAttribute('tabindex', '-1')
      expect(radios[1]).toHaveAttribute('tabindex', '0')
      expect(radios[2]).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('click interaction', () => {
    it('calls onClick with the clicked category', () => {
      const handler = vi.fn()
      render(<CategoryFilterComponent subCategories={categories} onClick={handler} />)
      fireEvent.click(screen.getAllByRole('radio')[1])
      expect(handler).toHaveBeenCalledWith(categories[1])
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus to the next radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
      expect(document.activeElement).toBe(radios[1])
    })

    it('ArrowDown moves focus to the next radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' })
      expect(document.activeElement).toBe(radios[1])
    })

    it('ArrowRight wraps around from last to first radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[2].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
      expect(document.activeElement).toBe(radios[0])
    })

    it('ArrowLeft moves focus to the previous radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[2].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(radios[1])
    })

    it('ArrowLeft wraps from first to last radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(radios[2])
    })

    it('Home key focuses the first radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[2].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Home' })
      expect(document.activeElement).toBe(radios[0])
    })

    it('End key focuses the last radio', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'End' })
      expect(document.activeElement).toBe(radios[2])
    })

    it('keyboard navigation also calls onClick with the newly focused category', () => {
      const handler = vi.fn()
      render(<CategoryFilterComponent subCategories={categories} onClick={handler} />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowRight' })
      expect(handler).toHaveBeenCalledWith(categories[1])
    })

    it('unrecognised keys do not move focus', () => {
      render(<CategoryFilterComponent subCategories={categories} onClick={vi.fn()} />)
      const radios = screen.getAllByRole('radio')
      radios[0].focus()
      fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'Enter' })
      expect(document.activeElement).toBe(radios[0])
    })
  })
})
