// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — Model
// Se descarga cuando el Configurator lo necesita (React.lazy).
// El SCSS del skeleton se inyecta a nivel de módulo antes de que React monte,
// garantizando que el skeleton de gafas esté estilado desde el primer frame.
// ─────────────────────────────────────────────────────────────────────────────
import modelStyles from './model.scss?inline'
import { lazy, Suspense, useMemo } from 'react'
import ModelSkeleton from './ModelSkeleton'
import { useInitStrategy } from './useInitStrategy'
import { ConfiguratorInitStrategy } from './strategy/ConfiguratorInitStrategy'

const styleEl = document.createElement('style')
styleEl.dataset.id = 'configurator-model'
styleEl.textContent = modelStyles
document.head.appendChild(styleEl)

// ModelContent se carga SOLO cuando Fase 1 ha resuelto.
// Su CSS (model-content.scss) se inyecta al cargar este chunk.
const ModelContent = lazy(() => import('./ModelContent'))

// SharedSkeleton: chunk alternativo, se descarga SOLO cuando se renderiza.
// ?skeletonLoader=true → activo; ausente/false → ModelSkeleton por defecto (sin coste de red).
const _raw = new URLSearchParams(window.location.search).get('skeletonLoader')
const skeletonEnabled = _raw !== null && (_raw === '' || _raw === 'true')

// Preload inmediato: si el param está activo, disparamos el import ahora para que el
// chunk esté en caché cuando React lo necesite — evita el flash de ModelSkeleton.
// IMPORTANTE: SharedSkeleton se usa sin <Suspense> propio (ver skeleton variable abajo).
// Esto funciona SOLO porque el preload garantiza que lazy() resuelve síncronamente.
// Si eliminas sharedSkeletonImport, añade un <Suspense> wrapper alrededor de <SharedSkeleton />.
const sharedSkeletonImport = skeletonEnabled
  ? import('@/shared/components/SharedSkeleton')
  : null
const SharedSkeleton = lazy(() => sharedSkeletonImport!)

const Model = () => {
  const strategy = useMemo(() => new ConfiguratorInitStrategy(), [])
  const { phase1Data, phase2Data } = useInitStrategy(strategy)

  // Cuando skeletonEnabled: SharedSkeleton con fallback al original mientras su chunk carga.
  // Cuando !skeletonEnabled: ModelSkeleton directamente, SharedSkeleton nunca se descarga.
  const skeleton = skeletonEnabled
    ? <SharedSkeleton /> : <ModelSkeleton />

  return (
    <div className="model">
      {phase1Data === null ? (
        skeleton
      ) : (
        <Suspense fallback={skeleton}>
          <ModelContent phase1Data={phase1Data} phase2Data={phase2Data} />
        </Suspense>
      )}
      <div id="viewer" className="yr-model-rtr" />
      <div id="container" className="yr-model-rtr" />
    </div>
  )
}

export default Model
