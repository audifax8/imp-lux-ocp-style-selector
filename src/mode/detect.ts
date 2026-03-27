// Detecta el modo de inicialización una sola vez al cargar el módulo (singleton).
// Prioridad: 1) window.__IMP_LUX_MODE__  2) URL param ?mode=  3) 'configurator' por defecto
//
// Uso desde el host:
//   window.__IMP_LUX_MODE__ = 'wizard'  → antes de cargar el widget JS
//   https://example.com/?mode=wizard    → via URL param
export const MODES = ['wizard', 'configurator'] as const
export type Mode = (typeof MODES)[number]

const isMode = (value: unknown): value is Mode =>
  typeof value === 'string' && (MODES as readonly string[]).includes(value)

export const activeMode: Mode = (() => {
  const win = window as Window & { __IMP_LUX_MODE__?: unknown }
  if (isMode(win.__IMP_LUX_MODE__)) return win.__IMP_LUX_MODE__

  const param = new URLSearchParams(window.location.search).get('mode')
  if (isMode(param)) return param

  return 'configurator'
})()
