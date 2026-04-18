import { describe, it, expect } from 'vitest'
import { LoadingState } from './loading-state'
import { CheckPointType } from '@/declarations/enums'
import type { MergedParams } from '@/declarations/types'

const fakeParams = (lang = 'en') => ({ lang }) as unknown as MergedParams

describe('LoadingState', () => {
  it('initializes with undefined values', () => {
    const state = new LoadingState()
    expect(state.getParams()).toBeUndefined()
    expect(state.getLogger()).toBeUndefined()
    expect(state.getPerformance()).toBeUndefined()
    expect(state.getCheckPoint()).toBeUndefined()
    expect(state.getConfigureJsons()).toBeUndefined()
  })

  it('sets and gets params', () => {
    const state = new LoadingState()
    const params = fakeParams()
    state.setParams(params)
    expect(state.getParams()).toBe(params)
  })

  it('sets and gets checkpoint', () => {
    const state = new LoadingState()
    state.setCheckPoint(CheckPointType.JSON)
    expect(state.getCheckPoint()).toBe(CheckPointType.JSON)
  })

  it('sets and gets logger', () => {
    const state = new LoadingState()
    const logger = { error: () => {}, object: () => {} } as never
    state.setLogger(logger)
    expect(state.getLogger()).toBe(logger)
  })

  it('sets and gets performance', () => {
    const state = new LoadingState()
    const perf = { processStart: () => {} } as never
    state.setPerformance(perf)
    expect(state.getPerformance()).toBe(perf)
  })

  it('sets and gets configureJsons', () => {
    const state = new LoadingState()
    const jsons = { productGraph: {} } as never
    state.setConfigureJsons(jsons)
    expect(state.getConfigureJsons()).toBe(jsons)
  })

  describe('clone()', () => {
    it('returns a new instance (not the same reference)', () => {
      const state = new LoadingState()
      const cloned = state.clone({})
      expect(cloned).not.toBe(state)
    })

    it('preserves all values when no updates are passed', () => {
      const state = new LoadingState()
      const params = fakeParams()
      state.setParams(params)
      state.setCheckPoint(CheckPointType.CORE)

      const cloned = state.clone({})
      expect(cloned.getParams()).toBe(params)
      expect(cloned.getCheckPoint()).toBe(CheckPointType.CORE)
    })

    it('overrides only the specified field', () => {
      const state = new LoadingState()
      const params1 = fakeParams('en')
      const params2 = fakeParams('fr')
      state.setParams(params1)
      state.setCheckPoint(CheckPointType.JSON)

      const cloned = state.clone({ params: params2 })
      expect(cloned.getParams()).toBe(params2)
      expect(cloned.getCheckPoint()).toBe(CheckPointType.JSON) // unchanged
    })

    it('does not mutate the original instance', () => {
      const state = new LoadingState()
      const params1 = fakeParams('en')
      state.setParams(params1)

      state.clone({ params: fakeParams('fr') })
      expect(state.getParams()).toBe(params1)
    })
  })
})
