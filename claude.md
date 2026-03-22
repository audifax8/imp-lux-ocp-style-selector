# imp-lux-ocp-style-selector — Project Context

## What it is
Self-contained React 19 widget (embeddable). Lets users pick glasses type → model → opens product page.

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
- Entry: `imp-lux-ocp-style-selector.js` (tiny, ~4 KB)
- CSS: `imp-lux-ocp-style-selector.css` (no split)
- Chunks: `chunks/[name]-[hash].js`
- `base: './'` — relative paths for GitHub Pages subdirectory
- `cssCodeSplit: false`

## Entry flow
`main.tsx` (sync setup only, no React):
1. Applies theme (`localStorage` → system → default light)
2. Injects active brand CSS
3. Sets `role=region` + `aria-label` on container
4. `import('./bootstrap')` → mounts React lazily

`bootstrap.tsx` → `createRoot` + `<App />`

## Brand system
Brands: `rbn` (default), `oak`, `sgh`, `bliz`, `cdm`

Detection priority:
1. `window.__IMP_LUX_BRAND__`
2. `?brand=` URL param
3. `'rbn'`

Each brand has `src/brands/{brand}/styles.scss` loaded via `?inline`. Only the active brand is injected into DOM.

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

## Wizard (2-step)
- `Wizard.tsx` — main bundle; manages step state + theme toggle
- `WizardStep1` — lazy chunk; glass type selection (sunglasses / eyeglasses / kids-sunglasses)
- `WizardStep2` — lazy chunk; fetches models, shows category filters + model grid

Step SCSS loaded via `?inline` and injected at module level when chunk loads.

## Dark mode
`src/theme/darkMode.ts` — `applyTheme(getInitialTheme())` called sync in `main.tsx` before React.
`html[data-theme="light|dark"]` — set by JS; CSS also has `@media prefers-color-scheme` fallback.

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
  main.tsx              — tiny entry, sync setup + lazy bootstrap
  bootstrap.tsx         — React mount
  App.tsx               — LabelsProvider + Wizard
  brands/detect.ts      — brand singleton
  brands/loader.ts      — injects brand CSS
  api/config.ts         — runtime API config (no .env)
  api/models.ts         — fetchModels, getCategoriesByType, getModelsByType
  labels/               — i18n service (see above)
  theme/darkMode.ts     — theme detection + toggle
  styles/critical.scss  — CSS bundle (vars, reset, skeleton, sr-only, reduced-motion)
  wizard/
    Wizard.tsx          — step orchestrator, theme toggle
    WizardStep1.tsx     — lazy chunk
    WizardStep2.tsx     — lazy chunk
    wizard.scss         — main bundle CSS (nav, toggle, skeletons)
    WizardStep1.scss    — on-demand CSS (?inline)
    WizardStep2.scss    — on-demand CSS (?inline)
public/
  index.html            — GitHub Pages shell (static skeleton + inline theme script + preloads)
```

## Pending
- `BRAND_STORE_IDS` in `api/config.ts`: all set to `'10151'` (only rbn known) — update when others available
- Labels API endpoint not live yet — defaults always used until implemented
- Delete `main` branch on both repos after changing default branch in GitHub Settings
