import type { Brand } from '@/declarations/types'
import { runIdle } from '@/libs/helpers'

// import.meta.env.BASE_URL:
//   dev  → '/'   → '/fonts/' relativo al documento  ✓
//   prod → './'  → './fonts/' relativo al documento ✓
// Funciona porque las fuentes están en public/ (mismo origen que la página).
const fontsBase = new URL(`${import.meta.env.BASE_URL}fonts/`, location.href).href

// ─── Source types ─────────────────────────────────────────────────────────────

interface LocalFontDef {
  type: 'local'
  family: string
  woff2: string
  woff: string
  descriptors?: FontFaceDescriptors
}

/**
 * Stylesheet URL de Google Fonts u otro CDN.
 * Una sola entrada puede cubrir múltiples familias y pesos.
 * Incluye font-display:swap y unicode-range subsetting por browser.
 *
 * Requiere que el host tenga en su CSP:
 *   style-src  https://fonts.googleapis.com
 *   font-src   https://fonts.gstatic.com
 *
 * Ejemplos de href:
 *   Google Fonts → 'https://fonts.googleapis.com/css2?family=Oswald:wght@500&family=Lato:wght@400&display=swap'
 *   Bunny Fonts  → 'https://fonts.bunny.net/css?family=oswald:500|lato:400&display=swap'
 *   Adobe Fonts  → 'https://use.typekit.net/{projectId}.css'
 */
interface RemoteFontDef {
  type: 'remote'
  href: string
}

type FontDef = LocalFontDef | RemoteFontDef

// ─── Brand configs ────────────────────────────────────────────────────────────

const BRAND_FONTS: Partial<Record<Brand, { local: FontDef[]; remote: FontDef[] }>> = {
  /**
   * RBN — local: archivos en public/fonts/rbn/ (sin red, sin CORS).
   *
   * Nota: los archivos disponibles son Oswald-Medium (500) y Lato-Bold (700).
   * El spec de diseño usa Lato weight 400 — sustituir Lato-Bold por
   * Lato-Regular (woff2/woff) si se añade ese archivo, y cambiar el
   * descriptor a { weight: '400' }.
   */
  rbn: {
    local: [
      {
        type: 'local',
        family: 'Oswald',
        woff2: `${fontsBase}rbn/Oswald-Medium.woff2`,
        woff:  `${fontsBase}rbn/Oswald-Medium.woff`,
        descriptors: { weight: '500' },
      },
      {
        type: 'local',
        family: 'Lato',
        woff2: `${fontsBase}rbn/Lato-Bold.woff2`,
        woff:  `${fontsBase}rbn/Lato-Bold.woff`,
        descriptors: { weight: '700' },
      },
    ],
    remote: [
      {
        type: 'remote',
        href: 'https://fonts.googleapis.com/css2?family=Oswald:wght@500&family=Lato:wght@400&display=swap',
      },
    ],
  },
}

// ← única línea a cambiar para alternar entre fuentes locales y remotas
const FONT_SOURCE: 'local' | 'remote' = 'local'

// ─── Loaders ─────────────────────────────────────────────────────────────────

function loadLocalFont({ family, woff2, woff, descriptors }: LocalFontDef): void {
  const face = new FontFace(
    family,
    `url('${woff2}') format('woff2'), url('${woff}') format('woff')`,
    descriptors,
  )
  face.load().then(loaded => document.fonts.add(loaded)).catch(() => {})
}

function loadRemoteFont({ href }: RemoteFontDef): void {
  if (document.querySelector(`link[data-font-href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.setAttribute('data-font-href', href)
  link.href = href
  document.head.appendChild(link)
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function loadBrandFonts(brand: Brand): void {
  const config = BRAND_FONTS[brand]
  if (!config) return

  const defs = config[FONT_SOURCE]
  runIdle(() => {
    defs.forEach(def => {
      if (def.type === 'local') loadLocalFont(def)
      else loadRemoteFont(def)
    })
  })
}
