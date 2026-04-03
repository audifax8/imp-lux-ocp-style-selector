// =============================================================================
// CHUNK LAZY — SharedSkeleton
// Skeleton compartido entre configurator y style-selector.
// Se activa con ?skeletonLoader=true. Solo se descarga cuando se renderiza.
// CSS inyectado a nivel de módulo (patrón del proyecto).
// =============================================================================
import { Logo } from '@/style-selector/components/logo'
import skeletonStyles from './index.scss?inline'
import { getSVGURL } from '@/shared/assets'

const styleEl = document.createElement('style')
styleEl.dataset.id = 'shared-skeleton'
styleEl.textContent = skeletonStyles
document.head.appendChild(styleEl)

const SharedSkeleton = () => (
  <div className="demo">
    <div className="demo-scene">
      {/* role="status" + aria-live="polite": announces loading state to AT on mount */}
      <div className="demo-overlay" role="status" aria-live="polite">
        <Logo className={'demo-brand'} url={getSVGURL('EssilorLuxotticaBlack', 'wl')} />
        <p className="demo-title">Starting your Remix experience</p>
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
