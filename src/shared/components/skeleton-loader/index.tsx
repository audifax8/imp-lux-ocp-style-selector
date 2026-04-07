// =============================================================================
// CHUNK LAZY — SharedSkeleton
// Skeleton compartido entre configurator y style-selector.
// Se activa con ?skeletonLoader=true. Solo se descarga cuando se renderiza.
// CSS inyectado a nivel de módulo (patrón del proyecto).
// =============================================================================
import skeletonStyles from './index.scss?inline'
import { activeBrand } from '@/white-label/detect'

const styleEl = document.createElement('style')
styleEl.dataset.id = 'shared-skeleton'
styleEl.textContent = skeletonStyles
document.head.appendChild(styleEl)

//TODO Refactor by brand
import rbnStyles from './white-label/rbn.scss?inline'
if (activeBrand === 'rbn') {
  const rbnStyleEl = document.createElement('style')
  rbnStyleEl.dataset.id = 'rbn-skeleton'
  rbnStyleEl.textContent = rbnStyles
  document.head.appendChild(rbnStyleEl)
}

const SharedSkeleton = () => (
  <div className={`style-selector-skeleton style-selector-skeleton-${activeBrand}`}>
    <div className="demo-scene">
      <div className="demo-overlay" role="status" aria-live="polite">
        <div className='demo-brand'>
          <span className='demo-brand-logo'></span>
        </div>
        {/* TODO translations */}
        <p className="demo-title">Starting your Remix experience</p>
        {/* TODO progress */}
        <div
          className="demo-progress"
          role="progressbar"
          aria-label="Loading"
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="demo-progress__fill" />
        </div>
      </div>
    </div>
  </div>
)

export default SharedSkeleton
