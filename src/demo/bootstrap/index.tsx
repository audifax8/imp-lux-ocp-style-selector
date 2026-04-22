import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import demoStyles from '@/demo/demo.scss?inline'
//import { injectBrandStyles } from '@/white-label/loader-demo'
//import { activeBrand } from '@/white-label/detect'
import AppDemo from '../AppDemo'

const styleEl = document.createElement('style')
styleEl.dataset.mode = 'demo'
styleEl.textContent = demoStyles
document.head.appendChild(styleEl)

/*import themeStyles from '@/shared/styles/theme.scss?inline'
const themeEl = document.createElement('style')
themeEl.dataset.mode = 'demo'
themeEl.textContent = themeStyles
document.head.appendChild(themeEl)
*/

//injectBrandStyles(activeBrand)

export function mount(container: HTMLElement): void {
  createRoot(container).render(
    <StrictMode>
      <AppDemo />
    </StrictMode>,
  )
}
