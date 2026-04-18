import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './index'
import { StepType } from '@/declarations/enums'
import type { StepWithTranslation } from '@/declarations/interfaces'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))
vi.mock('@/shared/components/dark-mode-switch', () => ({
  default: () => <button data-testid="dark-mode-switch">Dark</button>,
}))
vi.mock('@/shared/theme/darkMode', () => ({
  getCurrentTheme: vi.fn(() => 'light'),
  toggleTheme: vi.fn((t: string) => (t === 'light' ? 'dark' : 'light')),
}))
vi.mock('@/style-selector/context/i18n-context', () => ({
  useI18n: vi.fn(() => undefined),
}))

const steps: StepWithTranslation[] = [
  { id: 0, name: 'Type', type: StepType.TYPE },
  { id: 1, name: 'Model', type: StepType.MODEL },
  { id: 2, name: 'Inspiration', type: StepType.INSPIRATIONS },
]

describe('Header', () => {
  it('renders a <header> landmark', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the nav with default aria-label when no i18n', () => {
    render(<Header steps={steps} selectedStep={steps[0]} />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Steps')
  })

  it('renders a tablist inside the nav', () => {
    render(<Header steps={steps} selectedStep={steps[0]} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders one tab per step', () => {
    render(<Header steps={steps} selectedStep={steps[0]} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  describe('tab selection state', () => {
    it('selected tab has aria-selected="true"', () => {
      render(<Header steps={steps} selectedStep={steps[1]} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    })

    it('non-selected tabs have aria-selected="false"', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
    })

    it('selected tab has tabIndex=0', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('tabindex', '0')
    })

    it('non-selected tabs have tabIndex=-1', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')
      expect(tabs[2]).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('disabled state (future steps)', () => {
    it('steps after selectedStep have aria-disabled="true"', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[1]).toHaveAttribute('aria-disabled', 'true')
      expect(tabs[2]).toHaveAttribute('aria-disabled', 'true')
    })

    it('selectedStep and earlier steps do not have aria-disabled', () => {
      render(<Header steps={steps} selectedStep={steps[2]} />)
      const tabs = screen.getAllByRole('tab')
      expect(tabs[0]).not.toHaveAttribute('aria-disabled')
      expect(tabs[1]).not.toHaveAttribute('aria-disabled')
    })
  })

  describe('click interaction', () => {
    it('calls onClick for an enabled (past) step', () => {
      const handler = vi.fn()
      render(<Header steps={steps} selectedStep={steps[2]} onClick={handler} />)
      fireEvent.click(screen.getAllByRole('tab')[0])
      expect(handler).toHaveBeenCalledWith(steps[0])
    })

    it('does not call onClick for a disabled (future) step', () => {
      const handler = vi.fn()
      render(<Header steps={steps} selectedStep={steps[0]} onClick={handler} />)
      fireEvent.click(screen.getAllByRole('tab')[2])
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('menu button', () => {
    it('renders a menu button with default aria-label', () => {
      render(<Header />)
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
    })
  })

  describe('skeleton mode', () => {
    it('renders Skeleton elements instead of real tabs', () => {
      render(<Header steps={steps} skeleton />)
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
      expect(screen.queryAllByRole('tab')).toHaveLength(0)
    })

    it('renders a Skeleton in place of the menu button', () => {
      render(<Header skeleton />)
      // menu icon becomes a skeleton
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    })
  })

  describe('keyboard navigation', () => {
    it('ArrowRight moves focus to the next tab', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[1])
    })

    it('ArrowRight wraps from last to first tab', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      tabs[2].focus()
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('ArrowLeft moves focus to the previous tab', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      tabs[2].focus()
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[1])
    })

    it('ArrowLeft wraps from first to last tab', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft' })
      expect(document.activeElement).toBe(tabs[2])
    })

    it('Home key focuses the first tab', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      tabs[2].focus()
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' })
      expect(document.activeElement).toBe(tabs[0])
    })

    it('End key focuses the last tab', () => {
      render(<Header steps={steps} selectedStep={steps[0]} />)
      const tabs = screen.getAllByRole('tab')
      tabs[0].focus()
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' })
      expect(document.activeElement).toBe(tabs[2])
    })
  })
})
