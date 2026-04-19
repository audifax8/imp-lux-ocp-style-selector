import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import wizardStyles from '@/style-selector/bootstrap/index.scss?inline'

import { injectBrandStyles } from '@/white-label/loader-wizard'
import { injectSkinStyles } from '@/style-selector/bootstrap/skin-loader'
import { activeBrand } from '@/white-label/detect'

import { DataProvider } from '@/style-selector/context/data'
import StyleSelector from '@/style-selector/bootstrap'

const styleEl = document.createElement('style')
styleEl.dataset.mode = 'wizard'
styleEl.textContent = wizardStyles
document.head.appendChild(styleEl)

injectBrandStyles(activeBrand)
injectSkinStyles(activeBrand)

export function mount(container: HTMLElement): void {
  createRoot(container).render(
    <StrictMode>
      <DataProvider>
        <StyleSelector />  
      </DataProvider>
    </StrictMode>,
  )
}
