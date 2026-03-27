// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — Model
// Se descarga cuando el Configurator lo necesita (React.lazy).
// El SCSS del skeleton se inyecta a nivel de módulo antes de que React monte,
// garantizando que el skeleton de gafas esté estilado desde el primer frame.
// ─────────────────────────────────────────────────────────────────────────────
import modelStyles from './model.scss?inline'
import { lazy, Suspense } from 'react'
import ModelSkeleton from './ModelSkeleton'

const styleEl = document.createElement('style')
styleEl.dataset.id = 'configurator-model'
styleEl.textContent = modelStyles
document.head.appendChild(styleEl)

// ModelContent se carga SOLO cuando el skeleton resuelve.
// Su CSS (model-content.scss) se inyecta al cargar este chunk.
const ModelContent = lazy(() => import('./ModelContent'))

const Model = () => (
  <div className="model">
    <Suspense fallback={<ModelSkeleton />}>
      <ModelContent />
    </Suspense>
  </div>
)

export default Model
