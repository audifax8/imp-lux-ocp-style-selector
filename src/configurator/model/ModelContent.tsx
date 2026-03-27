// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — ModelContent
// Se descarga SOLO cuando el skeleton de gafas ha resuelto.
// El SCSS se inyecta a nivel de módulo antes de que React monte el componente.
// ─────────────────────────────────────────────────────────────────────────────
import modelContentStyles from './model-content.scss?inline'
import { activeBrand } from '@/brands/detect'
import type { InitPhase1Data, InitPhase2Data } from '@/configurator/model/strategy/types'

const styleEl = document.createElement('style')
styleEl.dataset.id = 'configurator-model-content'
styleEl.textContent = modelContentStyles
document.head.appendChild(styleEl)

interface ModelContentProps {
  phase1Data: InitPhase1Data
  phase2Data: InitPhase2Data | null
}

const ModelContent = ({ phase1Data, phase2Data }: ModelContentProps) => (
  <div className="model-content">
    <svg
      className="model-content__glasses"
      viewBox="0 0 260 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Patilla izquierda */}
      <line
        x1="14" y1="32" x2="0" y2="48"
        stroke="var(--accent)" strokeWidth="4.5" strokeLinecap="round"
      />
      {/* Cristal izquierdo */}
      <rect
        x="12" y="18" width="94" height="64" rx="24"
        fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="3"
      />
      {/* Puente nasal */}
      <path
        d="M106 42 C114 30 146 30 154 42"
        stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
      />
      {/* Cristal derecho */}
      <rect
        x="154" y="18" width="94" height="64" rx="24"
        fill="var(--accent-bg)" stroke="var(--accent)" strokeWidth="3"
      />
      {/* Patilla derecha */}
      <line
        x1="246" y1="32" x2="260" y2="48"
        stroke="var(--accent)" strokeWidth="4.5" strokeLinecap="round"
      />
    </svg>

    <div className="model-content__info">
      <p className="model-content__name">{phase1Data.modelName}</p>
      <p className="model-content__collection">{phase1Data.collection}</p>
      <p className="model-content__price">{phase1Data.price}</p>
    </div>

    <div className="model-content__brand">
      <span className="model-content__brand-dot" />
      {activeBrand.toUpperCase()}
    </div>

    {phase2Data && (
      <ul className="model-content__recommendations" aria-label="Recommendations">
        {phase2Data.recommendations.map(rec => (
          <li key={rec.id} className="model-content__rec-item">{rec.name}</li>
        ))}
      </ul>
    )}
  </div>
)

export default ModelContent
