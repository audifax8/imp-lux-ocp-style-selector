# imp-lux-ocp-style-selector — Project Context

## What it is
Self-contained React 19 widget (embeddable). Three initialization modes:
- **configurator** (default) — glasses configurator experience with RTR (Real-Time Rendering)
- **style-selector** (wizard) — picks glasses type → model → opens product page
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
- `cssCodeSplit: false` — all non-`?inline` CSS goes to the single CSS bundle
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

Valid modes: `'wizard'` | `'configurator'` | `'index'` | `'demo'`

**Isolation rule:** each mode's chunks never load in the other modes.
All mode-specific CSS (including white-label CSS) is `?inline` — injected by the bootstrap before React mounts.

## Entry flow
`main.tsx` (sync setup only, no React):
1. Applies theme (`localStorage` → system → default light)
2. Detects active mode
3. Sets `role=region` + `aria-label` on container
4. Branches lazy import:
   - `import('@/style-selector/bootstrap')` → wizard
   - `import('@/products-index/bootstrap')` → index
   - `import('@/configurator/bootstrap')` → configurator (default)

**Style-selector bootstrap** (`style-selector/bootstrap/index.tsx`):
- Injects `style-selector/wizard.scss?inline` (container + typography + skeleton + wizard styles)
- Injects active white-label CSS via `white-label/loader-wizard`
- `createRoot` + `<AppStyleSelector />` (LabelsProvider + Wizard)

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
- `src/white-label/{brand}/wizard.scss` — brand overrides for style-selector
- `src/white-label/{brand}/configurator.scss` — brand overrides for configurator (placeholders)
- `src/white-label/{brand}/index.scss` — brand overrides for products-index (placeholders)

Loaders (`src/white-label/`):
- `loader-wizard.ts` — imports all `{brand}/wizard.scss?inline`
- `loader-configurator.ts` — imports all `{brand}/configurator.scss?inline`
- `loader-index.ts` — imports all `{brand}/index.scss?inline`
- `detect.ts` — brand singleton
- `types.ts` — `Brand` type + `BRANDS` const

## CSS architecture
```
imp-lux-ocp-style-selector.css               ← shared/styles/theme.scss only (CSS vars, dark mode, reset, sr-only)
                                                loaded via <link>, always — no mode-specific content

style-selector/bootstrap/index.tsx           ← style-selector/wizard.scss?inline + white-label/loader-wizard
configurator/bootstrap/index.tsx             ← configurator/configurator.scss?inline + white-label/loader-configurator
products-index/bootstrap/index.tsx           ← products-index/index.scss?inline + white-label/loader-index
style-selector/WizardStep1.tsx               ← WizardStep1.scss?inline (on-demand, when step loads)
style-selector/WizardStep2.tsx               ← WizardStep2.scss?inline (on-demand, when step loads)
configurator/model/Model.tsx                 ← model/model.scss?inline (skeleton de gafas)
configurator/model/ModelContent.tsx          ← model/model-content.scss?inline (gafas reales, SOLO tras resolver skeleton)
```

## API config (no .env — runtime only)
`src/style-selector/api/config.ts` — priority for each value:
1. `window.__IMP_LUX_API_URL__` / `window.__IMP_LUX_API_LANG__`
2. `?apiUrl=` / `?lang=` URL params
3. Hardcoded defaults (`https://www.ray-ban.com` / `en`)

Models endpoint: `GET {API_BASE_URL}/wcs/resources/store/{storeId}/remix/models?language={lang}`

## Labels service
`src/labels/` — i18n hook-based service.
- `types.ts` — `Labels` interface + `interpolate(template, vars)` helper
- `defaults.ts` — English fallback
- `service.ts` — `fetchLabels()` — inferred endpoint: `.../remix/labels?language={lang}` (**API not ready yet**)
- `LabelsProvider.tsx` — Context provider; fetches on mount, uses defaults on error
- `useLabels.ts` — `useLabels()` hook

Used in every component. While API loads or on error, `DEFAULT_LABELS` are shown silently.
Labels has sections for: `widget`, `configurator`, `darkMode`, `step1`, `step2`.

## Style-selector (2-step wizard)
- `Wizard.tsx` — step orchestrator + theme toggle
- `WizardStep1` — lazy chunk; glass type selection (sunglasses / eyeglasses / kids-sunglasses)
- `WizardStep2` — lazy chunk; fetches models, shows category filters + model grid
- `wizard.scss` — ?inline CSS (container, typography, nav, toggle, skeletons)

Step SCSS loaded via `?inline` and injected at module level when chunk loads.

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
- `model/strategy/types.ts` — interfaces `IInitStrategy<P1,P2>`, `InitPhase1Data`, `InitPhase2Data`
- `model/strategy/mocks.ts` — `fetchPhase1Mock` (~900ms, datos de modelo) + `fetchPhase2Mock` (~600ms, recomendaciones + sessionId)
- `model/strategy/configurator-init.ts` — chunk preloadeable (nombre fijo); re-exporta `getInitQueryParams`, `RTRSkeleton`, `Caretaker`, `Originator`, `LoadingState`; consolida las deps de init en un único dynamic import
- `model/strategy/ConfiguratorInitStrategy.ts` — implementación concreta de `IInitStrategy`; executePhase1: `import('./configurator-init')` (un solo import, resuelve de caché), Logger+Performance desde params, LoadingState+Originator+Caretaker, RTRSkeleton.init() fire-and-forget + fetchPhase1Mock()
- `model/strategy/base.ts` — `BaseStrategy` abstract class; provee `runMicrotask/runIdle/runAnimation` via `@/libs/helpers.schedule`
- `model/strategy/rtr-skeleton.ts` — `RTRSkeleton extends BaseStrategy`; descarga script (`downloadScript`), carga assets en idle (`loadRTRAssets`), inicia viewer en `requestAnimationFrame` (`initRTR`); errores propagan via `runAnimation`

### Flujo de inicialización del configurador
1. Skeleton visible de inmediato (mount)
2. Fase 1 carga en background (~900ms) — no bloquea el hilo principal → al resolver: gafas + info de modelo visibles
3. Fase 2 arranca SOLO tras Fase 1 (~600ms) — no bloquea → al resolver: recomendaciones aparecen con animación `mc-fade-in`

## Bootstrap state machine (Memento pattern)
`src/configurator/bootstrap/state/` — infraestructura de estado para las estrategias de inicialización:
- `loading-state.ts` — `LoadingState`: estado que viaja entre estrategias (params, logger, performance, configureJsons, checkPoint); `clone(updates)` para versiones inmutables
- `originator.ts` — `Originator`: holder del estado actual; guarda/restaura via `Memento`
- `caretaker.ts` — `Caretaker`: almacén de `Memento[]` (historial de estados)
- `memento.ts` — `Memento`: snapshot de un `LoadingState`

## Libs
`src/libs/helpers.ts` — utilidades de scheduling y params:
- `getInitQueryParams()` — parsea URL params + `window.configureParams` → `MergedParams`
- `runAsync(fn)` — ejecuta sin bloquear via `queueMicrotask`
- `runIdle(fn, timeout?)` — via `requestIdleCallback` (fallback: `setTimeout(0)`)
- `schedule(fn, priority)` — abstracción unificada: `'microtask' | 'idle' | 'animation' | 'timeout'`

## Declarations
`src/declarations/` — tipos, enums y constantes globales:
- `enums.ts` — `SkeletonVariant`, `ResolutionType`, `Media`, `Theme`, `RTRBackground`, `FetchPriority`, `ApiType`, `CheckPointType`
- `types.ts` — `MergedParams`, `ConfigureJsons`, `GraphSettings`, `Preferences`, `ButtonProps`, etc.
- `constants.ts` — Customer IDs (`RBN_CUSTOMER_ID`, `OAK_CUSTOMER_ID`), API key map, CDN/RTR URLs, skeleton resolution helpers
- `interfaces.ts` — `ConfigureParams`, `ConfigureInitParams`, `RtrBaseAPI`, `InitRTRPayload`, `RtrAssetsAPI`, `QuickLink`, etc.
- `cfg-configure-core.d.ts` — module declaration for `@cfg.plat/configure-core`

## Models
`src/models/` — clases de dominio:
- `logger.ts` — `Logger`: logging condicional (debug mode); silenciado en prod
- `performance.ts` — `Performance`: wraps `performance.mark/measure` para medir tiempos con `processStart/processEnd/logMeasure`
- `rtr/rtr-version.ts` — `RTRVersion`: gestión de versiones del viewer RTR (7.2.2, 4.0.0, 4.1.1); descarga del script, init con callbacks (`onRendered`, `onError`, etc.)
- `rtr/rtr-assets.ts` — `RTRAssets`: gestión de assets RTR y prefetch via quicklink

## Shared
`src/shared/` — código compartido entre todos los modos:
- `mode/detect.ts` — mode singleton (`wizard | configurator | index`)
- `theme/darkMode.ts` — `applyTheme(getInitialTheme())` called sync in `main.tsx` before React. `html[data-theme="light|dark"]` set by JS; CSS also has `@media prefers-color-scheme` fallback.
- `styles/theme.scss` — CSS bundle (vars, dark mode, reset, sr-only, reduced-motion)
- `components/DarkModeSwitch.tsx` — toggle component; usado en todos los modos
- `components/SharedSkeleton.tsx` — skeleton alternativo compartido entre configurator y style-selector; activado con `?skeletonLoader=true`; chunk lazy propio con preload inmediato a nivel de módulo cuando el param está activo (`sharedSkeletonImport = import(...)` antes de que React monte); esto garantiza que `lazy()` resuelve síncronamente y `<SharedSkeleton />` puede usarse sin `<Suspense>` wrapper propio; cuando el param no está presente el chunk no se descarga y los skeletons originales se usan sin coste de red

## WCAG AAA
- Root font: `112.5%` (respects browser font-size preference)
- All sizes in `rem`; borders/outlines in `px`
- `--text` light: `#4e4b58` (7.6:1 on white)
- `.sr-only` utility, `prefers-reduced-motion` reset
- `role=switch` on dark mode toggle, `role=alert` on errors, `role=status` on skeletons
- `focus-visible` on all interactive elements

## Key files
```
src/
  main.tsx                         — tiny entry, sync setup + mode branch
  shared/
    mode/detect.ts                 — mode singleton (wizard | configurator | index)
    theme/darkMode.ts              — theme detection + toggle
    styles/theme.scss              — CSS bundle (vars, dark mode, reset, sr-only)
    components/DarkModeSwitch.tsx  — shared dark mode toggle component
    components/SharedSkeleton.tsx  — shared skeleton (lazy chunk); active via ?skeleton=true
    components/SharedSkeleton.scss — ?inline CSS for SharedSkeleton
  white-label/
    detect.ts                      — brand singleton
    types.ts                       — Brand type + BRANDS const
    loader-wizard.ts               — injects style-selector brand CSS (?inline)
    loader-configurator.ts         — injects configurator brand CSS (?inline)
    loader-index.ts                — injects products-index brand CSS (?inline)
    loader-demo.ts                 — injects demo brand CSS (?inline, reutiliza wizard.scss de cada brand)
    {brand}/wizard.scss            — brand CSS for style-selector mode
    {brand}/configurator.scss      — brand CSS for configurator mode (placeholders)
    {brand}/index.scss             — brand CSS for products-index mode (placeholders)
  style-selector/
    bootstrap/
      index.tsx                    — style-selector bootstrap (CSS inject + brand + React mount)
      AppStyleSelector.tsx         — LabelsProvider + Wizard
    api/
      config.ts                    — runtime API config (no .env)
      models.ts                    — fetchModels, getCategoriesByType, getModelsByType
    types.ts                       — GlassType, etc.
    Wizard.tsx                     — step orchestrator, theme toggle
    wizard.scss                    — ?inline CSS (container, typography, nav, toggle, skeletons)
    WizardStep1.tsx                — lazy chunk
    WizardStep2.tsx                — lazy chunk
    WizardStep1.scss               — on-demand CSS (?inline)
    WizardStep2.scss               — on-demand CSS (?inline)
    WizardStep1Skeleton.tsx        — skeleton step 1
    StyleSelectorSkeleton.tsx        — skeleton step 2
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
        types.ts                   — IInitStrategy<P1,P2>, InitPhase1Data, InitPhase2Data
        mocks.ts                   — fetchPhase1Mock (~900ms) + fetchPhase2Mock (~600ms)
        configurator-init.ts       — chunk preloadeable (nombre fijo); re-exporta deps de executePhase1 (9.1 KB / 3.4 KB gz)
        ConfiguratorInitStrategy.ts — executePhase1: import('./configurator-init') (un solo import de caché), RTRSkeleton.init() fire-and-forget + fetchPhase1Mock()
        base.ts                    — BaseStrategy abstract; runMicrotask/runIdle/runAnimation
        rtr-skeleton.ts            — RTRSkeleton extends BaseStrategy; downloadScript + loadRTRAssets (idle) + initRTR (rAF)
  libs/helpers.ts                  — schedule, runAsync, runIdle, getInitQueryParams
  labels/                          — i18n service (see above)
  declarations/
    enums.ts                       — SkeletonVariant, RTRBackground, CheckPointType, etc.
    types.ts                       — MergedParams, ConfigureJsons, ButtonProps, etc.
    constants.ts                   — customer IDs, API keys, CDN/RTR URLs
    interfaces.ts                  — ConfigureParams, RtrBaseAPI, InitRTRPayload, etc.
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
scripts/
  bundle-size.mjs                  — snapshot de tamaños por modo, appends a bundle-sizes.log
  audit.mjs                        — post-build auditor: presencia de chunks, umbrales de tamaño,
                                     análisis estático de bloqueos de main thread
```

## Pending
- `BRAND_STORE_IDS` in `style-selector/api/config.ts`: all set to `'10151'` (only rbn known) — update when others available
- Labels API endpoint not live yet — defaults always used until implemented
- Delete `main` branch on both repos after changing default branch in GitHub Settings
- `configurator/bootstrap/AppConfigurator.tsx`: re-enable `LabelsProvider` when configurator i18n is needed
- White-label CSS for configurator: `white-label/{brand}/configurator.scss` are empty placeholders
- White-label CSS for products-index: `white-label/{brand}/index.scss` are empty placeholders
- `products-index/IndexContent.tsx`: replace placeholder with real product index API when available
- `configurator/model/ModelContent.tsx`: replace placeholder SVG + mock data with real product assets/APIs when available
- `configurator/model/strategy/mocks.ts`: replace mocks with real API calls when endpoints are ready
- `declarations/interfaces.ts`: some interfaces reference `@fluid.inc/yr-configure-wrapper/core` (external dep not yet installed)
