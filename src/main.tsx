// SCSS crítico: variables (light + dark), reset, skeleton — igual para todos los brands.
// Este import genera el .css del bundle principal, NO añade bytes al .js.
import './styles/critical.scss'
import { activeBrand } from './brands/detect'
import { injectBrandStyles } from './brands/loader'
import { getInitialTheme, applyTheme } from './theme/darkMode'

// ── Setup síncrono ANTES de cualquier render ──────────────────────────────────
// Debe ocurrir aquí, en el entry, para evitar FOUC de tema y brand.
applyTheme(getInitialTheme())
injectBrandStyles(activeBrand)

// ── Preparar el contenedor del widget ────────────────────────────────────────
// El cliente puede tener el div ya en su HTML; si no, lo creamos al final del body.
const MOUNT_ID = 'imp-lux-ocp-style-selector'

let container = document.getElementById(MOUNT_ID)

if (!container) {
  container = document.createElement('div')
  container.id = MOUNT_ID
  document.body.appendChild(container)
}

container.setAttribute('role', 'region')
container.setAttribute('aria-label', 'Style Selector')

// ── Cargar React + App de forma lazy ─────────────────────────────────────────
// react-dom (~136 KB) no bloquea el entry. El skeleton estático del HTML
// (o el que haya en el container) es visible mientras el chunk carga.
import('./bootstrap').then(({ mount }) => mount(container!))
