// SCSS base: variables de tema (light/dark), reset, sr-only — compartido entre modos.
// No incluye nada específico de wizard ni de configurador.
//import '@/shared/styles/theme.scss'
import '@/shared/styles/reset.scss'
//import '@/shared/styles/critical.scss'
import { getInitialTheme, applyTheme } from '@/shared/theme/darkMode'
import { activeMode } from '@/shared/mode/detect'

// ── Setup síncrono ANTES de cualquier render ──────────────────────────────────
// Aplica el tema antes del mount para evitar FOUC de tema.
// Las variables CSS ya están disponibles vía theme.scss (cargado como <link>).
applyTheme(getInitialTheme())

// ── Preparar el contenedor del widget ────────────────────────────────────────
const MOUNT_ID = 'imp-lux-ocp-style-selector'

let container = document.getElementById(MOUNT_ID)

if (!container) {
  container = document.createElement('div')
  container.id = MOUNT_ID
  document.body.appendChild(container)
}

container.setAttribute('role', 'region')
container.setAttribute('aria-label', 'Style Selector')

// ── Cargar el bootstrap del modo activo de forma lazy ─────────────────────────
// Vite produce dos árboles de chunks completamente separados:
//   bootstrap       → startWithStyleSelector (CSS + JS)
//   bootstrap-configurator → configurador (CSS + JS)
// El modo inactivo nunca se descarga.
if (activeMode === 'startWithStyleSelector') {
  import('@/style-selector').then(({ mount }) => mount(container!))
} else if (activeMode === 'index') {
  import('@/products-index/bootstrap').then(({ mount }) => mount(container!))
} else if (activeMode === 'demo') {
  import('@/demo/bootstrap').then(({ mount }) => mount(container!))
} else {
  import('@/configurator/bootstrap').then(({ mount }) => mount(container!))
}
