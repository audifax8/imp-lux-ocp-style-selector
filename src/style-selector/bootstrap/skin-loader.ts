// Carga los tokens de skin para el modo startWithStyleSelector.
// Los archivos se importan con ?inline: compilados en build-time, embebidos
// como strings en el chunk bootstrap-wizard. Se inyectan en este orden:
//   1. @layer base, skin, mode; — establece el orden de cascada
//   2. wl/skin (siempre, todos los brands)
//   3. wl/skin-inverse (siempre, todos los brands) — reescrito a @layer mode
//   4. rbn/skin + rbn/skin-inverse — solo si brand === 'rbn'
//
// Los archivos inverse son auto-generados con @layer skin por error respecto
// a la spec. Se corrige en tiempo de inyección reemplazando la declaración.
import type { Brand } from '@/white-label/types';

import indexWlSkin from '@/style-selector/styles/wl/index.scss?inline';
import wlSkin from '@/style-selector/styles/wl/skin.scss?inline';
import wlInverse from '@/style-selector/styles/wl/skin-inverse.scss?inline';

import indexRBNSkin from '@/style-selector/styles/rbn/index.scss?inline';
import rayBanSkin from '@/style-selector/styles/rbn/skin.scss?inline';
import rayBanInverse from '@/style-selector/styles/rbn/skin-inverse.scss?inline';

const LAYER_ORDER = '@layer base, skin, mode;';

function toModeLayer(css: string): string {
  return css.replace('@layer skin {', '@layer mode {');
}

export const injectSkinStyles = (brand: Brand): void => {
  if (document.querySelector('style[data-skin-layers]')) return;

  const layerEl = document.createElement('style');
  layerEl.dataset.skinLayers = '';
  layerEl.textContent = LAYER_ORDER;
  document.head.appendChild(layerEl);

  const whitelabelEl = document.createElement('style');
  whitelabelEl.dataset.skin = 'whitelabel';
  whitelabelEl.textContent = wlSkin + toModeLayer(wlInverse);
  document.head.appendChild(whitelabelEl);

  const wlIndexEl = document.createElement('style');
  wlIndexEl.dataset.variables = '';
  wlIndexEl.textContent = indexWlSkin;
  document.head.appendChild(wlIndexEl);

  if (brand === 'rbn') {
    const rayBanEl = document.createElement('style');
    rayBanEl.dataset.skin = 'ray-ban';
    rayBanEl.textContent = rayBanSkin + toModeLayer(rayBanInverse);
    document.head.appendChild(rayBanEl);

    const rayBanIndexEl = document.createElement('style');
    rayBanIndexEl.dataset.variables = '';
    rayBanIndexEl.textContent = indexRBNSkin;
    document.head.appendChild(rayBanIndexEl);
  }
}
