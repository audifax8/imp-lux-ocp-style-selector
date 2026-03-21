// Dark mode — aplicado en main.tsx de forma síncrona antes del primer render,
// igual que el brand CSS. Esto evita flash de tema incorrecto (FOIT).
//
// Prioridad:
//   1. localStorage (preferencia guardada explícitamente por el usuario)
//   2. prefers-color-scheme (sistema operativo)

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'imp-lux-theme'

const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' || saved === 'light' ? saved : systemTheme()
}

// Lee el tema actualmente aplicado al DOM (tras haber llamado applyTheme).
export const getCurrentTheme = (): Theme => {
  const attr = document.documentElement.dataset.theme
  return attr === 'dark' || attr === 'light' ? attr : getInitialTheme()
}

// Aplica el tema al elemento raíz. Llamar siempre antes de que React monte.
export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(STORAGE_KEY, theme)
}

export const toggleTheme = (current: Theme): Theme => {
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  return next
}
