//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import configuratorStyles from '@/configurator/configurator.scss?inline'
import { injectBrandStyles } from '@/white-label/loader-configurator'
import { activeBrand } from '@/white-label/detect'
import AppConfigurator from './AppConfigurator'

const styleEl = document.createElement('style')
styleEl.dataset.mode = 'configurator'
styleEl.textContent = configuratorStyles
document.head.appendChild(styleEl)

injectBrandStyles(activeBrand)

export function mount(container: HTMLElement): void {
  createRoot(container).render(
    /*<StrictMode>
      <AppConfigurator />
    </StrictMode>,*/
    <AppConfigurator />
  )
}
