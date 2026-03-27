// SCSS base: variables de tema (light/dark), reset, sr-only — compartido entre modos.
// No incluye nada específico de wizard ni de configurador.
import './styles/theme.scss'
import { getInitialTheme, applyTheme } from './theme/darkMode'
import { activeMode } from './mode/detect'

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
//   bootstrap       → wizard (CSS + JS)
//   bootstrap-configurator → configurador (CSS + JS)
// El modo inactivo nunca se descarga.
if (activeMode === 'wizard') {
  import('./bootstrap').then(({ mount }) => mount(container!))
} else {
  import('./bootstrap-configurator').then(({ mount }) => mount(container!))
}
