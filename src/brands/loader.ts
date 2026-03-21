// Cada brand SCSS se importa con ?inline: Vite lo compila en build-time y lo
// embebe como string en el JS bundle. El CSS NO se aplica hasta que se llama
// a injectBrandStyles() — solo se inyecta el brand activo, los demás
// permanecen como strings inertes en el bundle (comprimidos a ~bytes con gzip).
import type { Brand } from './types'

import rbnStyles from './rbn/styles.scss?inline'
import oakStyles from './oak/styles.scss?inline'
import sghStyles from './sgh/styles.scss?inline'
import blizStyles from './bliz/styles.scss?inline'
import cdmStyles from './cdm/styles.scss?inline'

const brandStyles: Record<Brand, string> = {
  rbn: rbnStyles,
  oak: oakStyles,
  sgh: sghStyles,
  bliz: blizStyles,
  cdm: cdmStyles,
}

export const injectBrandStyles = (brand: Brand): void => {
  // Idempotente: no inyecta dos veces el mismo brand
  if (document.querySelector(`style[data-brand="${brand}"]`)) return

  const style = document.createElement('style')
  style.dataset.brand = brand
  style.textContent = brandStyles[brand]
  document.head.appendChild(style)
}
