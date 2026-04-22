// Carga los estilos de brand específicos del modo wizard.
// Cada brand SCSS se importa con ?inline: compilado en build-time, embebido como
// string en el chunk bootstrap-wizard. Solo se inyecta el brand activo.
import type { Brand } from '@/declarations/types'

import rbnStyles from './rbn/wizard.scss?inline'
import oakStyles from './oak/wizard.scss?inline'
import sghStyles from './sgh/wizard.scss?inline'
import blizStyles from './bliz/wizard.scss?inline'
import cdmStyles from './cdm/wizard.scss?inline'

const brandStyles: Record<Brand, string> = {
  rbn: rbnStyles,
  oak: oakStyles,
  sgh: sghStyles,
  bliz: blizStyles,
  cdm: cdmStyles,
  whitelabel: rbnStyles
}

export const injectBrandStyles = (brand: Brand): void => {
  if (document.querySelector(`style[data-brand="${brand}"]`)) return

  const style = document.createElement('style')
  style.dataset.brand = brand
  style.textContent = brandStyles[brand]
  document.head.appendChild(style)
}
