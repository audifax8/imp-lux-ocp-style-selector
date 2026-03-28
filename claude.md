# imp-lux-ocp-style-selector — Project Context

## What it is
Self-contained React 19 widget (embeddable). Two initialization modes:
- **configurator** (default) — glasses configurator experience with RTR (Real-Time Rendering)
- **wizard** — picks glasses type → model → opens product page

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
  - `chunks/bootstrap-wizard.js` — bootstrap del modo wizard
- **`manualChunks`**: `react-dom` en su propio chunk `chunks/react-dom-[hash].js` — separado para no contaminar chunks de app
- `base: './'` — relative paths for GitHub Pages subdirectory
- `cssCodeSplit: false` — all non-`?inline` CSS goes to the single CSS bundle
- `resolve.alias: { '@': src/ }` — `@/` path alias for all imports

## Bundle sizes (baseline RBN-5144)
Medido con `npm run size` (`scripts/bundle-size.mjs`, appends a `bundle-sizes.log`):
- **Configurator total** (shared + configurator chunks): ~211 KB raw / ~69 KB gzip
- **Wizard total** (shared + wizard chunks): ~210 KB raw / ~67 KB gzip
- De eso, ~185 KB raw / ~57 KB gzip es `react-dom` (no controlable)
- Código de app propio: ~26 KB raw / ~12 KB gzip

`npm run build && npm run size -- --label "descripción"` tras cada feature para rastrear crecimiento.

## TypeScript config (`tsconfig.app.json`)
- `paths: { "@/*": ["./src/*"] }` — mirrors Vite alias so tsc resolves `@/` imports
- `erasableSyntaxOnly: false` — allows non-erasable enums (needed by `src/declarations/enums.ts`)
- All cross-folder imports use `@/` — no relative `../` imports across directories

## Module alias convention
All imports that cross a directory boundary use `@/` instead of relative `../` paths:
```ts
import { activeBrand } from '@/brands/detect'     // ✓
import { activeBrand } from '../../brands/detect'  // ✗
```
Same-folder imports (`./`) remain relative.

## Mode system
Mode detection singleton: `src/mode/detect.ts`

Detection priority:
1. `window.__IMP_LUX_MODE__`
2. `?mode=` URL param
3. `'configurator'` (default)

**Isolation rule:** wizard chunks never load in configurator mode and vice versa.
All mode-specific CSS (including brand CSS) is `?inline` — injected by the bootstrap before React mounts.

## Entry flow
`main.tsx` (sync setup only, no React):
1. Applies theme (`localStorage` → system → default light)
2. Detects active mode
3. Sets `role=region` + `aria-label` on container
4. Branches lazy import:
   - `import('./bootstrap')` → wizard
   - `import('./bootstrap-configurator')` → configurator (default)

**Wizard bootstrap** (`bootstrap.tsx`):
- Injects `wizard/wizard.scss?inline` (container + typography + skeleton + wizard styles)
- Injects active brand CSS via `brands/loader-wizard`
- `createRoot` + `<App />` (LabelsProvider + Wizard)

**Configurator bootstrap** (`bootstrap-configurator.tsx`):
- Injects `configurator/configurator.scss?inline` (container + typography + skeleton + configurator styles)
- Injects active brand CSS via `brands/loader-configurator`
- `createRoot` + `<AppConfigurator />` (Configurator — LabelsProvider currently disabled)

## Brand system
Brands: `rbn` (default), `oak`, `sgh`, `bliz`, `cdm`

Detection priority:
1. `window.__IMP_LUX_BRAND__`
2. `?brand=` URL param
3. `'rbn'`

Each brand has separate CSS per mode, loaded via `?inline`:
- `src/brands/{brand}/wizard.scss` — brand overrides for wizard
- `src/brands/{brand}/configurator.scss` — brand overrides for configurator

Loaders:
- `brands/loader-wizard.ts` — imports all `{brand}/wizard.scss?inline`
- `brands/loader-configurator.ts` — imports all `{brand}/configurator.scss?inline`

## CSS architecture
```
imp-lux-ocp-style-selector.css        ← theme.scss only (CSS vars, dark mode, reset, sr-only)
                                          loaded via <link>, always — no mode-specific content

bootstrap.tsx (wizard)                ← wizard/wizard.scss?inline + brands/loader-wizard
bootstrap-configurator.tsx            ← configurator/configurator.scss?inline + brands/loader-configurator
WizardStep1.tsx                       ← WizardStep1.scss?inline (on-demand, when step loads)
WizardStep2.tsx                       ← WizardStep2.scss?inline (on-demand, when step loads)
configurator/model/Model.tsx          ← model/model.scss?inline (skeleton de gafas)
configurator/model/ModelContent.tsx   ← model/model-content.scss?inline (gafas reales, SOLO tras resolver skeleton)
```

## API config (no .env — runtime only)
`src/api/config.ts` — priority for each value:
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

## Wizard (2-step)
- `Wizard.tsx` — step orchestrator + theme toggle (no CSS import — injected by bootstrap)
- `WizardStep1` — lazy chunk; glass type selection (sunglasses / eyeglasses / kids-sunglasses)
- `WizardStep2` — lazy chunk; fetches models, shows category filters + model grid

Step SCSS loaded via `?inline` and injected at module level when chunk loads.

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
- `model/strategy/ConfiguratorInitStrategy.ts` — implementación concreta de `IInitStrategy`; en `executePhase1` instancia `Logger`/`Performance` desde params, construye `LoadState`+`Originator`+`Caretaker`, dispara `RTRTest.init()` en paralelo (fire-and-forget) y devuelve `fetchPhase1Mock()`
- `model/strategy/base.ts` — `BaseStrategy` abstract class; provee `runMicrotask/runIdle/runAnimation` via `@/libs/helpers.schedule`
- `model/strategy/rtr-test.ts` — `RTRTest extends BaseStrategy`; descarga script (`downloadScript`), carga assets en microtask (`loadRTRAssets`, prefetch), inicia viewer en `requestAnimationFrame` (`initRTR`); errores de init propagan correctamente via `runAnimation`

### Flujo de inicialización del configurador
1. Skeleton visible de inmediato (mount)
2. Fase 1 carga en background (~900ms) — no bloquea el hilo principal → al resolver: gafas + info de modelo visibles
3. Fase 2 arranca SOLO tras Fase 1 (~600ms) — no bloquea → al resolver: recomendaciones aparecen con animación `mc-fade-in`

## Bootstrap state machine (Memento pattern)
`src/bootstrap/` — infraestructura de estado para las estrategias de inicialización:
- `index.ts` — `loadImplementation()`: construye `LoadState` + `Originator` + `Caretaker`, parsea params, guarda el primer memento
- `state/load-state.ts` — `LoadState`: estado que viaja entre estrategias (params, logger, performance, configureJsons, checkPoint); `clone(updates)` para versiones inmutables
- `state/originator.ts` — `Originator`: holder del estado actual; guarda/restaura via `Memento`
- `state/caretaker.ts` — `Caretaker`: almacén de `Memento[]` (historial de estados)
- `state/memento.ts` — `Memento`: snapshot de un `LoadState`

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

## Dark mode
`src/theme/darkMode.ts` — `applyTheme(getInitialTheme())` called sync in `main.tsx` before React.
`html[data-theme="light|dark"]` — set by JS; CSS also has `@media prefers-color-scheme` fallback.
Both wizard and configurator include a `DarkModeSwitch` component.

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
  main.tsx                    — tiny entry, sync setup + mode branch
  mode/detect.ts              — mode singleton (wizard | configurator)
  bootstrap.tsx               — wizard bootstrap (CSS inject + brand + React mount)
  bootstrap-configurator.tsx  — configurator bootstrap (CSS inject + brand + React mount)
  App.tsx                     — LabelsProvider + Wizard (wizard mode)
  AppConfigurator.tsx         — Configurator (configurator mode; LabelsProvider disabled temporalmente)
  brands/detect.ts            — brand singleton
  brands/loader-wizard.ts     — injects wizard brand CSS (?inline)
  brands/loader-configurator.ts — injects configurator brand CSS (?inline)
  brands/{brand}/wizard.scss  — brand CSS for wizard mode
  brands/{brand}/configurator.scss — brand CSS for configurator mode
  api/config.ts               — runtime API config (no .env)
  api/models.ts               — fetchModels, getCategoriesByType, getModelsByType
  bootstrap/
    index.ts                  — loadImplementation(); builds state + originator + caretaker
    state/load-state.ts       — LoadState; clone(updates) for immutable state transitions
    state/originator.ts       — Originator; setState/getState/saveMemento/restore
    state/caretaker.ts        — Caretaker; stores Memento[]
    state/memento.ts          — Memento; wraps a LoadState snapshot
  libs/helpers.ts             — schedule, runAsync, runIdle, getInitQueryParams
  declarations/
    enums.ts                  — SkeletonVariant, RTRBackground, CheckPointType, etc.
    types.ts                  — MergedParams, ConfigureJsons, ButtonProps, etc.
    constants.ts              — customer IDs, API keys, CDN/RTR URLs
    interfaces.ts             — ConfigureParams, RtrBaseAPI, InitRTRPayload, etc.
    cfg-configure-core.d.ts   — module declaration for @cfg.plat/configure-core
  models/
    logger.ts                 — Logger (debug-mode conditional logging)
    performance.ts            — Performance (mark/measure wrapper)
    rtr/rtr-version.ts        — RTRVersion; script download + init + version management
    rtr/rtr-assets.ts         — RTRAssets; prefetch management via quicklink
  labels/                     — i18n service (see above)
  theme/darkMode.ts           — theme detection + toggle
  styles/theme.scss           — CSS bundle (vars, dark mode, reset, sr-only, reduced-motion)
  wizard/
    Wizard.tsx                — step orchestrator, theme toggle
    wizard.scss               — ?inline CSS (container, typography, nav, toggle, skeletons)
    WizardStep1.tsx           — lazy chunk
    WizardStep2.tsx           — lazy chunk
    WizardStep1.scss          — on-demand CSS (?inline)
    WizardStep2.scss          — on-demand CSS (?inline)
  configurator/
    Configurator.tsx          — main chunk, theme toggle + lazy Model
    configurator.scss         — ?inline CSS (container, typography, skeleton)
    model/
      Model.tsx               — lazy chunk; useInitStrategy hook; skeleton → ModelContent
      ModelSkeleton.tsx       — gafas shimmer (CSS div-based)
      ModelContent.tsx        — lazy chunk; props: phase1Data + phase2Data; SVG gafas + info + badge + recomendaciones
      model.scss              — ?inline CSS del skeleton (keyframe + shapes)
      model-content.scss      — ?inline CSS del contenido (gafas, info, badge, recomendaciones, mc-fade-in)
      useInitStrategy.ts      — hook; Fase 1 → Fase 2 chain; cancelled flag para cleanup
      strategy/
        types.ts              — IInitStrategy<P1,P2>, InitPhase1Data, InitPhase2Data
        mocks.ts              — fetchPhase1Mock (~900ms) + fetchPhase2Mock (~600ms)
        ConfiguratorInitStrategy.ts — executePhase1: Logger+Performance desde params, LoadState+Originator+Caretaker, RTRTest.init() fire-and-forget + fetchPhase1Mock()
        base.ts               — BaseStrategy abstract; runMicrotask/runIdle/runAnimation
        rtr-test.ts           — RTRTest extends BaseStrategy; downloadScript + loadRTRAssets (microtask) + initRTR (rAF); errores propagan via runAnimation
public/
  index.html                  — GitHub Pages shell (inline theme script + preloads)
                                 no static skeleton — each mode renders its own via React
```

## Pending
- `BRAND_STORE_IDS` in `api/config.ts`: all set to `'10151'` (only rbn known) — update when others available
- Labels API endpoint not live yet — defaults always used until implemented
- Delete `main` branch on both repos after changing default branch in GitHub Settings
- `AppConfigurator.tsx`: re-enable `LabelsProvider` when configurator i18n is needed
- Brand CSS for configurator: `brands/{brand}/configurator.scss` are empty placeholders
- `model/ModelContent.tsx`: replace placeholder SVG + mock data with real product assets/APIs when available
- `model/strategy/mocks.ts`: replace mocks with real API calls when endpoints are ready
- `bootstrap/index.ts`: `loadImplementation()` wired but strategy init is commented out — connect when RTRTest/StrategyContext are ready
- `declarations/interfaces.ts`: some interfaces reference `@fluid.inc/yr-configure-wrapper/core` (external dep not yet installed)

