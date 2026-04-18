import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { I18nContext, useI18n } from './i18n-context'
import { i18n } from '@/models/i18n'

const makeI18n = (keys: Record<string, string> = {}) =>
  new i18n({ globals: { i18n: keys } })

describe('useI18n', () => {
  it('returns undefined when no I18nContext.Provider is present', () => {
    const { result } = renderHook(() => useI18n())
    expect(result.current).toBeUndefined()
  })

  it('returns the i18n instance provided by I18nContext.Provider', () => {
    const instance = makeI18n()
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nContext.Provider, { value: instance }, children)

    const { result } = renderHook(() => useI18n(), { wrapper })
    expect(result.current).toBe(instance)
  })

  it('getLabel returns fallback when key is missing', () => {
    const instance = makeI18n()
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nContext.Provider, { value: instance }, children)

    const { result } = renderHook(() => useI18n(), { wrapper })
    expect(result.current?.getLabel('missing_key', 'My Fallback')).toBe('My Fallback')
  })

  it('getLang returns fallback with variable interpolation when key is missing', () => {
    const instance = makeI18n()
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nContext.Provider, { value: instance }, children)

    const { result } = renderHook(() => useI18n(), { wrapper })
    const text = result.current?.getLang('missing_key', 'Back to {step}', { step: 'Type' })
    expect(text).toBe('Back to Type')
  })

  it('getLang interpolates multiple variables', () => {
    const instance = makeI18n()
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nContext.Provider, { value: instance }, children)

    const { result } = renderHook(() => useI18n(), { wrapper })
    const text = result.current?.getLang('step_of', 'Step {n} of {m}', { n: '2', m: '3' })
    expect(text).toBe('Step 2 of 3')
  })

  it('updates when the provider value changes', () => {
    const instance1 = makeI18n()
    const instance2 = makeI18n()
    let currentValue = instance1

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nContext.Provider, { value: currentValue }, children)

    const { result, rerender } = renderHook(() => useI18n(), { wrapper })
    expect(result.current).toBe(instance1)

    currentValue = instance2
    rerender()
    expect(result.current).toBe(instance2)
  })
})
