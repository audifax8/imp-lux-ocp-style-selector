import { describe, it, expect } from 'vitest'
import { Originator } from './originator'
import { LoadingState } from './loading-state'
import { Memento } from './memento'

describe('Originator', () => {
  it('sets and gets state', () => {
    const originator = new Originator()
    const state = new LoadingState()
    originator.setState(state)
    expect(originator.getState()).toBe(state)
  })

  it('saveMemento returns a Memento instance', () => {
    const originator = new Originator()
    originator.setState(new LoadingState())
    expect(originator.saveMemento()).toBeInstanceOf(Memento)
  })

  it('saveMemento snapshot holds the current state', () => {
    const originator = new Originator()
    const state = new LoadingState()
    originator.setState(state)
    const memento = originator.saveMemento()
    expect(memento.getState()).toBe(state)
  })

  it('restore brings back state from a memento', () => {
    const originator = new Originator()
    const state1 = new LoadingState()
    const state2 = new LoadingState()

    originator.setState(state1)
    const snapshot = originator.saveMemento()

    originator.setState(state2)
    expect(originator.getState()).toBe(state2)

    originator.restore(snapshot)
    expect(originator.getState()).toBe(state1)
  })

  it('saving a memento after state change captures the new state', () => {
    const originator = new Originator()
    const state1 = new LoadingState()
    const state2 = new LoadingState()

    originator.setState(state1)
    originator.setState(state2)
    const memento = originator.saveMemento()
    expect(memento.getState()).toBe(state2)
  })
})
