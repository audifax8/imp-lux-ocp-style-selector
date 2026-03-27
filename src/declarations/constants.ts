import { ResolutionType, Media } from '@/declarations/enums';
import type { ImageData } from '@/declarations/interfaces';

export const MEGA_WAYFARER_ID = 26101;
export const RBN_CUSTOMER_ID = 1581;
export const OAK_CUSTOMER_ID = 1479;
export const WAYFARER_ID = 22972;
export const WAYFARER_VENDOR_ID = '0RB3025CP';
export const RADAR_EV_VENDOR_ID = '0OO9208CP';
export const DEFAULT_LOCALE = 'en_US';

export const API_KEYS_MAP: Record<number, string> = {
  1581: 'LUX-Ray-Ban-8taOhSR5AFyjt9tfxU',
  1479: 'O4K3L3Y78pihfgpR6R1ETlBWEAuvrnoIN2rKxqLH4FkU92tq',
  1590: 'LUX-Sunglass0Hut-yjt4tR3AFfx1UtaOhS'
};

export const BRAND_NAMES_MAP: Record<number, string> = {
  1581: 'rbn',
  1479: 'oak',
  1590: 'sgh'
};

export const CDN_FLUID_BASE_URL = 'https://cdn-prod.fluidconfigure.com';
export const FLUID_BASE_URL = 'https://prod.fluidconfigure.com';
export const HEADLESS_URL = 'https://cdn-prod-ingress.fluidconfigure.com/headless/graphql';

//RTR
//const DEFAULT_RTR_VERSION = '8.1.0';
const DEFAULT_RTR_VERSION = '7.2.2';
export const RTR_BASE_URL = 'https://rtr-viewer.luxottica.com';
export const RTR_URL = `${RTR_BASE_URL}/lib/v/${DEFAULT_RTR_VERSION}/main.js`;
export const RTR_ASSETS_BASE_URL = 'https://cp.luxottica.com';
export const RTR_ASSETS_URL = 'https://cp.luxottica.com/public/v1/prefetch/_vendorId_?qa=_rtrQa_';

export function getSkeletonURL(): string {
  const resolution = getSkeletonResolution();
  return `${CDN_FLUID_BASE_URL}/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/assets/img/${resolution}_sk.avif`;
}

export function getSVGURL(name: string): string {
  return `${CDN_FLUID_BASE_URL}/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/assets/svg/${name}.svg`;
}

export const resolutions: ImageData[] = [
  {
    resolution: ResolutionType.MOBILE,
    scale: 0.3,
    quality: 50,
    media: Media.MOBILE,
    type: 'image/png',
    url: '',
    dimentions: {
      width: 375,
      height: 188
    }
  },
  {
    resolution: ResolutionType.DESKTOP,
    scale: 0.6,
    quality: 90,
    media: Media.DESKTOP,
    type: 'image/png',
    url: '',
    dimentions: {
      width: 675,
      height: 337
    }
  },
  {
    resolution: ResolutionType.TABLET,
    scale: 0.3,
    quality: 70,
    media: Media.TABLET,
    type: 'image/png',
    url: '',
    dimentions: {
      width: 675,
      height: 337
    }
  }
];

export function getSkeletonResolution(): ResolutionType {
  const width = window.innerWidth;
  if (width < 768) {
    return ResolutionType.MOBILE;
  } else if (width >= 768 && width < 1024) {
    return ResolutionType.DESKTOP;
  }
  return ResolutionType.DESKTOP;
}

export function getImgData(): ImageData {
  const res = getSkeletonResolution();

  return resolutions.find(({ resolution }) => resolution === res)!;
}
