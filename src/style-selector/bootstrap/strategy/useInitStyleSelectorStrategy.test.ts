import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInitStyleSelectorStrategy } from './useInitStyleSelectorStrategy'
import type { IStyleSelectorInitStrategy } from '@/declarations/interfaces'
import type { StyleSelectorInitData } from '@/declarations/interfaces'

type Strategy = IStyleSelectorInitStrategy<StyleSelectorInitData, StyleSelectorInitData>

const mockData = () => ({ stepsTranslated: [] }) as unknown as StyleSelectorInitData

const flushPromises = () => act(async () => {
  await new Promise(r => setTimeout(r, 0))
})

function makeStrategy(overrides: Partial<{
  phase1: StyleSelectorInitData
  phase2: StyleSelectorInitData | null
  phase1Error: Error
  phase2Error: Error
}> = {}): Strategy {
  return {
    loadAppData: overrides.phase1Error
      ? vi.fn().mockRejectedValue(overrides.phase1Error)
      : vi.fn().mockResolvedValue(overrides.phase1 ?? mockData()),
    preloadConfiguratorData: overrides.phase2Error
      ? vi.fn().mockRejectedValue(overrides.phase2Error)
      : vi.fn().mockResolvedValue(overrides.phase2 ?? null),
  }
}

describe('useInitStyleSelectorStrategy', () => {
  describe('initial state', () => {
    it('starts with styleSelectorInitData as undefined', () => {
      const { result } = renderHook(() => useInitStyleSelectorStrategy(makeStrategy()))
      expect(result.current.styleSelectorInitData).toBeUndefined()
    })

    it('starts with configuratorData as undefined', () => {
      const { result } = renderHook(() => useInitStyleSelectorStrategy(makeStrategy()))
      expect(result.current.configuratorData).toBeUndefined()
    })

    it('starts with null errors', () => {
      const { result } = renderHook(() => useInitStyleSelectorStrategy(makeStrategy()))
      expect(result.current.phase1Error).toBeNull()
      expect(result.current.phase2Error).toBeNull()
    })
  })

  describe('phase 1 success', () => {
    it('sets styleSelectorInitData after phase 1 resolves', async () => {
      const data = mockData()
      const strategy = makeStrategy({ phase1: data })
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.styleSelectorInitData).toBe(data)
    })

    it('calls loadAppData once on mount', async () => {
      const strategy = makeStrategy()
      renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(strategy.loadAppData).toHaveBeenCalledOnce()
    })

    it('calls preloadConfiguratorData with the phase 1 result', async () => {
      const data = mockData()
      const strategy = makeStrategy({ phase1: data })
      renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(strategy.preloadConfiguratorData).toHaveBeenCalledWith(data)
    })
  })

  describe('phase 2 success', () => {
    it('sets configuratorData when phase 2 returns truthy data', async () => {
      const phase2 = mockData()
      const strategy = makeStrategy({ phase2 })
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.configuratorData).toBe(phase2)
    })

    it('does NOT set configuratorData when phase 2 returns null', async () => {
      const strategy = makeStrategy({ phase2: null })
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.configuratorData).toBeUndefined()
    })
  })

  describe('phase 1 error', () => {
    it('sets phase1Error when loadAppData rejects', async () => {
      const error = new Error('API down')
      const strategy = makeStrategy({ phase1Error: error })
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.phase1Error).toEqual(error)
    })

    it('wraps non-Error rejections in an Error instance', async () => {
      const strategy: Strategy = {
        loadAppData: vi.fn().mockRejectedValue('string error'),
        preloadConfiguratorData: vi.fn(),
      }
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.phase1Error).toBeInstanceOf(Error)
      expect(result.current.phase1Error?.message).toContain('string error')
    })

    it('does not call preloadConfiguratorData when phase 1 fails', async () => {
      const strategy = makeStrategy({ phase1Error: new Error('fail') })
      renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(strategy.preloadConfiguratorData).not.toHaveBeenCalled()
    })
  })

  describe('phase 2 error', () => {
    it('sets phase2Error when preloadConfiguratorData rejects', async () => {
      const error = new Error('Phase 2 failed')
      const strategy = makeStrategy({ phase2Error: error })
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.phase2Error).toEqual(error)
    })

    it('phase1 data is still set even when phase 2 fails', async () => {
      const data = mockData()
      const strategy = makeStrategy({ phase1: data, phase2Error: new Error('p2 fail') })
      const { result } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      await flushPromises()

      expect(result.current.styleSelectorInitData).toBe(data)
      expect(result.current.phase2Error).not.toBeNull()
    })
  })

  describe('cancelled flag (cleanup on unmount)', () => {
    it('does not update state after unmount', async () => {
      let resolvePhase1!: (v: StyleSelectorInitData) => void
      const strategy: Strategy = {
        loadAppData: vi.fn(
          () => new Promise<StyleSelectorInitData>(r => { resolvePhase1 = r }),
        ),
        preloadConfiguratorData: vi.fn().mockResolvedValue(null),
      }

      const { result, unmount } = renderHook(() => useInitStyleSelectorStrategy(strategy))

      unmount() // unmount before phase 1 resolves

      await act(async () => {
        resolvePhase1(mockData()) // resolve after unmount
        await new Promise(r => setTimeout(r, 0))
      })

      // state must still be the initial value — cancelled=true prevented setState
      expect(result.current.styleSelectorInitData).toBeUndefined()
    })
  })
})
