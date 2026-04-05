import { lazy, Suspense, useState, useEffect } from 'react'
import type { GlassType } from './types'
import WizardStep1Skeleton from './WizardStep1Skeleton'
import StyleSelectorSkeleton from './StyleSelectorSkeleton'
import DarkModeSwitch from '@/shared/components/dark-mode-switch'
import { getCurrentTheme, toggleTheme, type Theme } from '@/shared/theme/darkMode'
import { useLabels } from '@/labels/useLabels'

const WizardStep1 = lazy(() => import('./WizardStep1'))
const WizardStep2 = lazy(() => import('./WizardStep2'))

// SharedSkeleton: chunk alternativo, se descarga SOLO cuando se renderiza.
// ?skeletonLoader=true → activo; ausente/false → skeletons originales (sin coste de red).
const _raw = new URLSearchParams(window.location.search).get('skeletonLoader')
const skeletonEnabled = _raw !== null && (_raw === '' || _raw === 'true')

// Preload inmediato: si el param está activo, disparamos el import ahora para que el
// chunk esté en caché cuando React lo necesite — evita el flash del skeleton original.
// IMPORTANTE: SharedSkeleton se usa sin <Suspense> propio en los fallbacks de abajo.
// Esto funciona SOLO porque el preload garantiza que lazy() resuelve síncronamente.
// Si eliminas sharedSkeletonImport, añade un <Suspense> wrapper alrededor de <SharedSkeleton />.
const sharedSkeletonImport = skeletonEnabled
  ? import('@/shared/components/skeleton-loader')
  : null
const SharedSkeleton = lazy(() => sharedSkeletonImport!)

const MOUNT_ID = 'imp-lux-ocp-style-selector'

const Wizard = () => {
  const [selectedType, setSelectedType] = useState<GlassType | null>(null)
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  const labels = useLabels()

  // Sincroniza el aria-label del container con el label cargado desde la API.
  // main.tsx pone el valor por defecto antes del mount; aquí lo actualizamos
  // cuando los labels reales llegan.
  useEffect(() => {
    const container = document.getElementById(MOUNT_ID)
    if (container) container.setAttribute('aria-label', labels.widget.title)
  }, [labels.widget.title])

  return (
    <div className="wizard">
      <h1 className="sr-only">{labels.widget.title}</h1>
      <div className="wizard__toolbar">
        <DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />
      </div>

      {selectedType === null ? (
        <Suspense fallback={skeletonEnabled
          ? <SharedSkeleton /> : <WizardStep1Skeleton />
        }>
          <WizardStep1 onSelect={setSelectedType} />
        </Suspense>
      ) : (
        <Suspense fallback={skeletonEnabled
          ? <SharedSkeleton /> : <StyleSelectorSkeleton />
        }>
          <WizardStep2
            type={selectedType}
            onBack={() => setSelectedType(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Wizard
