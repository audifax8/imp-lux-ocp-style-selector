import type { Brand } from '../brands/types'

// ── Resolución de configuración en runtime ───────────────────────────────────
// Prioridad para cada valor:
//   1. window.__IMP_LUX_*__  → inyectado por la página cliente
//   2. ?apiUrl= / ?lang=     → parámetro en la URL
//   3. fallback hardcoded    → valor por defecto
//
// Ejemplos de uso:
//   ?apiUrl=https://staging.ray-ban.com&lang=es
//   window.__IMP_LUX_API_URL__  = 'https://staging.ray-ban.com'
//   window.__IMP_LUX_API_LANG__ = 'es'

type WidgetWindow = Window & {
  __IMP_LUX_API_URL__?: unknown
  __IMP_LUX_API_LANG__?: unknown
}

const params = new URLSearchParams(window.location.search)
const win = window as WidgetWindow

export const API_BASE_URL: string = (() => {
  if (typeof win.__IMP_LUX_API_URL__ === 'string' && win.__IMP_LUX_API_URL__)
    return win.__IMP_LUX_API_URL__
  const p = params.get('apiUrl')
  if (p) return p
  return 'https://www.ray-ban.com'
})()

export const API_LANGUAGE: string = (() => {
  if (typeof win.__IMP_LUX_API_LANG__ === 'string' && win.__IMP_LUX_API_LANG__)
    return win.__IMP_LUX_API_LANG__
  const p = params.get('lang')
  if (p) return p
  return 'en'
})()

// Store ID por brand.
// Actualiza los valores cuando se conozcan los IDs reales de cada brand.
export const BRAND_STORE_IDS: Record<Brand, string> = {
  rbn:  '10151',
  oak:  '10151', // TODO
  sgh:  '10151', // TODO
  bliz: '10151', // TODO
  cdm:  '10151', // TODO
}
