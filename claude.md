# imp-lux-ocp-style-selector — Project Context

## What it is
Self-contained React 19 widget (embeddable). Two initialization modes:
- **configurator** (default) — glasses configurator experience
- **wizard** — picks glasses type → model → opens product page

## Repos
- `origin` → `git@github.com:audifax8/imp-lux-ocp-style-selector.git`
- `configid` → `git@github.com:ConfigureID-Imp/imp-lux-ocp-style-selector.git`
- Branch: `develop` (default; `main` pending deletion after GitHub default-branch change)

## Deploy
GitHub Actions → `.github/workflows/deploy.yml` → builds `dist/` → GitHub Pages.
- audifax8: `https://audifax8.github.io/imp-lux-ocp-style-selector/`
- ConfigureID-Imp: `https://configureid-imp.github.io/imp-lux-ocp-style-selector/`

## Build (Vite 8 / Rolldown)
- Format: `es` (ES modules, real code splitting)
- Entry: `imp-lux-ocp-style-selector.js` (tiny, ~2.6 KB)
- CSS bundle: `imp-lux-ocp-style-selector.css` — only `theme.scss` (~1.6 KB, no mode-specific CSS)
- Chunks: `chunks/[name]-[hash].js`
- `base: './'` — relative paths for GitHub Pages subdirectory
- `cssCodeSplit: false` — all non-`?inline` CSS goes to the single CSS bundle

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
- `createRoot` + `<AppConfigurator />` (LabelsProvider + Configurator)

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
imp-lux-ocp-style-selector.css   ← theme.scss only (CSS vars, dark mode, reset, sr-only)
                                     loaded via <link>, always — no mode-specific content

bootstrap.tsx (wizard)           ← wizard/wizard.scss?inline + brands/loader-wizard
bootstrap-configurator.tsx       ← configurator/configurator.scss?inline + brands/loader-configurator
WizardStep1.tsx                  ← WizardStep1.scss?inline (on-demand, when step loads)
WizardStep2.tsx                  ← WizardStep2.scss?inline (on-demand, when step loads)
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
- `Configurator.tsx` — main chunk; dark mode toggle + lazy page (placeholder — work in progress)
- `ConfiguratorSkeleton.tsx` — skeleton shown via Suspense while pages load
- `configurator.scss` — critical CSS for configurator (container, typography, skeleton)

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
  AppConfigurator.tsx         — LabelsProvider + Configurator (configurator mode)
  brands/detect.ts            — brand singleton
  brands/loader-wizard.ts     — injects wizard brand CSS (?inline)
  brands/loader-configurator.ts — injects configurator brand CSS (?inline)
  brands/{brand}/wizard.scss  — brand CSS for wizard mode
  brands/{brand}/configurator.scss — brand CSS for configurator mode
  api/config.ts               — runtime API config (no .env)
  api/models.ts               — fetchModels, getCategoriesByType, getModelsByType
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
    Configurator.tsx          — main chunk, theme toggle + lazy page
    ConfiguratorSkeleton.tsx  — skeleton component
    configurator.scss         — ?inline CSS (container, typography, skeleton)
public/
  index.html                  — GitHub Pages shell (inline theme script + preloads)
                                 no static skeleton — each mode renders its own via React
```

## Pending
- `BRAND_STORE_IDS` in `api/config.ts`: all set to `'10151'` (only rbn known) — update when others available
- Labels API endpoint not live yet — defaults always used until implemented
- Delete `main` branch on both repos after changing default branch in GitHub Settings
- Configurator pages: `Configurator.tsx` has a placeholder — implement real pages
- Brand CSS for configurator: `brands/{brand}/configurator.scss` are empty placeholders

