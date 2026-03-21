// Estructura tipada de todos los labels y aria-labels del widget.
// El servicio carga este objeto desde la API; DEFAULT_LABELS actúa de fallback.

export interface Labels {
  widget: {
    title: string              // "Style Selector" — landmark aria-label + sr-only h1
  }
  darkMode: {
    label: string              // "Dark mode" — aria-label del toggle
  }
  step1: {
    title: string              // "What are you looking for?"
    loading: string            // "Loading glasses types" — aria-label del skeleton
    sunglasses: {
      label: string            // "Sunglasses"
      sub: string              // "UV protection & style"
    }
    eyeglasses: {
      label: string            // "Eyeglasses"
      sub: string              // "Prescription & fashion"
    }
    kidsSunglasses: {
      label: string            // "Kids Sunglasses"
      sub: string              // "Safe & fun for kids"
    }
  }
  step2: {
    loading: string            // "Loading models"
    back: string               // "← Back"
    backAria: string           // "Back to type selection"
    breadcrumbAria: string     // "Breadcrumb"
    sunglasses: string         // "Sunglasses" (breadcrumb / header)
    eyeglasses: string         // "Eyeglasses"
    kidsSunglasses: string     // "Kids Sunglasses"
    modelsCount: string        // "{count} models · {brand}" — supports {key} interpolation
    filterAria: string         // "Filter by category"
    filterAll: string          // "All"
    confirm: string            // "Customize →"
    confirmDisabled: string    // "Select a model"
    retry: string              // "Retry"
  }
}

/**
 * Reemplaza los placeholders {key} de un label por los valores dados.
 * interpolate("{count} models · {brand}", { count: "5", brand: "RBN" })
 * → "5 models · RBN"
 */
export const interpolate = (
  template: string,
  vars: Record<string, string>,
): string => template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)
