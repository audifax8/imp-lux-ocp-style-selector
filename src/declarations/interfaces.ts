import type { AttributeValue } from '@fluid.inc/yr-configure-wrapper/core';

import type { FetchPriority, ResolutionType, SkeletonVariant, StepType } from '@/declarations/enums';
import type { KeyString } from '@/declarations/types';
import type { Brand } from '@/white-label/types';
import type { i18n } from '@/models/i18n';

export interface ImageData {
  resolution: ResolutionType;
  scale: number;
  quality: number;
  media?: string;
  type?: string;
  url?: string;
  dimentions: {
    width: number;
    height?: number;
  };
}

/* params sent by the customer */
export interface ConfigureParams {
  locale?: string;
  ocHierarchy?: string;
  ocId: string;
  vendorId: string;
  currency?: string;
  region?: string;
  endpoint: string;
  subscriptionKey?: string;
}

export interface ConfigureInitParams {
  /**  Customer ID. */
  customer: number;
  /** Product ID. */
  product: number;
  /**  The environment to use for configurations and services. The default is "prod". */
  environment?: string;
  /** The workflow from which to load configurations. The default is "prod". */
  workflow: string;
  /** The locale to use for this instance. The defaults is "en_us". You must have localization defined for this locale. */
  locale: string;
  //currency?: string;
  number?: string;
  /** Load the configurator with this recipe ID. If omitted, a blank recipe will be used with default values for each attribute. */
  recipe?: number;
  recipeId?: string;
  yrEnv?: boolean;
  showPerformance?: boolean;
  showLogs?: boolean;
  logger?: boolean;
  vendorId?: string;
  rtrDisabled?: boolean;
  token?: string;
  upc?: string;
  showBackgroundImage?: boolean;
  showThemeSwitch?: boolean;
  darkMode?: boolean;
  showHeader?: boolean;
  skeletonLoader?: boolean;
  skipLuxApi?: boolean;
  apiKey: string;
  //skipHeadless?: boolean;
  useProdEndpoint?: boolean;
  skipOla?: boolean;
  skipPreload?: boolean;
  ocHierarchy?: string;
  rtrVersion?: string;
  brand: Brand;
  lang: string;
  store: string;
  mockMyDesigns?: boolean;
  mockInspirations?: boolean;
  getMyDesign?: unknown;
  startWithStyleSelector: string;
}

export interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  style?: React.CSSProperties;
}

export interface ScriptResult {
  time: string;
  status: boolean;
}
interface TokenPayload {
  type: string;
  value: string;
}

interface Product {
  id: TokenPayload;
}

interface SelectComponentPayload {
  componentId: number;
}
interface EnvPayload {
  envs: {
    ms: string;
    catalog: string;
    asset: string;
  };
  qa: boolean;
}

type Background = { color: string; image?: string } | { image: string; color?: string };

export interface InitRTRPayload {
  data: {
    settings: {
      background?: Background;
      showBackground?: boolean;
      clearColor: string;
      env: string;
      orbitPoint: boolean;
      highlightComponent: boolean;
      overviewVisibility: boolean;
      displayComponentPointer: boolean;
      automaticFramingComponent: boolean;
      buttonsVisibility: {
        tutorial?: string;
        explosion?: string;
        accessibility?: string;
        animationAtLanding?: string;
        displayOverlay?: string;
      };
    };
    products: Product[];
    id: TokenPayload;
    locale: string; // or any other available locale
    selector: string;
  };
  metadata: EnvPayload;
  callbacks?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComponentSelected: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onActions: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClose: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFocus: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRendered: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettingsUpdated: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onWarning: any;
  };
}

export interface RtrWrapperAPI {
  getVersion(): string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init(token: string, cb?: any): Promise<boolean>;
  isIdAvailable(token: string): Promise<boolean>;
  setId(token: string): void;
  selectComponent(token: number): void;
  mapCameraNameRTRToComponent(caName: string): number | undefined;
  mapCaNameToRTRCameraName(caAlias: string): string;
  isInitialized(): Promise<boolean>;
  dispose(): void;
  setClearColor(color: string): void;
}
export interface RtrBaseAPI {
  getVersion(): string;
  init(payload: InitRTRPayload): Promise<void>;
  isIdAvailable(dataToChekPayload: TokenPayload, envPayload: EnvPayload): Promise<boolean>;
  setId(setIdPayload: TokenPayload): void;
  isInitialized(): Promise<boolean>;
  selectComponent(payload: SelectComponentPayload): void;
  dispose(): void;
  setClearColor(color: string): void;
}

export interface RxcBaseAPI {
  rxcWidget: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (config: any): void;
    close(): void;
    listeners: {
      AddToCartEvent(): void;
      BackToPdp(): void;
      LoadPrescription(): void;
    };
    roots: {
      '#rxcApp': HTMLElement;
    };
    selector: string;
  };
}
export interface VmBaseAPI {
  VMConfiguratorsWidget(): void;
  VMWidgetApp(): void;
  clearPictureVideoIds(): void;
  VMWidgetQRCode(): void;
  isBrowserSupported(): Promise<boolean>;
  isUPCSupported(): void;
  isValidConfig(): void;
  reset(): void;
  warmUp(): void;
}

export interface Resource {
  url: string;
  as: string;
  crossOrigin: string | null;
  fetchPriority: FetchPriority;
}

export interface WorkerResponse<T> {
  data: T;
}

export interface CAFacet {
  name: string;
  id: number;
  facetValues: FacetValue[];
}
export interface FacetValue {
  id: number;
  name: string;
  selectable: boolean;
}
export interface FacetFacetValueMap {
  id?: number;
  name?: string;
  facetValuesMapped?: FacetValue;
}

export interface CAMap {
  id: number | null;
  name?: string;
  alias: string;
  icon: string;
  selectedAvId: number | null;
  skeleton?: boolean;
  selectedAvName?: string;
  open?: boolean;
}

export interface RtrAssetsAPI {
  prefetchListStartup: string[];
  prefetchListConfigurableAttributes?: KeyString<string[]>;
  prefetchListHierarchy?: KeyString<string[]>;
}

export interface MenuHeaderConfig {
  selectionAttributeAlias: string;
  icon: string;
}

export type AssetType = 'image' | 'emoji';

export interface AssetSource {
  assetType: AssetType;
  source: string;
  properties?: Record<string, string>;
}

export interface I18nField {
  key: string;
  fallback: string;
}

export type I18nMap<T extends string> = Record<T, I18nField>;

export type Translated<T> = T & {
  [K in keyof T]: K extends 'i18n' ? never : T[K];
} & (T extends { i18n?: I18nMap<infer K> } ? Record<K, string> : object);

export interface Component {
  vendorId: string;
  suggestedRetailPrice: {
    amount: number;
    discountAmount: number;
    discountPercent: number;
    hideDiscount: boolean;
    discountKiller: boolean;
  };
  available: boolean;
  wholesalePrice: number;
}

export interface Grid {
  modelGrid: string;
  components: Component[];
}

export interface Components {
  modelCode: string;
  vendorId: string;
  currency: string;
  discountAmount: number;
  discountPercent: number;
  amount: number;
  globalDiscountAmount: number;
  globalDiscountPercent: number;
  wholesalePrice: number;
  vatIncluded: boolean;
  grids: Grid[];
}
export interface Override {
  [key: string]: {
    valueUsages?: {
      [key: string]: {
        active: boolean;
      };
    };
  };
}

export interface QuickLink {
  prefetch(URL: string[], test: boolean, test1: boolean): Promise<unknown>;
}

export interface MapAttributeValue extends AttributeValue {
  url?: string;
  valueUsageVendorId?: string;
  colorCodeURL?: string;
}

export interface ConfigurableAttribute {
  id: number;
  alias: string;
  vendorId?: string;
  usageVendorId?: string;
  name: string;
  attributeValues?: MapAttributeValue[];
  values?: MapAttributeValue[];
  subAttributes?: ConfigurableAttribute[];
}

export interface OverrideDictionary {
  [key: string]: AttributeValue[];
}

interface HeadlessFacet {
  name: string;
  values: string[];
}
export interface HeadlessProduct {
  product: {
    name: string;
    id: number;
    vendorId: string;
    attributes: ConfigurableAttribute[];
    facets: HeadlessFacet[];
  };
}

export interface LuxApiModel {
  modelCode: string
  vendorId: string
  pageUrl: string
  promoBadge?: string
  label: string
  thumbnailUrl?: string
  recipeId?: number;
}

export type LuxApiCategory = {
  category: string;
  models: LuxApiModel[];
};

export interface UiSettings {
  globals: {
    i18n: Record<string, string>;
  };
}

export interface Step {
  id?: number;
  name: string;
  type: StepType;
}

export type FlatModel = {
  modelKey: string;
  type: string;
  category: string;
  models: LuxApiModel[];
  length?: number;
};

export type ModelsTranslated = {
  name: string;
  translation?: string;
  length?: number;
};

export interface StepWithTranslation {
  id: number;
  name: string;
  translation?: string;
  type?: StepType;
  length?: number;
};

export type StyleSelectorMapped = {
  stepsTranslated?: StepWithTranslation[];
  modelsTypesTranslated?: ModelsTranslated[];
  flatModels?: FlatModel[];
  inspirations?: LuxApiModel[];
};

export type StyleSelectorFilter = {
  preselectedStep?: StepWithTranslation;
  preselectedFlatModel?: FlatModel;
  modelsToRender?: LuxApiModel[];
  preselectedCategoriesFilters?: FlatModel[];
};

export type StyleSelectorInitData = {
  i18n: i18n;
} & StyleSelectorMapped & StyleSelectorFilter;

export interface InitPhase1Data {
  modelId: string
  modelName: string
  collection: string
  price: string
};
export interface InitPhase2Data {
  recommendations: Array<{ id: string; name: string }>
  sessionId: string
};
export interface IInitStrategy<P1, P2> {
  executePhase1(): Promise<P1>
  executePhase2(phase1Result: P1): Promise<P2>
};

export interface IStyleSelectorInitStrategy<P1, P2> {
  loadAppData(): Promise<P1>
  preloadConfiguratorData(phase1Result: P1): Promise<P2>
};