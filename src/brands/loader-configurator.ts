// Carga los estilos de brand específicos del modo configurador.
// Cada brand SCSS se importa con ?inline: compilado en build-time, embebido como
// string en el chunk bootstrap-configurator. Solo se inyecta el brand activo.
import type { Brand } from './types'

import rbnStyles from './rbn/configurator.scss?inline'
import oakStyles from './oak/configurator.scss?inline'
import sghStyles from './sgh/configurator.scss?inline'
import blizStyles from './bliz/configurator.scss?inline'
import cdmStyles from './cdm/configurator.scss?inline'

const brandStyles: Record<Brand, string> = {
  rbn: rbnStyles,
  oak: oakStyles,
  sgh: sghStyles,
  bliz: blizStyles,
  cdm: cdmStyles,
}

export const injectBrandStyles = (brand: Brand): void => {
  if (document.querySelector(`style[data-brand="${brand}"]`)) return

  const style = document.createElement('style')
  style.dataset.brand = brand
  style.textContent = brandStyles[brand]
  document.head.appendChild(style)
}
