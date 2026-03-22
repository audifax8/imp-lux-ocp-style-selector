import { render, screen, waitFor } from '@testing-library/react'
import { LabelsProvider } from './LabelsProvider'
import { useLabels } from './useLabels'
import { DEFAULT_LABELS } from './defaults'
import type { Labels } from './types'

vi.mock('./service', () => ({
  fetchLabels: vi.fn(),
}))

import { fetchLabels } from './service'
const mockFetchLabels = vi.mocked(fetchLabels)

const LabelConsumer = () => {
  const labels = useLabels()
  return <span data-testid="title">{labels.step1.title}</span>
}

describe('LabelsProvider (integration)', () => {
  beforeEach(() => {
    mockFetchLabels.mockReset()
  })

  it('renders children with DEFAULT_LABELS immediately', () => {
    mockFetchLabels.mockReturnValue(new Promise(() => {})) // never resolves
    render(
      <LabelsProvider>
        <LabelConsumer />
      </LabelsProvider>,
    )
    expect(screen.getByTestId('title').textContent).toBe(DEFAULT_LABELS.step1.title)
  })

  it('updates labels when API resolves', async () => {
    const customLabels: Labels = {
      ...DEFAULT_LABELS,
      step1: { ...DEFAULT_LABELS.step1, title: 'Custom title from API' },
    }
    mockFetchLabels.mockResolvedValue(customLabels)

    render(
      <LabelsProvider>
        <LabelConsumer />
      </LabelsProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('title').textContent).toBe('Custom title from API')
    })
  })

  it('keeps DEFAULT_LABELS when API rejects', async () => {
    mockFetchLabels.mockRejectedValue(new Error('Network error'))

    render(
      <LabelsProvider>
        <LabelConsumer />
      </LabelsProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('title').textContent).toBe(DEFAULT_LABELS.step1.title)
    })
  })
})
