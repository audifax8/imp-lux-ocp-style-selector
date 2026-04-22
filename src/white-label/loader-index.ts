import type { Brand } from '@/declarations/types'

import rbnStyles from './rbn/index.scss?inline'
import oakStyles from './oak/index.scss?inline'
import sghStyles from './sgh/index.scss?inline'
import blizStyles from './bliz/index.scss?inline'
import cdmStyles from './cdm/index.scss?inline'

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
