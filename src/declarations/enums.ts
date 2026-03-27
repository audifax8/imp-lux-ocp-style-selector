export enum SkeletonVariant {
  text = 'text',
  circular = 'circular',
  rectangular = 'rectangular',
  rounded = 'rounded'
}

export enum ResolutionType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

export enum Media {
  MOBILE = '(max-width: 600px)',
  TABLET = '(min-width: 601px) and (max-width: 1024px)',
  DESKTOP = '(min-width: 1025px)'
}

export const enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum RTRBackground {
  LIGHT = '#f6f6f6',
  DARK = '#1f1f24'
}

export enum FetchPriority {
  HIGH = 'high',
  LOW = 'low',
  AUTO = 'auto'
}

export enum ApiType {
  RTR = 'RTR',
  VM = 'VM'
}

export enum CheckPointType {
  UTILS = 'UTILS',
  JSON = 'JSON',
  CORE = 'CORE',
  RTR = 'RTR',
  OVERRIDES = 'OVERRIDES',
  VM = 'VM',
  MENU = 'MENU'
}
