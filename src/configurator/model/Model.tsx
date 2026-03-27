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

const Model = () => {
  const strategy = useMemo(() => new ConfiguratorInitStrategy(), [])
  const { phase1Data, phase2Data } = useInitStrategy(strategy)

  return (
    <div className="model">
      {phase1Data === null ? (
        <ModelSkeleton />
      ) : (
        <Suspense fallback={<ModelSkeleton />}>
          <ModelContent phase1Data={phase1Data} phase2Data={phase2Data} />
        </Suspense>
      )}
      <div id="viewer" className="yr-model-rtr" />
      <div id="container" className="yr-model-rtr" />
    </div>
  )
}

export default Model
