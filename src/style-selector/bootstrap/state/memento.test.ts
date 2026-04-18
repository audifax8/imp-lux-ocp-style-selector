import { describe, it, expect } from 'vitest'
import { Memento } from './memento'
import { LoadingState } from './loading-state'

describe('Memento', () => {
  it('stores and returns the provided LoadingState', () => {
    const state = new LoadingState()
    const memento = new Memento(state)
    expect(memento.getState()).toBe(state)
  })

  it('each instance holds its own reference', () => {
    const s1 = new LoadingState()
    const s2 = new LoadingState()
    const m1 = new Memento(s1)
    const m2 = new Memento(s2)
    expect(m1.getState()).toBe(s1)
    expect(m2.getState()).toBe(s2)
    expect(m1.getState()).not.toBe(m2.getState())
  })
})
