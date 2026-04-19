// Carga los tokens de skin para el modo startWithStyleSelector.
// Los archivos se importan con ?inline: compilados en build-time, embebidos
// como strings en el chunk bootstrap-wizard. Se inyectan en este orden:
//   1. @layer base, skin, mode; — establece el orden de cascada
//   2. skin-whitelabel (siempre, todos los brands)
//   3. skin-whitelabel-inverse (siempre, todos los brands) — reescrito a @layer mode
//   4. skin-ray-ban + skin-ray-ban-inverse — solo si brand === 'rbn'
//
// Los archivos inverse son auto-generados con @layer skin por error respecto
// a la spec. Se corrige en tiempo de inyección reemplazando la declaración.
import type { Brand } from '@/white-label/types'

import whitelabelSkin from '@/shared/styles/skin-whitelabel.scss?inline'
import whitelabelInverse from '@/shared/styles/skin-whitelabel-inverse.scss?inline'
import rayBanSkin from '@/white-label/rbn/skin-ray-ban.scss?inline'
import rayBanInverse from '@/white-label/rbn/skin-ray-ban-inverse.scss?inline'

const LAYER_ORDER = '@layer base, skin, mode;'

function toModeLayer(css: string): string {
  return css.replace('@layer skin {', '@layer mode {')
}

export const injectSkinStyles = (brand: Brand): void => {
  if (document.querySelector('style[data-skin-layers]')) return

  const layerEl = document.createElement('style')
  layerEl.dataset.skinLayers = ''
  layerEl.textContent = LAYER_ORDER
  document.head.appendChild(layerEl)

  const whitelabelEl = document.createElement('style')
  whitelabelEl.dataset.skin = 'whitelabel'
  whitelabelEl.textContent = whitelabelSkin + toModeLayer(whitelabelInverse)
  document.head.appendChild(whitelabelEl)

  if (brand === 'rbn') {
    const rayBanEl = document.createElement('style')
    rayBanEl.dataset.skin = 'ray-ban'
    rayBanEl.textContent = rayBanSkin + toModeLayer(rayBanInverse)
    document.head.appendChild(rayBanEl)
  }
}
