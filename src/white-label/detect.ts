// Detecta el brand activo una sola vez al cargar el módulo (singleton).
// Prioridad: 1) window.__IMP_LUX_BRAND__  2) URL param ?brand=  3) 'rbn' por defecto
//
// Uso desde el host:
//   window.__IMP_LUX_BRAND__ = 'oak'  → antes de cargar el widget JS
//   https://example.com/?brand=sgh     → via URL param
import { BRANDS, type Brand } from '@/declarations/types'

const isBrand = (value: unknown): value is Brand =>
  typeof value === 'string' && (BRANDS as readonly string[]).includes(value)

export const activeBrand: Brand = (() => {
  // 1. Objeto compartido en window (máxima prioridad — lo establece la app host)
  const win = window as Window & { __IMP_LUX_BRAND__?: unknown }
  if (isBrand(win.__IMP_LUX_BRAND__)) return win.__IMP_LUX_BRAND__

  // 2. URL search param (?brand=rbn)
  const param = new URLSearchParams(window.location.search).get('brand')
  if (isBrand(param)) return param

  // 3. Brand por defecto
  return 'whitelabel'
})()
