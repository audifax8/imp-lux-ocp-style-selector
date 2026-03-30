import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import indexStyles from '@/products-index/index.scss?inline'
import { injectBrandStyles } from '@/white-label/loader-index'
import { activeBrand } from '@/white-label/detect'
import AppIndex from './AppIndex'

const styleEl = document.createElement('style')
styleEl.dataset.mode = 'index'
styleEl.textContent = indexStyles
document.head.appendChild(styleEl)

injectBrandStyles(activeBrand)

export function mount(container: HTMLElement): void {
  createRoot(container).render(
    <StrictMode>
      <AppIndex />
    </StrictMode>,
  )
}
