// =============================================================================
// CHUNK LAZY — SharedSkeleton
// Skeleton compartido entre configurator y style-selector.
// Se activa con ?skeletonLoader=true. Solo se descarga cuando se renderiza.
// CSS inyectado a nivel de módulo (patrón del proyecto).
// =============================================================================
import { activeBrand } from '@/white-label/detect';
import { useI18n } from '@/style-selector/context/i18n-context';
import { useDarkMode } from '@/style-selector/bootstrap/useDarkMode';
import { activeTokenVersion, SKIN_NAME } from '@/style-selector/bootstrap/token-version';

import skeletonStyles from './index.scss?inline';
const styleEl = document.createElement('style');
styleEl.dataset.id = 'shared-skeleton';
styleEl.textContent = skeletonStyles;
document.head.appendChild(styleEl);

const SharedSkeleton = () => {
  const i18n = useI18n();
  const darkMode = useDarkMode();
  const loadingTitle = i18n?.getLabel('style_selector_loading_title', 'Starting your Remix experience') ?? 'Starting your Remix experience';
  const loadingLabel = i18n?.getLabel('style_selector_loading_label', 'Loading, please wait') ?? 'Loading, please wait';

  return (
    <div
      className={`style-selector-skeleton style-selector-skeleton-${activeBrand}`}
      role="status"
      aria-label={loadingLabel}
      aria-busy="true"
      data-token-version={activeTokenVersion}
      data-skin={SKIN_NAME[activeBrand] ?? 'whitelabel'}
      data-mode={darkMode}
    >
      <div className="skeleton-scene">
        <div className="skeleton-overlay">
          <div className='skeleton-brand' aria-hidden="true">
            <span className='skeleton-brand__logo'></span>
          </div>
          <div className="skeleton-title">
            <p className="skeleton-title__label">{loadingTitle}</p>
          </div>
          <div
            className="skeleton-progress"
            role="progressbar"
            aria-label={loadingLabel}
          >
            <div className="skeleton-progress__fill" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSkeleton
