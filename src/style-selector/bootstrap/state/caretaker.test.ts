import { describe, it, expect } from 'vitest'
import { Caretaker } from './caretaker'
import { Memento } from './memento'
import { LoadingState } from './loading-state'

const makeMemento = () => new Memento(new LoadingState())

describe('Caretaker', () => {
  it('returns undefined when no mementos have been added', () => {
    const caretaker = new Caretaker()
    expect(caretaker.getMemento(0)).toBeUndefined()
  })

  it('stores and retrieves a single memento', () => {
    const caretaker = new Caretaker()
    const m = makeMemento()
    caretaker.addMemento(m)
    expect(caretaker.getMemento(0)).toBe(m)
  })

  it('stores multiple mementos in insertion order', () => {
    const caretaker = new Caretaker()
    const [m1, m2, m3] = [makeMemento(), makeMemento(), makeMemento()]
    caretaker.addMemento(m1)
    caretaker.addMemento(m2)
    caretaker.addMemento(m3)
    expect(caretaker.getMemento(0)).toBe(m1)
    expect(caretaker.getMemento(1)).toBe(m2)
    expect(caretaker.getMemento(2)).toBe(m3)
  })

  it('supports negative index — getMemento(-1) returns the last entry', () => {
    const caretaker = new Caretaker()
    const m1 = makeMemento()
    const m2 = makeMemento()
    caretaker.addMemento(m1)
    caretaker.addMemento(m2)
    expect(caretaker.getMemento(-1)).toBe(m2)
  })

  it('returns undefined for an out-of-bounds positive index', () => {
    const caretaker = new Caretaker()
    caretaker.addMemento(makeMemento())
    expect(caretaker.getMemento(99)).toBeUndefined()
  })
})
