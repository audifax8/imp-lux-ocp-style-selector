import type { Labels } from './types'

// Valores por defecto en inglés.
// Se usan mientras la API de labels carga o si la API falla.
export const DEFAULT_LABELS: Labels = {
  widget: {
    title: 'Style Selector',
  },
  configurator: {
    loading: 'Loading configurator',
  },
  darkMode: {
    label: 'Dark mode',
  },
  step1: {
    title: 'What are you looking for?',
    loading: 'Loading glasses types',
    sunglasses: {
      label: 'Sunglasses',
      sub: 'UV protection & style',
    },
    eyeglasses: {
      label: 'Eyeglasses',
      sub: 'Prescription & fashion',
    },
    kidsSunglasses: {
      label: 'Kids Sunglasses',
      sub: 'Safe & fun for kids',
    },
  },
  step2: {
    loading: 'Loading models',
    back: '← Back',
    backAria: 'Back to type selection',
    breadcrumbAria: 'Breadcrumb',
    sunglasses: 'Sunglasses',
    eyeglasses: 'Eyeglasses',
    kidsSunglasses: 'Kids Sunglasses',
    modelsCount: '{count} models · {brand}',
    filterAria: 'Filter by category',
    filterAll: 'All',
    confirm: 'Customize →',
    confirmDisabled: 'Select a model',
    retry: 'Retry',
  },
}
