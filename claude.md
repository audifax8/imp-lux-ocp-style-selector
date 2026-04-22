# imp-lux-ocp-style-selector — Project Context

## What it is
Self-contained React 19 widget (embeddable). Three initialization modes:
- **configurator** (default) — glasses configurator experience with RTR (Real-Time Rendering)
- **style-selector** (startWithStyleSelector) — picks glasses type → model → opens product page
- **products-index** (index) — product index listing
- **demo** — sandbox para probar layouts desktop/mobile con brand CSS activo; sin skeleton; acceso al estilo base compartido

## Repos
- `origin` → `git@github.com:audifax8/imp-lux-ocp-style-selector.git`
- `configid` → `git@github.com:ConfigureID-Imp/imp-lux-ocp-style-selector.git`
- Branch: `develop` (default; `main` pending deletion after GitHub default-branch change)

## Deploy
GitHub Actions → `.github/workflows/deploy.yml` → builds `dist/` → GitHub Pages.
- audifax8: `https://audifax8.github.io/imp-lux-ocp-style-selector/`
- ConfigureID-Imp: `https://configureid-imp.github.io/imp-lux-ocp-style-selector/`

## Node
Version defined in `.node-version` (currently `22.22`). Always activate with nvm before running any node/npm/npx/vite command:
```
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use $(cat .node-version)
```

## Build (Vite 8 / Rolldown)
- Format: `es` (ES modules, real code splitting)
- Entry: `imp-lux-ocp-style-selector.js` (tiny, ~2.8 KB)
- CSS bundle: `imp-lux-ocp-style-selector.css` — only `theme.scss` (~1.2 KB gzip, no mode-specific CSS)
- Chunks lazy: `chunks/[name]-[hash].js` (con hash para cache busting)
- **Chunks con nombre fijo** (sin hash, para `modulepreload` y rastreo de peso):
  - `chunks/bootstrap-configurator.js` — bootstrap del modo configurator
  - `chunks/bootstrap-wizard.js` — bootstrap del modo style-selector
  - `chunks/bootstrap-index.js` — bootstrap del modo products-index
  - `chunks/bootstrap-demo.js` — bootstrap del modo demo
  - `chunks/configurator-init.js` — todas las deps de `executePhase1` en un único chunk (9.1 KB / 3.4 KB gzip); preloadeado en `index.html` para que resuelva de caché con latencia cero
- **Nombres fijos via `facadeModuleId`** — los tres bootstraps son `index.tsx` tras el refactor de directorios, así que Rolldown no puede inferir su nombre por archivo. `chunkFileNames` usa `chunkInfo.facadeModuleId` (ruta completa) para asignar el nombre correcto:
  - `id.includes('configurator/bootstrap')` → `bootstrap-configurator.js`
  - `id.includes('products-index/bootstrap')` → `bootstrap-index.js`
  - `id.includes('style-selector/bootstrap')` → `bootstrap-wizard.js`
  - `id.includes('demo/bootstrap')` → `bootstrap-demo.js`
  - `chunkInfo.name === 'configurator-init'` → `configurator-init.js` (no es entry, usa name)
- **`manualChunks`**: deps pesadas en chunks propios (cargadas solo cuando se necesitan):
  - `react-dom` → `chunks/react-dom-[hash].js`
  - `@cfg.plat/configure-core` → `chunks/configure-core-[hash].js`
  - `@fluid.inc/yr-configure-wrapper` → `chunks/yr-configure-wrapper-[hash].js`
  - `@fluid.inc/cmol-utils` → `chunks/cmol-utils-[hash].js`
  - `@fluid.inc/imp-tools-lux` → `chunks/imp-tools-lux-[hash].js`
- `base: './'` — relative paths for GitHub Pages subdirectory
- `cssCodeSplit: true` — CSS en chunks lazy (si los hubiera sin `?inline`) se emite como archivo independiente; actualmente sin efecto porque todo el CSS de modo/componente usa `?inline`. `assetFileNames` es una función: entry CSS → `imp-lux-ocp-style-selector.css` (nombre estable); chunk CSS → `chunks/[name]-[hash].css` (evita colisión de nombres)
- `resolve.alias` — `@/` path alias + stub de `jsonp-node.js` (Node-only, ver abajo)
- `define` — `process.browser: true` + `FLUID_CONFIGURATIONS_VERSION` para `@cfg.plat/configure-core` + `global: 'globalThis'` (ver workarounds)

## Workarounds de dependencias (vite.config.ts)
- **`patchFluidProductUrls` plugin** — `@cfg.plat/fluid-product-urls/configure.js` asigna `Function.name` directamente (`methods[method].name = method`), que falla en strict mode ESM. El plugin reemplaza la línea por `Object.defineProperty` con `writable: true`. Aplica en build (`transform` hook) y en dev pre-bundling (`optimizeDeps.rolldownOptions.plugins`).
- **`src/stubs/jsonp-node.js`** — `jsonp-client` tiene `browser: {"./jsonp-node.js": false}` pero Rolldown lo ignora. El stub reemplaza el módulo Node-only (usa `fs`/`vm`) para eliminar los warnings de build. Alias via regex `/.*jsonp-node(\.js)?$/` (necesario porque el require es relativo y Rolldown resuelve a ruta absoluta antes de buscar aliases).
- **`global: 'globalThis'` en `define`** — `@cfg.plat/configure-core` y sus deps transitivas (`@cfg.plat/configuration-loader`, `@cfg.plat/configuration-engine`, etc.) son librerías Node.js que referencian `global` (no existe en browser). Vite lo reemplaza estáticamente por `globalThis` en build y dev.

## Bundle sizes (baseline RBN-5144)
Medido con `npm run size` (`scripts/bundle-size.mjs`, appends a `bundle-sizes.log`):
- **Configurator total** (shared + configurator chunks): ~211 KB raw / ~69 KB gzip
- **Style-selector total** (shared + style-selector chunks): ~210 KB raw / ~67 KB gzip
- De eso, ~185 KB raw / ~57 KB gzip es `react-dom` (no controlable)
- Código de app propio: ~26 KB raw / ~12 KB gzip

`npm run build && npm run size -- --label "descripción"` tras cada feature para rastrear crecimiento.

## Post-build auditor (`scripts/audit.mjs`)
`npm run audit` — corre DESPUÉS de un build. Sale con código 1 si hay fallos.

Tres secciones:

**1. CHUNKS — presencia**
Verifica que existan los 6 archivos críticos: entry JS, CSS bundle, `bootstrap-configurator`, `bootstrap-wizard`, `bootstrap-index`, `configurator-init`.
Además cruza los `modulepreload` hrefs de `public/index.html` contra `dist/` — si renombras un chunk, avisa.

**2. SIZES — umbrales** (raw KB, sin comprimir)
| Chunk | WARN | FAIL |
|---|---|---|
| entry JS | > 10 KB | > 20 KB |
| bootstrap-* | > 35 KB | > 70 KB |
| configurator-init | > 15 KB | > 30 KB |

**3. BLOCKING — análisis estático de src/**
| Patrón | Severidad |
|---|---|
| `new Promise((resolve)` sin `reject` — Promise colgada | FAIL |
| `try/catch` alrededor de `.then()`/`import()` — no captura rechazos async | WARN |
| `await fetch()` directo en strategies — puede bloquear LCP | WARN |
| Synchronous XHR — `.open(..., false)` | FAIL |

## TypeScript config (`tsconfig.app.json`)
- `paths: { "@/*": ["./src/*"] }` — mirrors Vite alias so tsc resolves `@/` imports
- `erasableSyntaxOnly: false` — allows non-erasable enums (needed by `src/declarations/enums.ts`)
- All cross-folder imports use `@/` — no relative `../` imports across directories

## Module alias convention
All imports that cross a directory boundary use `@/` instead of relative `../` paths:
```ts
import { activeBrand } from '@/white-label/detect'     // ✓
import { activeBrand } from '../../white-label/detect'  // ✗
```
Same-folder imports (`./`) remain relative.

## Mode system
Mode detection singleton: `src/shared/mode/detect.ts`

Detection priority:
1. `window.__IMP_LUX_MODE__`
2. `?mode=` URL param
3. `'configurator'` (default)

Valid modes: `'startWithStyleSelector'` | `'configurator'` | `'index'` | `'demo'`

**Isolation rule:** each mode's chunks never load in the other modes.
All mode-specific CSS (including white-label CSS) is `?inline` — injected by the bootstrap before React mounts.

## Entry flow
`main.tsx` (sync setup only, no React):
1. Applies theme (`localStorage` → system → default light)
2. Detects active mode
3. Sets `role=region` + `aria-label` on container
4. Branches lazy import:
   - `import('@/style-selector/bootstrap')` → startWithStyleSelector
   - `import('@/products-index/bootstrap')` → index
   - `import('@/configurator/bootstrap')` → configurator (default)

**Style-selector bootstrap** (`style-selector/index.tsx`):
- Calls `injectSkinStyles(activeBrand, activeTokenVersion)` — injects all versioned skin token CSS (`styles/1.0/`) + layout tokens + cascade layer declaration
- `createRoot` + `<DataProvider><StyleSelector /></DataProvider>` (no AppStyleSelector intermediate)
- No longer injects `bootstrap/index.scss?inline` separately — all layout/brand CSS is handled inside `skin-loader.ts`
- No longer uses `white-label/loader-wizard` — wizard brand overrides moved into `style-selector/styles/1.0/{brand}/`
- `bootstrap/index.tsx` — Suspense wrapper; selects skeleton (SharedSkeleton vs `components/skeleton/`) and renders `StyleSelectorComponent` (deferred lazy)

**Configurator bootstrap** (`configurator/bootstrap/index.tsx`):
- Injects `configurator/configurator.scss?inline` (container + typography + skeleton + configurator styles)
- Injects active white-label CSS via `white-label/loader-configurator`
- `createRoot` + `<AppConfigurator />` (Configurator — LabelsProvider currently disabled)

**Products-index bootstrap** (`products-index/bootstrap/index.tsx`):
- Injects `products-index/index.scss?inline` (container + typography + skeleton + index styles)
- Injects active white-label CSS via `white-label/loader-index`
- `createRoot` + `<AppIndex />` (LabelsProvider + Index)

## White-label system
Brands: `rbn` (default), `oak`, `sgh`, `bliz`, `cdm`

Detection priority:
1. `window.__IMP_LUX_BRAND__`
2. `?brand=` URL param
3. `'rbn'`

Each brand has separate CSS per mode, loaded via `?inline`:
- `src/white-label/{brand}/configurator.scss` — brand overrides for configurator (placeholders)
- `src/white-label/{brand}/index.scss` — brand overrides for products-index (placeholders)
- **style-selector brand CSS has been moved** to `src/style-selector/styles/1.0/{brand}/` (see Skin token system below) — `wizard.scss` files and `loader-wizard.ts` have been deleted

Loaders (`src/white-label/`):
- `loader-configurator.ts` — imports all `{brand}/configurator.scss?inline`
- `loader-index.ts` — imports all `{brand}/index.scss?inline`
- `loader-demo.ts` — imports demo brand CSS (?inline, reutiliza estilos de cada brand)
- `detect.ts` — brand singleton
- `types.ts` — `Brand` type + `BRANDS` const

## Skin token system (startWithStyleSelector only)
Versioned CSS custom properties generados desde Figma. Coexisten con otras herramientas en la misma página porque están scoped a un atributo en lugar de `:root`.

**Estructura de archivos por versión** (`src/style-selector/styles/`):
```
style-selector/styles/
  1.0/
    _shared.scss              — @forward breakpoints (show allowlist) + typography; brand-agnostic
    shared/
      _variables.scss         — breakpoints only (identical across brands)
      _typography.scss        — 8 typography mixins using CSS custom properties
    wl/
      _variables.scss         — whitelabel brand-specific SVG URL vars
      index.scss              — SVG URL CSS custom properties scoped to [data-token-version][data-skin="whitelabel"]; @layer skin; light + inverse/dark
      skin.scss               — tokens Figma Whitelabel light; @layer skin; auto-generado
      skin-inverse.scss       — tokens Figma Whitelabel dark/inverse; auto-generado (ver nota)
    rbn/
      _variables.scss         — ray-ban brand-specific SVG URL vars
      index.scss              — SVG URL CSS custom properties scoped to [data-token-version][data-skin="ray-ban"]; @layer skin; light + inverse/dark
      skin.scss               — tokens Figma Ray-Ban light; @layer skin; auto-generado
      skin-inverse.scss       — tokens Figma Ray-Ban dark/inverse; auto-generado (ver nota)
```

**CSS cascade layers:** `@layer base, skin, mode;` — orden determinista: base → skin (light theme) → mode (inverse/dark). La capa `mode` garantiza que los tokens inverse siempre ganen sobre el tema light independientemente de la especificidad.

**Nota sobre layer discrepancy:** Los archivos `skin-inverse.scss` son auto-generados con `@layer skin` en lugar de `@layer mode` (discrepancia con la spec). El `skin-loader.ts` lo corrige en tiempo de inyección con un string replace (`@layer skin {` → `@layer mode {`), sin tocar los archivos generados.

**Token version singleton:** `src/style-selector/bootstrap/token-version.ts`
- Lee `?tokenVersion=` URL param; default `'1.0'`
- `export const activeTokenVersion: string`
- Importado por `skin-loader.ts` y `App.tsx`

**Loader:** `src/style-selector/bootstrap/skin-loader.ts`
- `VERSION_MAP` pattern — todos los SCSS `?inline` compilados en build time; selección en runtime por versión
- Importa 6 SCSS files por versión: `wlIndex`, `wlSkin`, `wlInverse`, `rbnIndex`, `rbnSkin`, `rbnInverse`
- `injectSkinStyles(brand: Brand, tokenVersion: string)` — inyecta en este orden: 1) `<style data-skin-layers>` con `@layer base, skin, mode;` 2) whitelabel index + skin (siempre) 3) ray-ban index + skin (solo si `brand === 'rbn'`)
- Falls back to `DEFAULT_VERSION = '1.0'` si version no está en `VERSION_MAP`
- Guard `data-skin-layers` evita inyección doble
- Llamado desde `style-selector/index.tsx`

**Agregar versión nueva:** crear `styles/2.0/`, añadir 6 imports en `skin-loader.ts`, añadir entrada en `VERSION_MAP`. Seleccionar con `?tokenVersion=2.0`.

**Atributos en el root div** (`bootstrap/App.tsx`):
- `data-token-version={activeTokenVersion}` — versión dinámica desde `token-version.ts`; los selectores CSS usan este atributo como scope raíz
- `data-skin` — brand skin activa: `rbn` → `"ray-ban"`, todos los demás → `"whitelabel"`
- `data-mode` — `"inverse"` en dark mode, omitido en light mode; reactivo via `useDarkMode` hook

**Dark mode reactivo:** `src/style-selector/bootstrap/useDarkMode.ts`
- `MutationObserver` sobre `html[data-theme]` (el mismo atributo que maneja `shared/theme/darkMode.ts`)
- Retorna `'inverse' | undefined`; se usa directamente como valor de `data-mode`

**Brand → skin mapping** (en `App.tsx`): `{ rbn: 'ray-ban' }` — si el brand no está en el mapa, usa `'whitelabel'`

**Componentes SCSS** — todos usan `@use '../../styles/1.0/shared' as *` (breakpoints + typography mixins brand-agnostic; valores idénticos entre brands). Los SVG URL custom properties se definen en `styles/1.0/{brand}/index.scss` y se consumen vía CSS vars — sin import brand-específico en los componentes.

## CSS architecture
```
imp-lux-ocp-style-selector.css               ← shared/styles/theme.scss only (skeleton vars, shimmer)
                                                loaded via <link>, always — no mode-specific content
                                                NOTA: critical.scss ya NO está en el bundle CSS —
                                                sus vars se inyectan como parte de cada mode ?inline

style-selector/index.tsx                     ← style-selector/bootstrap/skin-loader (skin tokens + layout CSS ?inline)
                                                skin-loader inyecta: layer declaration + wl/index + wl/skin + rbn/* (si rbn)
                                                bootstrap/index.scss incluye breakpoints de background + var --ss-bg
configurator/bootstrap/index.tsx             ← configurator/configurator.scss?inline + white-label/loader-configurator
products-index/bootstrap/index.tsx           ← products-index/index.scss?inline + white-label/loader-index
configurator/model/Model.tsx                 ← model/model.scss?inline (skeleton de gafas)
configurator/model/ModelContent.tsx          ← model/model-content.scss?inline (gafas reales, SOLO tras resolver skeleton)
shared/components/skeleton-loader/index.tsx  ← skeleton-loader/index.scss?inline + white-label/rbn.scss?inline (solo ?skeletonLoader=true)
```

## API config (no .env — runtime only)
`src/style-selector/api/config.ts` — priority for `API_LANGUAGE`:
1. `window.__IMP_LUX_API_LANG__`
2. `?lang=` URL param
3. Hardcoded default `'en'`

`BRAND_URLS` — per-brand full base URL map (replaces old `API_BASE_URL` + `BRAND_STORE_IDS` pattern):
- `rbn` → `https://www.ray-ban.com/wcs/resources/store/10151/remix/models?language=`
- `oak` → `https://www.oakley.com/en-us/oneConfigurator/models?language=`
- `sgh` → `https://www.ray-ban.com/wcs/resources/store/10151/remix/models?language=` (TODO: real URL)
- `bliz` → `https://www.bliz.com/wcs/shop/colorama/models?language=` (TODO: real URL)
- `cdm` → `https://www.ray-ban.com/wcs/resources/store/10151/remix/models?language=` (TODO: real URL)

Models endpoint: `GET {endpoint}/{lang}` — `endpoint` viene de `MergedParams` (URL dinámica con store reemplazable); fallback a `BRAND_URLS[brand] + API_LANGUAGE` vía `config.ts`

### `Models` class (`api/models.ts`)
Orquesta toda la carga de datos del modo style-selector:
- `init()` — lanza en paralelo: `getModels()` + `getUiSettings()` + `getMyDesigns()` + `getInspirationsDesigns()`
- `mapModels()` — construye `Output`: tipos, categorías con "All" deduplicado, `typesTranslated` (via `i18n`), `steps` dinámicos, `inspirations`
- `getUiSettings()` — CDN URL construida desde params: `workflow/customer/product/locale`
- `getModels()` — endpoint dinámico; reemplaza store ID si `params.store` presente; headers de auth comentados temporalmente (en pruebas con endpoint real)
- `getMyDesigns()` — retorna mock data solo si `?mockMyDesigns=true`; si no, array vacío (TODO: API real)
- `getInspirationsDesigns()` — retorna mock data solo si `?mockInspirations=true`; si no, array vacío (TODO: API real)
- **Steps dinámicos**: `DEFAULT_STEPS` = [type, model]; step "inspiration" se añade solo si `inspirations.length > 0`
- **myDesign type**: si hay `myDesigns`, se añade tipo `"myDesign"` a `types` y `categories`

## Labels service
`src/labels/` — i18n hook-based service.
- `types.ts` — `Labels` interface + `interpolate(template, vars)` helper
- `defaults.ts` — English fallback
- `service.ts` — `fetchLabels()` — inferred endpoint: `.../remix/labels?language={lang}` (**API not ready yet**)
- `LabelsProvider.tsx` — Context provider; fetches on mount, uses defaults on error
- `useLabels.ts` — `useLabels()` hook

Used in every component. While API loads or on error, `DEFAULT_LABELS` are shown silently.
Labels has sections for: `widget`, `configurator`, `darkMode`, `step1`, `step2`.

## Style-selector
Single-page component. Internal state manages type selection vs. model grid view.

- `bootstrap/index.tsx` — wrapper de Suspense; monta `StyleSelectorComponent` (lazy via deferred promise) o skeleton (si `?skeleton` param activo); selecciona entre `SharedSkeleton` (`?skeletonLoader=true`) y `components/skeleton/` (default)
- `bootstrap/App.tsx` — dos componentes: `Style` (outer, lee context, retorna `null` si no hay datos) + `StyleWithData` (inner, todos los hooks y render — solo monta cuando datos garantizados); `steps` vienen de `phase1Data?.steps` (dinámicos); gestiona estado: tipo, categoría, modelo seleccionado; renderiza `TypeStep` / `ModelStep` según `selectedStep?.id`; usa `<section aria-label>` (no `<main>`) para los steps; **focus management**: `mainRef` (forwardRef a `ModelStep`) + `useEffect([selectedStep])` — cuando step cambia a MODEL o INSPIRATIONS, mueve foco al primer elemento interactivo; `hasMounted` ref evita foco en el render inicial; **skin token attributes**: root div lleva `data-token-version={activeTokenVersion}` (dinámico via `token-version.ts`), `data-skin` (rbn→"ray-ban", otros→"whitelabel"), `data-mode` reactivo via `useDarkMode()`
- `bootstrap/token-version.ts` — singleton; lee `?tokenVersion=` URL param; default `'1.0'`; `export const activeTokenVersion: string`
- `bootstrap/skin-loader.ts` — `VERSION_MAP` compila 6 SCSS `?inline` por versión; `injectSkinStyles(brand: Brand, tokenVersion: string)` — inyecta layer declaration + whitelabel index/skin + ray-ban index/skin (solo si rbn); corrige inverse `@layer skin` → `@layer mode` via string replace; ver sección "Skin token system"
- `bootstrap/useDarkMode.ts` — hook; `MutationObserver` sobre `html[data-theme]`; retorna `'inverse' | undefined` para usar como `data-mode`
- `components/skeleton/index.tsx` — skeleton completo del modo (era `StyleSelectorSkeleton.tsx`); usa `Header`, `SubNav`, y `Card` con `skeleton={true}`; `useI18n()`; `<section aria-label aria-busy="true">` (no main)
- `lazy-imports/index.ts` — deferred promise pattern; `StyleSelectorComponent = React.lazy(() => styleSelector.promise)`; `completeStyleSelectorPromise()` resuelve cuando DataProvider recibe datos; importa desde `@/style-selector/bootstrap/App`
- `context/context.ts` — `DataContext` con `Output` completo (types, typesTranslated, categories, inspirations, steps, i18n); `useData()` hook
- `context/i18n-context.ts` — `I18nContext` con `i18n | undefined`; `useI18n()` hook — para componentes que solo necesitan traducciones sin el `Output` completo; `undefined` mientras los datos cargan (devuelve fallback hardcoded en ese caso); usado en: `Header`, `SubNav`, `CategoryFilterComponent`, `components/skeleton/`, `SharedSkeleton`, `bootstrap/App.tsx`
- `context/data.tsx` — `DataProvider`; `servicesRef` (`useRef`) guarda `{ core, rtrSkeleton }` cuando fase 2 resuelve — nunca en state ni en context; `configuratorActions` creado con `useMemo([], [])` → referencia estable (cero re-renders); provee `ConfiguratorActionsContext` + `ProductsContext` + `DataContext` + `I18nContext` anidados; prefetch de `bootstrap/App` en `useEffect([], [])`
- `context/products-context.ts` — `ProductsContext` con `HProduct[] | undefined`; `useProducts()` hook — solo datos del catálogo headless; `undefined` hasta fase 2
- `context/configurator-actions-context.ts` — `ConfiguratorActionsContext` con `ConfiguratorActions | undefined`; `useConfiguratorActions()` hook — expone `onModelHover(product)` + `onModelSelect(product)`; callbacks estables que envuelven `rtrSkeleton.downLoadAssets()` y `core.render2D()` respectivamente; los componentes llaman comportamiento, no instancias de clase
- `models/base.ts` — `BaseStrategy extends AsyncTask`; clase abstracta base de las estrategias del style-selector; provee `caretaker`, `originator`, `state`; expone `resolveLayoutPromise/resolveMenuPromise/destroy`
- `models/core.ts` — `Core extends AsyncTask implements InitBaseMethods`; URL constants CDN/headless; `init()` carga los JSONs de configuración + crea `ConfigureCore` + aplica OLA overrides (Lux); `getHeadlessProducts()` fetcha el catálogo headless y retorna `HeadlessProductsData`; `createCore()` wrappea `@cfg.plat/configure-core` en `@fluid.inc/yr-configure-wrapper/core`; `getConfigureJsons/getConfigureJsonsURLs()` cargan productGraph, preferences, uiSettings desde CDN
- `models/rtr-skeleton.ts` — `RTRSkeleton extends BaseStrategy`; `downLoadAssets()` llama `rtrVersion.downloadScript()` (y opcionalmente `rtrAssets.downloadRTRAssets()`); `initRTR()` inicializa el viewer RTR con token + background; `getBackGround()` devuelve `RTRBackground` según darkMode/system preference; `init()` orquesta todo con performance marks
- `models/rtr-assets.ts` — `RTRAssets extends AsyncTask`; gestión de assets RTR y prefetch via `quicklink`; `downloadRTRAssets()` carga mini-product JSON → prefetch startup list; `prefetchByKeyName()` prefetch por atributo configurable; URLs via `RTR_ASSETS_URL` + `miniProduct` templates

### Phase 2 — StyleSelectorConfigurator
`StyleSelectorInitStrategy.preloadConfiguratorData()` arranca DESPUÉS de que fase 1 resuelve, en background (no bloquea render):
1. Importa dinámicamente `Core` y `RTRSkeleton` en paralelo
2. Crea instancias con `this.caretaker`/`this.originator` (guardados durante `loadAppData`)
3. Lanza en paralelo: `rtrSkeleton.downLoadAssets()` + `core.getHeadlessProducts()`
4. `getHeadlessProducts()` fetcha: `https://prod-ingress.fluidconfigure.com/headless/customers/{customer}/products?workflow={workflow}&apiKey={apiKey}`
5. Retorna `StyleSelectorConfigurator = { data: HProduct[], core: Core, rtrSkeleton: RTRSkeleton }`

Los servicios se distribuyen en dos contextos separados — los componentes no acceden a instancias de clase directamente:
- **`ProductsContext`** → `HProduct[]` — datos serializables para lookup en UI
- **`ConfiguratorActionsContext`** → `{ onModelHover, onModelSelect }` — callbacks estables derivados de los servicios

`ModelCard` consume ambos:
- **hover** (`onMouseEnter`): `products?.find(p => p.vendorId === vendorId)` → `actions.onModelHover(product)` → `rtrSkeleton.downLoadAssets()`
- **click** (`onClick`): mismo lookup → `actions.onModelSelect(product)` → `core.render2D()`

`servicesRef` en `DataProvider` guarda `{ core, rtrSkeleton }` en un `useRef` — no en context ni en state. Los callbacks de `ConfiguratorActionsContext` cierran sobre `servicesRef.current` en tiempo de ejecución → referencia estable, cero re-renders adicionales.

Tipos: `HProduct` (flat, sin wrapper `.product`) para lookup UI. `HeadlessProductsData = { data: HProduct[] }` es el shape del response. `StyleSelectorConfigurator = { data, core, rtrSkeleton }` es el retorno interno de `preloadConfiguratorData`.

### i18n keys del modo style-selector
Todas las keys usan `getLabel(key, fallback)` salvo las indicadas con `getLang` (soportan interpolación `{var}`):

| Key | Fallback | Usado en |
|---|---|---|
| `style_selector_header_nav_label` | `'Steps'` | `Header` `<nav aria-label>` |
| `style_selector_header_menu_label` | `'Menu'` | `Header` menu button |
| `style_selector_subnav_label` | `'Step navigation'` | `SubNav` `<nav aria-label>` |
| `style_selector_subnav_back_label` *(getLang)* | `'Back to {step}'` | `SubNav` back button |
| `style_selector_subnav_previous_step` | `'previous step'` | fallback de `{step}` en back label |
| `style_selector_subnav_step_of` *(getLang)* | `'Step {n} of {m}'` | `SubNav` counter `aria-label` |
| `style_selector_category_filter_label` | `'Filter by category'` | `CategoryFilterComponent` radiogroup |
| `style_selector_loading_label` | `'Loading'` | `StyleSelectorSkeleton` + `SharedSkeleton` |
| `style_selector_loading_title` | `'Starting your experience'` | `SharedSkeleton` título |
| `style_selector_step_type_title` | `'Select glasses type'` | `TypeStep` section TYPE |
| `style_selector_step_type_list_label` | `'Glasses types'` | `TypeStep` ul TYPE |
| `style_selector_step_model_title` | `'Select a model'` | `ModelStep` section MODEL |
| `style_selector_step_inspirations_title` | `'Trending styles'` | `ModelStep` section INSPIRATIONS |
| `style_selector_models_list_label` | `'Models'` | `ModelStep` ul MODEL |
| `style_selector_inspirations_list_label` | `'Trending styles'` | `ModelStep` ul INSPIRATIONS |
| `style_selector_category_label_trending` | `'Select trending styles or'` | `ModelStep` trending text |
| `style_selector_category_label_skip` | `' skip to customization'` | `ModelStep` skip link text |
| `style_selector_opens_new_tab` | `', opens in new tab'` | `ModelStep` sr-only en skip link |
- `context/data.tsx` — `DataProvider`; ver descripción completa arriba
- _(typography moved to `src/shared/styles/_typography.scss` — ver sección Shared)_
- `bootstrap/index.scss` — ?inline CSS (layout, breakpoints, background images por resolución y tema via `--ss-bg`); scroll architecture: `.style-selector` es `height:100vh; flex-column; overflow:hidden` (background estático); `__elements` tiene `overflow-y:auto`; `__models` y `__inspiration` comparten `flex:1; overflow:hidden; flex-column`; `__models-list` es `flex:1; overflow-y:auto; padding:0 16rem`; `__inspiration` tiene `__container` con label + link "skip to customization"

### Logos (solo modo startWithStyleSelector)
Variable CSS `--ss-logo` — declarada en `.header-logo__icon` vía `style-selector/bootstrap/index.scss` (?inline, solo este modo). El componente `Header` usa `background-image: var(--ss-logo)` en `.header-logo__icon`; cuando `skeleton={true}` renderiza el skeleton en su lugar.

SCSS vars de ruta por brand:

| Brand | SCSS vars | Tamaño natural | Contenedor |
|---|---|---|---|
| wl (default) | `$logo-wl-dark/light` | 141×16px | heredado de `.header-logo` (140.4×15.251px) |
| rbn | `$logo-rbn-dark/light` | 112×49px | 56×24.5px (50% natural, aspect-ratio: 112/49) |

- `black` = logo oscuro → usado en **light mode** (fondo claro)
- `light` = logo claro → usado en **dark mode** (fondo oscuro)

Dark mode: mismo patrón doble (`prefers-color-scheme` + `[data-theme='dark']`) en ambos archivos.

Dónde vive cada override:
- `style-selector/styles/1.0/wl/index.scss` — define `--ss-logo`, `--arrow-left`, `--menu`, `--ss-loader` para todos los brands por defecto (wl); light + inverse/dark via `@layer skin`; scoped a `[data-token-version][data-skin="whitelabel"]`
- `style-selector/styles/1.0/rbn/index.scss` — overrides `--ss-logo`, `--menu`, `--ss-loader` para rbn + ajusta dimensiones de `.header-logo` (73×32px, aspect-ratio: 112/49); scoped a `[data-token-version][data-skin="ray-ban"]`
- Otros brands usan iconos wl sin override adicional

### Background images (solo modo startWithStyleSelector)
Imágenes en `public/imgs/background/{light|dark}/`. Aplicadas a `.style-selector` y `.style-selector-skeleton` para que el fondo sea consistente tanto en estado cargado como durante el skeleton.

Variable CSS `--ss-bg` — se declara en ambas clases y se sobreescribe por breakpoint y tema:

| SCSS var | Breakpoint | Device |
|---|---|---|
| (default) | < 768px | Mobile |
| `$bp-tablet-p` | ≥ 768px | Tablet Portrait |
| `$bp-tablet-l` | ≥ 1024px | Tablet Landscape |
| `$bp-desktop-xs` | ≥ 1280px | Desktop Biz xs |
| `$bp-desktop-biz` | ≥ 1440px | Desktop Biz |
| `$bp-desktop` | ≥ 1920px | Desktop |

Dark mode: sobreescrito con `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])` + `[data-theme='dark']` (mismo patrón que `theme.scss`).

Archivos disponibles:
- `public/imgs/background/light/Device=Mobile, Mode=Light.png`
- `public/imgs/background/light/Device=Tablet Portrait, Mode=Light.png`
- `public/imgs/background/light/Device=Tablet Landscape, Mode=Light.png`
- `public/imgs/background/light/Device=Desktop Biz xs, Mode=Light.png`
- `public/imgs/background/light/Device=Desktop Biz, Mode=Light.png`
- `public/imgs/background/light/Device=Desktop, Mode=Light.png`
- `public/imgs/background/dark/` — mismas 6 variantes en dark

### Componentes (`style-selector/components/`)
- `header/` — `Header`; usa `useI18n()` internamente; `<nav aria-label>` vía `style_selector_header_nav_label`; menu `<button aria-label>` vía `style_selector_header_menu_label`; skeleton via `Skeleton` component; patrón ARIA stepper: `<ol role="tablist">` + `<button role="tab" aria-selected aria-disabled tabIndex>`; roving tabindex (selected=0, otros=-1); navegación teclado: ArrowLeft/ArrowRight/Home/End mueven foco entre tabs; steps con `id > selectedStep.id` reciben `aria-disabled` + clase `header-nav-item__disabled`; logo con `aria-hidden`; menu icon como `<button>` nativo
- `sub-nav/` — `SubNav`; usa `useI18n()` internamente; `<nav aria-label>` vía `style_selector_subnav_label`; back button `aria-label` vía `style_selector_subnav_back_label` (con interpolación `{step}`); counter `aria-label` vía `style_selector_subnav_step_of` (con interpolación `{n}` y `{m}`); texto visual "N/M"; arrow via `--arrow-left` CSS var
- `category-filter/` — `CategoryFilterComponent`; usa `useI18n()` internamente; `aria-label` del radiogroup: prop `label` > `style_selector_category_filter_label` > `'Filter by category'`; patrón ARIA: `<ul role="radiogroup">` + `<li role="presentation">` + `<Button role="radio">`; roving tabindex; selection-follows-focus (ArrowRight/Left/Down/Up/Home/End)
- `category-button/` — `Button`; acepta `label?`, `skeleton?`, `selected?`, `tabIndex?`, `onClick?`; `role="radio"` + `aria-checked` (no `aria-current`); `aria-label` en el button, `aria-hidden` en el `<span>` interior; `:focus-visible` con `--color-generic-focus-border`
- `card/` — `Card`; tarjeta de tipo de gafa (step 0); se renderiza como `<button>` o `<div>` según si `onClick` está presente; hijos con `aria-hidden="true"` — VoiceOver solo lee el `aria-label` del botón
- `model/` — `ModelCard`; tarjeta de modelo (step 1); imagen con `loading='eager'`
- `type-step/` — `TypeStep`; extrae el step TYPE de `bootstrap/App.tsx`; props: `modelsTypes`, `onClick(type)`; usa `useI18n()` + `Card` + `getSVGURLByType`; importado estáticamente → mismo chunk que `App.tsx`
- `model-step/` — `ModelStep`; extrae los steps MODEL e INSPIRATIONS de `bootstrap/App.tsx`; props: `selectedStep`, `subCategories`, `selectedFlatModel`, `filteredModels`, `selectedModel`, `onCategoryClick`, `onModelClick`; acepta `ref` via `React.forwardRef` → la sección raíz recibe el ref para focus management; usa `useI18n()` + `CategoryFilterComponent` + `ModelCard`; importado estáticamente → mismo chunk que `App.tsx`
- `logo/` — `Logo`; renderiza SVG via URL
- `img/` — componente de imagen

### Steps internos (renderizados por `bootstrap/App.tsx`, implementados en los componentes)
- **Step 0 (Type)** → `<TypeStep>`; `<section aria-label>` + `<ul role="list">` + `Card`; skeleton cards (×3) con `aria-hidden` mientras datos son null
- **Step 1 (Model)** → `<ModelStep ref={mainRef}>`; `<section aria-label>` + `CategoryFilterComponent` + `<ul role="list" aria-label="Models">`; click → avanza a step 2 o abre pageUrl
- **Step 2 (Inspiration)** → `<ModelStep ref={mainRef}>`; misma sección con label distinto + container con link "skip to customization" + `<span class="sr-only">`; step dinámico (solo si API devuelve inspirations)
- **Por qué `<section>` y no `<main>`**: el widget es embebible — la página huésped ya tiene su `<main>`; `<section aria-label>` crea un landmark `region` correcto y anidable

### Navegación del stepper
`onHeaderClick(step?)` — compartido por `Header` y `SubNav`:
- Bloquea navegación hacia adelante: `step.id >= selectedStep.id → return`
- `step.id === 0` → reset completo (step 0, `selectedCategory = undefined`)
- `step.id === 1` → vuelve a step 1 conservando categoría (solo accesible desde step 2)
- `SubNav` siempre pasa `steps[0]` → el botón back siempre retrocede a Type desde cualquier step

Regla "no saltar": steps con `id > selectedStep.id` en el Header reciben `aria-disabled="true"` + clase `header-nav-item__disabled` (opacity 0.35, pointer-events none). Siempre se renderizan como `<button role="tab">` — la accesibilidad los anuncia como desactivados pero siguen siendo focusables con flechas para que el usuario pueda saber qué hay en pasos futuros.

## Products-index
- `Index.tsx` — main chunk; theme toggle + lazy `IndexContent`
- `IndexContent.tsx` — lazy chunk; product index placeholder (reemplazar con API real)
- `IndexSkeleton.tsx` — grid shimmer (CSS div-based)
- `index.scss` — ?inline CSS (container, typography, toolbar, skeleton grid)

## Configurator
- `Configurator.tsx` — main chunk; dark mode toggle + lazy `Model`
- `configurator.scss` — ?inline CSS (container, typography, skeleton del configurador)
- `model/Model.tsx` — lazy chunk; inyecta `model.scss?inline`; usa `useInitStrategy` para orquestar Fase 1 → Fase 2; muestra `ModelSkeleton` mientras Fase 1 carga, luego monta `ModelContent`
- `model/ModelSkeleton.tsx` — gafas shimmer (CSS div-based)
- `model/ModelContent.tsx` — lazy chunk; inyecta `model-content.scss?inline`; recibe `phase1Data` + `phase2Data` como props; SVG gafas + info de modelo + badge de brand + recomendaciones (fase 2)
- `model/model.scss` — ?inline CSS del skeleton (keyframe + shapes shimmer)
- `model/model-content.scss` — ?inline CSS del contenido (gafas, info modelo, badge, recomendaciones, animación `mc-fade-in`)
- `model/useInitStrategy.ts` — hook que orquesta la cadena Fase 1 → Fase 2 con flag `cancelled` para cleanup en desmontaje
- `model/strategy/mocks.ts` — `fetchPhase1Mock` (~900ms, datos de modelo) + `fetchPhase2Mock` (~600ms, recomendaciones + sessionId)
- `model/strategy/core.ts` — lógica de core compartida entre strategies
- `model/strategy/configurator-init.ts` — chunk preloadeable (nombre fijo); re-exporta `getInitQueryParams`, `RTRSkeleton`, `Caretaker`, `Originator`, `LoadingState`; consolida las deps de init en un único dynamic import
- `model/strategy/ConfiguratorInitStrategy.ts` — implementación concreta de `IInitStrategy` para el configurator; executePhase1: `import('./configurator-init')` (un solo import, resuelve de caché), Logger+Performance desde params, LoadingState+Originator+Caretaker, RTRSkeleton.init() fire-and-forget + fetchPhase1Mock()
- `model/strategy/base.ts` — `BaseStrategy` abstract class; provee `runMicrotask/runIdle/runAnimation` via `@/libs/helpers.schedule`
- `model/strategy/rtr-skeleton.ts` — `RTRSkeleton extends BaseStrategy`; descarga script (`downloadScript`), carga assets en idle (`loadRTRAssets`), inicia viewer en `requestAnimationFrame` (`initRTR`); errores propagan via `runAnimation`

### Flujo de inicialización del configurador
1. Skeleton visible de inmediato (mount)
2. Fase 1 carga en background (~900ms) — no bloquea el hilo principal → al resolver: gafas + info de modelo visibles
3. Fase 2 arranca SOLO tras Fase 1 (~600ms) — no bloquea → al resolver: recomendaciones aparecen con animación `mc-fade-in`

## Bootstrap state machine (Memento pattern)
Ambos modos tienen su propia infraestructura de estado en `bootstrap/state/`:
- `loading-state.ts` — `LoadingState`: estado que viaja entre estrategias (params, logger, performance, configureJsons, checkPoint); `clone(updates)` para versiones inmutables
- `originator.ts` — `Originator`: holder del estado actual; guarda/restaura via `Memento`
- `caretaker.ts` — `Caretaker`: almacén de `Memento[]` (historial de estados)
- `memento.ts` — `Memento`: snapshot de un `LoadingState`

`src/configurator/bootstrap/state/` — state machine del configurator
`src/style-selector/bootstrap/state/` — state machine del style-selector (mirror del configurator)

## Libs
`src/libs/helpers.ts` — utilidades de scheduling y params:
- `getInitQueryParams()` — parsea URL params + `window.configureParams` → `MergedParams`; incluye `mockMyDesigns` y `mockInspirations` como booleans (via `parseBoolParam`)
- `runAsync(fn)` — ejecuta sin bloquear via `queueMicrotask`
- `runIdle(fn, timeout?)` — via `requestIdleCallback` (fallback: `setTimeout(0)`)
- `schedule(fn, priority)` — abstracción unificada: `'microtask' | 'idle' | 'animation' | 'timeout'`

## Declarations
`src/declarations/` — tipos, enums y constantes globales:
- `enums.ts` — `SkeletonVariant`, `ResolutionType`, `Media`, `Theme`, `RTRBackground`, `FetchPriority`, `ApiType`, `CheckPointType`
- `types.ts` — `MergedParams`, `ConfigureJsons`, `GraphSettings`, `Preferences`, `ButtonProps`, etc.
- `constants.ts` — Customer IDs (`RBN_CUSTOMER_ID`, `OAK_CUSTOMER_ID`), API key map, CDN/RTR URLs, skeleton resolution helpers
- `interfaces.ts` — `ConfigureParams`, `ConfigureInitParams` (incluye `mockMyDesigns?`, `mockInspirations?`), `RtrBaseAPI`, `InitRTRPayload`, `RtrAssetsAPI`, `QuickLink`, etc.; también `IInitStrategy<P1,P2>`, `InitPhase1Data`, `InitPhase2Data` (compartidos entre configurator y style-selector)
- `cfg-configure-core.d.ts` — module declaration for `@cfg.plat/configure-core`

## Models
`src/models/` — clases de dominio:
- `logger.ts` — `Logger`: logging condicional (debug mode); silenciado en prod
- `performance.ts` — `Performance`: wraps `performance.mark/measure` para medir tiempos con `processStart/processEnd/logMeasure`
- `rtr/rtr-version.ts` — `RTRVersion`: gestión de versiones del viewer RTR (7.2.2, 4.0.0, 4.1.1); descarga del script, init con callbacks (`onRendered`, `onError`, etc.)
- `rtr/rtr-assets.ts` — `RTRAssets`: gestión de assets RTR y prefetch via quicklink

## Shared
`src/shared/` — código compartido entre todos los modos:
- `mode/detect.ts` — mode singleton (`startWithStyleSelector | configurator | index`)
- `theme/darkMode.ts` — `applyTheme(getInitialTheme())` called sync in `main.tsx` before React. `html[data-theme="light|dark"]` set by JS; CSS also has `@media prefers-color-scheme` fallback.
- `styles/theme.scss` — CSS bundle (skeleton vars light/dark, shimmer animation, `.sr-only`). Dark mode: `@media prefers-color-scheme` + `[data-theme='dark']` fuera del media query para que el toggle JS funcione independientemente del sistema
- `styles/critical.scss` — design tokens compartidos: tipografía (`--typography-*`), spacing (`--spacing-*`), radii (`--radius-*`), strokes (`--stroke-*` en px), colores semánticos, variables de iconos/logos (`--ss-logo`, `--arrow-left`, `--menu`, `--ss-loader`, etc.) por brand y tema; todos los tamaños en `rem` (base 18px); strokes en `px`
- `styles/_typography.scss` — mixins de tipografía compartidos: `typography-h3/h4/h5`, `typography-body-2xl/lg/base/sm/xs`; usan CSS vars de `critical.scss`; NO incluyen `font-weight` (varía por uso); usado por configurator y products-index SCSS — los componentes de style-selector usan `style-selector/styles/1.0/shared/_typography.scss` en su lugar
- `styles/_variables.scss` — partial de variables CSS; importado por `critical.scss`
- `assets/index.ts` — `getSVGURL(name, brand)` + `getSVGURLByType(name, brand, type)` — URLs de assets remotos en CDN Fluid
- `components/DarkModeSwitch.tsx` — toggle component; usado en todos los modos
- `components/skeleton/` — `Skeleton` component; shimmer placeholder con `variant?: SkeletonVariant`; usado por Card, SubNav, Header, Button
- `components/skeleton-loader/` — full-screen loading skeleton con brand logo + animated progress bar; activado con `?skeletonLoader=true`; inyecta `index.scss?inline` + brand override CSS; `--ss-loader` CSS var por tema; rbn override en `white-label/rbn.scss`; ARIA: root `div[role="status" aria-label aria-busy="true"]`; logo `div[aria-hidden="true"]`; progressbar indeterminado (sin `aria-valuenow`); texto y label vía `useI18n()` con fallback (devuelve `undefined` fuera del contexto style-selector → usa fallback hardcoded)

## WCAG AAA
- Root font: `112.5%` (respects browser font-size preference)
- All sizes in `rem`; borders/outlines in `px`
- `--text` light: `#4e4b58` (7.6:1 on white)
- `.sr-only` utility definida en `shared/styles/theme.scss` (CSS bundle, siempre cargado); `prefers-reduced-motion` reset
- `role=switch` on dark mode toggle, `role=alert` on errors, `role=status` on skeletons
- `focus-visible` on all interactive elements

## Key files
```
src/
  main.tsx                         — tiny entry, sync setup + mode branch
  shared/
    mode/detect.ts                 — mode singleton (startWithStyleSelector | configurator | index)
    theme/darkMode.ts              — theme detection + toggle
    styles/theme.scss              — CSS bundle (skeleton vars, shimmer); dark mode via media query + [data-theme='dark']
    styles/critical.scss           — design tokens: tipografía, spacing, radii en rem; strokes en px; colores semánticos; icon/logo vars por brand y tema
    styles/_typography.scss        — mixins de tipografía: typography-h3/h4/h5, typography-body-2xl/lg/base/sm/xs; usados en SCSS de style-selector
    styles/_variables.scss         — partial de variables CSS
    NOTE: skin-whitelabel.scss + skin-whitelabel-inverse.scss have been MOVED to style-selector/styles/1.0/wl/skin.scss + skin-inverse.scss
    assets/index.ts                — getSVGURL + getSVGURLByType (CDN Fluid asset URLs)
    components/DarkModeSwitch.tsx  — shared dark mode toggle component
    components/skeleton/           — Skeleton shimmer component (SkeletonVariant)
    components/skeleton-loader/    — full-screen loading skeleton (?skeletonLoader=true); index.tsx + index.scss?inline + white-label/rbn.scss
  white-label/
    detect.ts                      — brand singleton
    types.ts                       — Brand type + BRANDS const
    loader-configurator.ts         — injects configurator brand CSS (?inline)
    loader-index.ts                — injects products-index brand CSS (?inline)
    loader-demo.ts                 — injects demo brand CSS (?inline)
    {brand}/configurator.scss      — brand CSS for configurator mode (empty placeholders)
    {brand}/index.scss             — brand CSS for products-index mode (empty placeholders)
    NOTE: loader-wizard.ts and {brand}/wizard.scss have been DELETED — style-selector brand CSS moved to style-selector/styles/1.0/{brand}/
  style-selector/
    index.tsx                      — entry: injectSkinStyles(activeBrand, activeTokenVersion) + createRoot + DataProvider + StyleSelector
    styles/
      1.0/
        _shared.scss               — @forward breakpoints (show allowlist) + typography; brand-agnostic
        shared/
          _variables.scss          — breakpoints only
          _typography.scss         — 8 typography mixins (CSS vars)
        wl/
          _variables.scss          — wl SVG URL SCSS vars
          index.scss               — SVG URL CSS custom props; [data-skin="whitelabel"]; @layer skin; light + dark
          skin.scss                — tokens Figma Whitelabel light; @layer skin; auto-generado
          skin-inverse.scss        — tokens Figma Whitelabel dark/inverse; auto-generado
        rbn/
          _variables.scss          — rbn SVG URL SCSS vars
          index.scss               — SVG URL CSS custom props; [data-skin="ray-ban"]; @layer skin; light + dark; header-logo size override
          skin.scss                — tokens Figma Ray-Ban light; @layer skin; auto-generado
          skin-inverse.scss        — tokens Figma Ray-Ban dark/inverse; auto-generado
    bootstrap/
      index.tsx                    — Suspense wrapper; selects skeleton; renders StyleSelectorComponent (deferred lazy)
      App.tsx                      — Style (outer, null guard) + StyleWithData (inner, all hooks); gestiona step state; renderiza TypeStep / ModelStep; data-token-version={activeTokenVersion} + data-skin + data-mode (reactive)
      index.scss                   — ?inline CSS (layout, breakpoints, var --ss-bg; scroll architecture)
      token-version.ts             — singleton; reads ?tokenVersion= param; default '1.0'; export activeTokenVersion
      skin-loader.ts               — VERSION_MAP pattern; injectSkinStyles(brand, tokenVersion); @layer base,skin,mode; corrige inverse layer; inyecta wl + rbn (si rbn)
      useDarkMode.ts               — MutationObserver sobre html[data-theme]; retorna 'inverse' | undefined
      state/
        loading-state.ts           — LoadingState; clone(updates) for immutable state transitions
        originator.ts              — Originator; setState/getState/saveMemento/restore
        caretaker.ts               — Caretaker; stores Memento[]
        memento.ts                 — Memento; wraps a LoadingState snapshot
      strategy/
        index.ts                   — StyleSelectorInitStrategy; implementa IStyleSelectorInitStrategy<StyleSelectorInitData, StyleSelectorConfigurator>; loadAppData() guarda caretaker/originator/mergedParams; preloadConfiguratorData() importa Core+RTRSkeleton, corre downLoadAssets+getHeadlessProducts en paralelo → retorna StyleSelectorConfigurator
        useInitStyleSelectorStrategy.ts — hook; devuelve InitState { styleSelectorInitData, configuratorData: StyleSelectorConfigurator|undefined, phase1Error, phase2Error }; cancelled flag para cleanup; si `loadAppData()` retorna `undefined` (error swallowed), establece `phase1Error` explícitamente — evita skeleton infinito en mobile
        configurator-init.ts       — re-exporta getInitQueryParams, schedule, AsyncTask, Caretaker, Originator, LoadingState
    api/
      config.ts                    — runtime API config; BRAND_URLS per-brand URL map + API_LANGUAGE
      models.ts                    — clase Models con init(); fetchModels, fetchUiSetting; tipos: ApiModel, Model, Category, Step, Output, Translated; helpers: deduplicateByCode, rawCategoriesForType, getCategoriesByType, getModelsByType
    context/
      context.ts                   — DataContext con StyleSelectorInitData completo; useData() hook
      i18n-context.ts              — I18nContext (i18n | undefined); useI18n() hook — acceso directo a traducciones sin el Output completo
      products-context.ts          — ProductsContext con HProduct[] | undefined; useProducts() hook — solo datos UI; undefined hasta fase 2
      configurator-actions-context.ts — ConfiguratorActionsContext con ConfiguratorActions|undefined; useConfiguratorActions() hook; onModelHover→rtrSkeleton.downLoadAssets(); onModelSelect→core.render2D(); callbacks estables via useMemo+servicesRef
      data.tsx                     — DataProvider; provee ProductsContext + DataContext + I18nContext anidados; prefetch de bootstrap/App.tsx en useEffect([], []); phase2 setState omitido si resultado undefined
    lazy-imports/
      index.ts                     — deferred promise pattern; StyleSelectorComponent + completeStyleSelectorPromise(); importa desde bootstrap/App
    types.ts                       — GlassType, etc.
    components/
      skeleton/                    — StyleSelectorSkeleton; Header + SubNav + Cards con skeleton=true; useI18n(); section[aria-label aria-busy="true"] (no main)
      header/                      — Header; stepper ARIA: ol[role=tablist] + button[role=tab]; roving tabindex; ArrowLeft/Right/Home/End; logo aria-hidden; menu icon como button nativo
      sub-nav/                     — SubNav; nav[aria-label="Step navigation"]; button[aria-label="Back to {step}"] + icon[aria-hidden]; p.subnav-title; p[aria-label="Step N of M"] con texto "N/M"
      category-filter/             — CategoryFilterComponent; ul role="radiogroup"; roving tabindex; selection-follows-focus
      category-button/             — Button; aria-label en button, aria-hidden en span interior
      card/                        — Card; button o div según onClick; hijos con aria-hidden (VoiceOver lee solo aria-label)
      model/                       — ModelCard; acepta vendorId; consume useProducts() (HProduct[] lookup) + useConfiguratorActions() (callbacks de servicios); hover → onModelHover → rtrSkeleton.downLoadAssets(); click → onModelSelect → core.render2D()
      type-step/                   — TypeStep; step TYPE extraído de App.tsx; props: modelsTypes, onClick; usa useI18n()+Card+getSVGURLByType; mismo chunk que App.tsx
      model-step/                  — ModelStep (forwardRef); steps MODEL+INSPIRATIONS extraídos de App.tsx; props: selectedStep, subCategories, selectedFlatModel, filteredModels, selectedModel, onCategoryClick, onModelClick; ref en <section> para focus management; mismo chunk que App.tsx
      logo/                        — Logo SVG via URL
      img/                         — componente de imagen
    models/
      base.ts                      — BaseStrategy abstract; caretaker+originator+state; destroy()
      core.ts                      — Core extends AsyncTask; getHeadlessProducts() → HeadlessProductsData; init()+render2D() (OLA overrides); createCore() wrappea @cfg.plat/configure-core; getConfigureJsons/URLs()
      rtr-skeleton.ts              — RTRSkeleton extends BaseStrategy; downLoadAssets() (script+assets); initRTR() (token+background); init() con performance marks
      rtr-assets.ts                — RTRAssets extends AsyncTask; downloadRTRAssets(); prefetchListStartup(); prefetchByKeyName(keyName)
  products-index/
    bootstrap/
      index.tsx                    — products-index bootstrap (CSS inject + brand + React mount)
      AppIndex.tsx                 — LabelsProvider + Index
    Index.tsx                      — main chunk; theme toggle + lazy IndexContent
    IndexContent.tsx               — lazy chunk; placeholder — reemplazar con API real
    IndexSkeleton.tsx              — grid shimmer (CSS div-based)
    index.scss                     — ?inline CSS (container, typography, toolbar, skeleton grid)
  configurator/
    bootstrap/
      index.tsx                    — configurator bootstrap (CSS inject + brand + React mount)
      AppConfigurator.tsx          — Configurator (LabelsProvider currently disabled)
      state/
        loading-state.ts           — LoadingState; clone(updates) for immutable state transitions
        originator.ts              — Originator; setState/getState/saveMemento/restore
        caretaker.ts               — Caretaker; stores Memento[]
        memento.ts                 — Memento; wraps a LoadingState snapshot
    Configurator.tsx               — main chunk, theme toggle + lazy Model
    configurator.scss              — ?inline CSS (container, typography, skeleton)
    model/
      Model.tsx                    — lazy chunk; useInitStrategy hook; skeleton → ModelContent
      ModelSkeleton.tsx            — gafas shimmer (CSS div-based)
      ModelContent.tsx             — lazy chunk; props: phase1Data + phase2Data; SVG gafas + info + badge + recomendaciones
      model.scss                   — ?inline CSS del skeleton (keyframe + shapes)
      model-content.scss           — ?inline CSS del contenido (gafas, info, badge, recomendaciones, mc-fade-in)
      useInitStrategy.ts           — hook; Fase 1 → Fase 2 chain; cancelled flag para cleanup
      strategy/
        mocks.ts                   — fetchPhase1Mock (~900ms) + fetchPhase2Mock (~600ms)
        core.ts                    — lógica de core compartida entre strategies
        configurator-init.ts       — chunk preloadeable (nombre fijo); re-exporta deps de executePhase1 (9.1 KB / 3.4 KB gz)
        ConfiguratorInitStrategy.ts — implementación para configurator; executePhase1: import('./configurator-init'), RTRSkeleton.init() fire-and-forget + fetchPhase1Mock()
        base.ts                    — BaseStrategy abstract; runMicrotask/runIdle/runAnimation
        rtr-skeleton.ts            — RTRSkeleton extends BaseStrategy; downloadScript + loadRTRAssets (idle) + initRTR (rAF)
  libs/helpers.ts                  — schedule, runAsync, runIdle, getInitQueryParams
  labels/                          — i18n service (see above)
  declarations/
    enums.ts                       — SkeletonVariant, RTRBackground, CheckPointType, etc.
    types.ts                       — MergedParams, ConfigureJsons, ButtonProps, etc.
    constants.ts                   — customer IDs, API keys, CDN/RTR URLs
    interfaces.ts                  — ConfigureParams, RtrBaseAPI, InitRTRPayload, IInitStrategy<P1,P2>, InitPhase1Data, InitPhase2Data, etc.
    cfg-configure-core.d.ts        — module declaration for @cfg.plat/configure-core
  models/
    logger.ts                      — Logger (debug-mode conditional logging)
    performance.ts                 — Performance (mark/measure wrapper)
    rtr/rtr-version.ts             — RTRVersion; script download + init + version management
    rtr/rtr-assets.ts              — RTRAssets; prefetch management via quicklink
  stubs/
    jsonp-node.js                  — stub Node-only path de jsonp-client (elimina warnings de build)
public/
  index.html                       — GitHub Pages shell — este es el que Vite copia a dist/
                                     contiene: inline theme script, preconnects a dominios RTR/CDN,
                                     preloads de scripts externos (RTR viewer, quicklink, prefetch),
                                     modulepreload de bootstrap-configurator + configurator-init,
                                     window.configureParams de ejemplo, y <link> CSS bundle
                                     IMPORTANTE: el index.html raíz (/) es solo para dev server —
                                     todo lo que debe aparecer en dist/ debe estar en public/index.html
  imgs/background/
    light/                         — 6 imágenes PNG de fondo para modo startWithStyleSelector (light)
                                     Mobile / Tablet Portrait / Tablet Landscape /
                                     Desktop Biz xs / Desktop Biz / Desktop
    dark/                          — mismas 6 variantes para dark mode
  svg/
    wl/dark/logo.svg              — logo EssilorLuxottica oscuro (141×16px) — light mode, brands no-rbn
    wl/dark/arrow-left.svg        — flecha izquierda oscura — light mode (SubNav back button)
    wl/dark/category.svg          — icono categoría oscuro — light mode
    wl/dark/loader.svg            — icono loader oscuro — light mode (skeleton-loader)
    wl/dark/menu.svg              — icono menu oscuro — light mode (Header)
    wl/light/logo.svg             — logo EssilorLuxottica claro (141×16px) — dark mode, brands no-rbn
    wl/light/arrow-left.svg       — flecha izquierda clara — dark mode
    wl/light/category.svg         — icono categoría claro — dark mode
    wl/light/loader.svg           — icono loader claro — dark mode
    wl/light/menu.svg             — icono menu claro — dark mode
    rbn/dark/logo.svg             — logo Ray-Ban oscuro (112×49px) — light mode, brand rbn
    rbn/dark/loader.svg           — icono loader oscuro rbn — light mode
    rbn/dark/menu.svg             — icono menu oscuro rbn — light mode
    rbn/light/logo.svg            — logo Ray-Ban claro (112×49px) — dark mode, brand rbn
    rbn/light/arrow-left.svg      — flecha izquierda clara rbn — dark mode
    rbn/light/loader.svg          — icono loader claro rbn — dark mode
    rbn/light/menu.svg            — icono menu claro rbn — dark mode
scripts/
  bundle-size.mjs                  — snapshot de tamaños por modo, appends a bundle-sizes.log
  audit.mjs                        — post-build auditor: presencia de chunks, umbrales de tamaño,
                                     análisis estático de bloqueos de main thread
```

## Pending
- `BRAND_URLS` in `style-selector/api/config.ts`: `sgh`, `bliz`, `cdm` still use placeholder rbn URL — update when real URLs available
- `console.log({ brand })` left in `style-selector/api/models.ts` `fetchModels` — remove before production
- `ModelCard` hover/click handlers log the found `HeadlessProduct` via `console.log` — replace with actual configurator navigation/prefetch logic when ready
- Labels API endpoint not live yet — defaults always used until implemented
- Delete `main` branch on both repos after changing default branch in GitHub Settings
- `configurator/bootstrap/AppConfigurator.tsx`: re-enable `LabelsProvider` when configurator i18n is needed
- White-label CSS for configurator: `white-label/{brand}/configurator.scss` are empty placeholders
- White-label CSS for products-index: `white-label/{brand}/index.scss` are empty placeholders
- `products-index/IndexContent.tsx`: replace placeholder with real product index API when available
- `configurator/model/ModelContent.tsx`: replace placeholder SVG + mock data with real product assets/APIs when available
- `configurator/model/strategy/mocks.ts`: replace mocks with real API calls when endpoints are ready
- `declarations/interfaces.ts`: some interfaces reference `@fluid.inc/yr-configure-wrapper/core` (external dep not yet installed)
