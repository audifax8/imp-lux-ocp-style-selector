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
//
// Para añadir una nueva versión: importar sus archivos y añadir la entrada
// correspondiente en VERSION_MAP.
import type { Brand } from '@/declarations/types';

// ── v1.0 ─────────────────────────────────────────────────────────────────────
import wlIndex_v1 from '@/style-selector/styles/1.0/wl/index.scss?inline';
import wlSkin_v1 from '@/style-selector/styles/1.0/wl/skin.scss?inline';
import wlInverse_v1 from '@/style-selector/styles/1.0/wl/skin-inverse.scss?inline';

import rbnIndex_v1 from '@/style-selector/styles/1.0/rbn/index.scss?inline';
import rbnSkin_v1 from '@/style-selector/styles/1.0/rbn/skin.scss?inline';
import rbnInverse_v1 from '@/style-selector/styles/1.0/rbn/skin-inverse.scss?inline';
// ─────────────────────────────────────────────────────────────────────────────

type VersionStyles = {
  wlSkin: string;
  wlInverse: string;
  wlIndex: string;
  rbnSkin: string;
  rbnInverse: string;
  rbnIndex: string;
};

const VERSION_MAP: Record<string, VersionStyles> = {
  '1.0': {
    wlSkin: wlSkin_v1,
    wlInverse: wlInverse_v1,
    wlIndex: wlIndex_v1,
    rbnSkin: rbnSkin_v1,
    rbnInverse: rbnInverse_v1,
    rbnIndex: rbnIndex_v1,
  },
};

const DEFAULT_VERSION = '1.0';

const LAYER_ORDER = '@layer base, skin, mode;';

function toModeLayer(css: string): string {
  return css.replace('@layer skin {', '@layer mode {');
}

export const injectSkinStyles = (brand: Brand, tokenVersion: string): void => {
  if (document.querySelector('style[data-skin-layers]')) return;

  const styles = VERSION_MAP[tokenVersion] ?? VERSION_MAP[DEFAULT_VERSION];

  const layerEl = document.createElement('style');
  layerEl.dataset.skinLayers = '';
  layerEl.textContent = LAYER_ORDER;
  document.head.appendChild(layerEl);

  const whitelabelEl = document.createElement('style');
  whitelabelEl.dataset.skin = 'whitelabel';
  whitelabelEl.textContent = styles.wlSkin + toModeLayer(styles.wlInverse);
  document.head.appendChild(whitelabelEl);

  const wlIndexEl = document.createElement('style');
  wlIndexEl.dataset.variables = '';
  wlIndexEl.textContent = styles.wlIndex;
  document.head.appendChild(wlIndexEl);

  if (brand === 'rbn') {
    const rayBanEl = document.createElement('style');
    rayBanEl.dataset.skin = 'ray-ban';
    rayBanEl.textContent = styles.rbnSkin + toModeLayer(styles.rbnInverse);
    document.head.appendChild(rayBanEl);

    const rayBanIndexEl = document.createElement('style');
    rayBanIndexEl.dataset.variables = '';
    rayBanIndexEl.textContent = styles.rbnIndex;
    document.head.appendChild(rayBanIndexEl);
  }
};
