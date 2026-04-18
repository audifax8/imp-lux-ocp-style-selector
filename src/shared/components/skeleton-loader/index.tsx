// =============================================================================
// CHUNK LAZY — SharedSkeleton
// Skeleton compartido entre configurator y style-selector.
// Se activa con ?skeletonLoader=true. Solo se descarga cuando se renderiza.
// CSS inyectado a nivel de módulo (patrón del proyecto).
// =============================================================================
import skeletonStyles from './index.scss?inline'
import { activeBrand } from '@/white-label/detect'
import { useI18n } from '@/style-selector/context/i18n-context'

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

const SharedSkeleton = () => {
  const i18n = useI18n();
  const loadingTitle = i18n?.getLabel('style_selector_loading_title', 'Starting your experience') ?? 'Starting your experience';
  const loadingLabel = i18n?.getLabel('style_selector_loading_label', 'Loading, please wait') ?? 'Loading, please wait';

  return (
    <div
      className={`style-selector-skeleton style-selector-skeleton-${activeBrand}`}
      role="status"
      aria-label={loadingLabel}
      aria-busy="true"
    >
      <div className="demo-scene">
        <div className="demo-overlay">
          <div className='demo-brand' aria-hidden="true">
            <span className='demo-brand-logo'></span>
          </div>
          <p className="demo-title">{loadingTitle}</p>
          <div
            className="demo-progress"
            role="progressbar"
            aria-label={loadingLabel}
          >
            <div className="demo-progress__fill" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSkeleton
