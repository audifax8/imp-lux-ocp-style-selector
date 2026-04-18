import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { DataContext, useData } from './context'
import type { StyleSelectorInitData } from '@/declarations/interfaces'

describe('useData', () => {
  it('returns undefined when no DataContext.Provider is present', () => {
    const { result } = renderHook(() => useData())
    expect(result.current).toBeUndefined()
  })

  it('returns the value provided by DataContext.Provider', () => {
    const mockData = { stepsTranslated: [] } as unknown as StyleSelectorInitData
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(DataContext.Provider, { value: mockData }, children)

    const { result } = renderHook(() => useData(), { wrapper })
    expect(result.current).toBe(mockData)
  })

  it('updates when the provider value changes', () => {
    const data1 = { stepsTranslated: [] } as unknown as StyleSelectorInitData
    const data2 = { stepsTranslated: [{ id: 0, name: 'type' }] } as unknown as StyleSelectorInitData
    let current = data1

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(DataContext.Provider, { value: current }, children)

    const { result, rerender } = renderHook(() => useData(), { wrapper })
    expect(result.current).toBe(data1)

    current = data2
    rerender()
    expect(result.current).toBe(data2)
  })
})
