// id = header attribute alias

import type { MenuHeaderConfig } from '@/declarations/interfaces';

export const MENU_SWATCHES_LIMIT_MOBILE = 6;
export const MENU_SWATCHES_LIMIT_DESKTOP = 8;

export const MENU_HEADER_FALLBACK_ICON =
  'https://cdn-prod.fluidconfigure.com/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/assets/img/frame.avif';

export const MENU_HEADERS_CONFIG: Record<string, MenuHeaderConfig> = {
  lenses: {
    selectionAttributeAlias: 'lenses_sku',
    icon: 'https://cdn-prod.fluidconfigure.com/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/assets/img/lens.avif'
  },
  frame: {
    selectionAttributeAlias: 'frame_sku',
    icon: 'https://cdn-prod.fluidconfigure.com/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/assets/img/frame.avif'
  },
  temple_tips: {
    selectionAttributeAlias: 'temple_tips_sku',
    icon: 'https://cdn-prod.fluidconfigure.com/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/assets/img/temple.avif'
  }
};
