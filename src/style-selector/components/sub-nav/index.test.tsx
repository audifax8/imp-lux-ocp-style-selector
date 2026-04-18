import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubNav } from './index'
import { StepType } from '@/declarations/enums'
import type { StepWithTranslation } from '@/declarations/interfaces'

vi.mock('@/shared/components/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))
vi.mock('@/style-selector/context/i18n-context', () => ({
  useI18n: vi.fn(() => undefined),
}))

const steps: StepWithTranslation[] = [
  { id: 0, name: 'Type', type: StepType.TYPE },
  { id: 1, name: 'Model', type: StepType.MODEL },
]

describe('SubNav', () => {
  it('renders a <nav> with default aria-label', () => {
    render(<SubNav />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Step navigation')
  })

  it('shows the selected step name', () => {
    render(<SubNav steps={steps} selectedStep={steps[1]} />)
    expect(screen.getByText('Model')).toBeInTheDocument()
  })

  it('shows the step counter as N/M', () => {
    render(<SubNav steps={steps} selectedStep={steps[1]} />)
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('step counter defaults to 1/0 when no steps or selectedStep', () => {
    render(<SubNav />)
    expect(screen.getByText('1/0')).toBeInTheDocument()
  })

  describe('step counter aria-label', () => {
    it('uses fallback "Step N of M" when no i18n', () => {
      render(<SubNav steps={steps} selectedStep={steps[1]} />)
      const counter = screen.getByText('2/2')
      expect(counter).toHaveAttribute('aria-label', 'Step 2 of 2')
    })
  })

  describe('back button visibility', () => {
    it('shows the back button when selectedStep.id > 0 and onClick is provided', () => {
      render(<SubNav steps={steps} selectedStep={steps[1]} onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('does not show the back button when selectedStep.id === 0', () => {
      render(<SubNav steps={steps} selectedStep={steps[0]} onClick={vi.fn()} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not show the back button when onClick is not provided', () => {
      render(<SubNav steps={steps} selectedStep={steps[1]} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('back button behaviour', () => {
    it('fires onClick with the first step when clicked', () => {
      const handler = vi.fn()
      render(<SubNav steps={steps} selectedStep={steps[1]} onClick={handler} />)
      fireEvent.click(screen.getByRole('button'))
      expect(handler).toHaveBeenCalledWith(steps[0])
    })

    it('back button uses fallback aria-label "Back to {first-step-name}"', () => {
      render(<SubNav steps={steps} selectedStep={steps[1]} onClick={vi.fn()} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Back to Type')
    })

    it('back button icon is aria-hidden', () => {
      render(<SubNav steps={steps} selectedStep={steps[1]} onClick={vi.fn()} />)
      const icon = screen.getByRole('button').querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('skeleton mode', () => {
    it('renders skeleton placeholders', () => {
      render(<SubNav skeleton />)
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    })

    it('does not render the back button in skeleton mode', () => {
      render(<SubNav skeleton steps={steps} selectedStep={steps[1]} onClick={vi.fn()} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('does not render a visible title in skeleton mode', () => {
      render(<SubNav skeleton steps={steps} selectedStep={steps[1]} />)
      expect(screen.queryByText('Model')).not.toBeInTheDocument()
    })
  })
})
