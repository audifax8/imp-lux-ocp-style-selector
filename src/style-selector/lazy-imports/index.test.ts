import { describe, it, expect } from 'vitest'
import { createDeferred } from './index'

describe('createDeferred', () => {
  it('returns an object with promise, resolve, and reject', () => {
    const d = createDeferred<string>()
    expect(d.promise).toBeInstanceOf(Promise)
    expect(typeof d.resolve).toBe('function')
    expect(typeof d.reject).toBe('function')
  })

  it('resolves the promise when resolve() is called', async () => {
    const d = createDeferred<number>()
    d.resolve(42)
    await expect(d.promise).resolves.toBe(42)
  })

  it('rejects the promise when reject() is called', async () => {
    const d = createDeferred<number>()
    const err = new Error('boom')
    d.reject(err)
    await expect(d.promise).rejects.toThrow('boom')
  })

  it('resolves with a PromiseLike value', async () => {
    const d = createDeferred<string>()
    d.resolve(Promise.resolve('async value'))
    await expect(d.promise).resolves.toBe('async value')
  })

  it('each createDeferred call produces an independent instance', async () => {
    const d1 = createDeferred<string>()
    const d2 = createDeferred<string>()
    d1.resolve('one')
    d2.resolve('two')
    expect(await d1.promise).toBe('one')
    expect(await d2.promise).toBe('two')
    expect(d1.promise).not.toBe(d2.promise)
  })
})
