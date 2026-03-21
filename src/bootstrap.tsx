import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

export function mount(container: HTMLElement): void {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
