// Carga los estilos de brand para el modo demo.
// Reutiliza los wizard.scss de cada brand — suficiente para probar layouts.
import type { Brand } from './types'

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
}

export const injectBrandStyles = (brand: Brand): void => {
  if (document.querySelector(`style[data-brand="${brand}"]`)) return

  const style = document.createElement('style')
  style.dataset.brand = brand
  style.textContent = brandStyles[brand]
  document.head.appendChild(style)
}
