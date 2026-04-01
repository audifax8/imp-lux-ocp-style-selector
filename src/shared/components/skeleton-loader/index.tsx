// =============================================================================
// CHUNK LAZY — SharedSkeleton
// Skeleton compartido entre configurator y style-selector.
// Se activa con ?skeletonLoader=true. Solo se descarga cuando se renderiza.
// CSS inyectado a nivel de módulo (patrón del proyecto).
// =============================================================================
import skeletonStyles from './index.scss?inline'

const styleEl = document.createElement('style')
styleEl.dataset.id = 'shared-skeleton'
styleEl.textContent = skeletonStyles
document.head.appendChild(styleEl)

const SharedSkeleton = () => (
  <div className="shared-skeleton" role="status" aria-live="polite" aria-label="Loading">
    <div className="shared-skeleton__bar" />
    <div className="shared-skeleton__bar shared-skeleton__bar--med" />
    <div className="shared-skeleton__bar" />
    <div className="shared-skeleton__bar shared-skeleton__bar--short" />
  </div>
)

export default SharedSkeleton
