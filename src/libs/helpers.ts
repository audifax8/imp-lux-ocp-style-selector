/* eslint-disable no-unsafe-optional-chaining */
import {
  API_KEYS_MAP,
  DEFAULT_LOCALE,
  RBN_CUSTOMER_ID,
  WAYFARER_ID,
  WAYFARER_VENDOR_ID
} from '@/declarations/constants';
import type { MergedParams } from '@/declarations/types';
import type { ConfigureParams, QuickLink, RxcBaseAPI } from '@/declarations/interfaces';
declare global {
  interface Window {
    rtrViewer: unknown;
    vmmv: unknown;
    configureParams: ConfigureParams;
    _configure: unknown;
    _apis: unknown;
    _rxcData: unknown;
    RXC_LOADED: boolean;
    RXC: RxcBaseAPI;
    _fluid: unknown;
    quicklink: QuickLink;
    caretaker: unknown;
  }
}

function parseBoolParam(paramToParse: string | undefined): boolean {
  if (paramToParse === undefined) {
    return false;
  }
  if (paramToParse === '') {
    return true;
  }
  return paramToParse === 'true' ? true : false;
}

function parseInt(paramToParse: string | undefined): number {
  try {
    return Number(paramToParse);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates the app environment using the browser URL
 */
function getAppEnvironmentFromURL() {
  const qp = new URLSearchParams(window.location.search);
  const queryParams = Object.fromEntries(qp.entries());

  const { workflow } = queryParams;
  if (workflow) {
    return workflow;
  }

  const { hostname } = window?.location;
  let { pathname } = window?.location;
  // Remove the last / if it exists
  if (pathname.endsWith('/')) pathname = pathname.substring(0, pathname.length - 1);

  // Remove any html file from the url to leave only the path
  pathname = pathname.replace(/\/[^/?#]*\.html$/, '');

  const isDevEnvironment =
    pathname.includes('/dev') ||
    pathname.includes('/develop') ||
    pathname.includes('/branches/') ||
    hostname === 'localhost';

  if (isDevEnvironment) return 'dev';

  const isTestingEnvironment =
    pathname.includes('qa') ||
    pathname.includes('staging') ||
    pathname.includes('acceptance') ||
    pathname.includes('stg');

  if (isTestingEnvironment) return 'qa';

  // Defaults to Prod
  return 'prod';
}

function getShowHeader(workflow: string) {
  const qp = new URLSearchParams(window.location.search);
  const queryParams = Object.fromEntries(qp.entries());
  const { showHeader } = queryParams;
  if (showHeader !== undefined) {
    return parseBoolParam(showHeader) || true;
  }
  if (workflow === 'dev') {
    return true;
  }
  return false;
}

export function getInitQueryParams(): MergedParams {
  const qp = new URLSearchParams(window.location.search);
  const queryParams = Object.fromEntries(qp.entries());
  const configureParams = window.configureParams;

  const {
    vendorId,
    customer,
    product,
    recipeId,
    number,
    currency,
    rtrDisabled,
    yrEnv,
    showPerformance,
    showLogs,
    token,
    upc,
    showBackgroundImage,
    showThemeSwitch,
    darkMode,
    skeletonLoader,
    skipLuxApi,
    useProdEndpoint,
    skipOla,
    skipPreload,
    ocHierarchy,
    locale,
    rtrVersion,
    endpoint,
    lang,
    store,
    mockInspirations,
    mockMyDesigns,
    startWithStyleSelector,
    mockModels,
    brand
  } = queryParams;
  //const e2eParam = getQueryParam('e2e')?.toLowerCase();

  const workflow = getAppEnvironmentFromURL();
  const showHeader = getShowHeader(workflow);
  const customerId = isNaN(parseInt(customer)) ? RBN_CUSTOMER_ID : parseInt(customer);
  const apiKey = API_KEYS_MAP[customerId];

  const params = {
    //locale: locale !== undefined ? locale : parseInt(customer) === OAK_CUSTOMER_ID ? 'en' : DEFAULT_LOCALE,
    locale: locale ?? DEFAULT_LOCALE,
    environment: 'prod',
    yrEnv: parseBoolParam(yrEnv),
    showPerformance: parseBoolParam(showPerformance),
    showLogs: parseBoolParam(showLogs),
    rtrDisabled: rtrDisabled !== undefined ? parseBoolParam(rtrDisabled) : undefined,
    customer: customerId,
    product: isNaN(parseInt(product)) ? WAYFARER_ID : parseInt(product),
    recipeId: recipeId ?? undefined,
    workflow,
    currency: currency ?? 'USD',
    number: number,
    vendorId: vendorId ?? WAYFARER_VENDOR_ID,
    upc,
    token,
    showBackgroundImage: parseBoolParam(showBackgroundImage),
    showThemeSwitch: parseBoolParam(showThemeSwitch),
    darkMode: parseBoolParam(darkMode),
    showHeader,
    skeletonLoader: parseBoolParam(skeletonLoader),
    skipLuxApi: parseBoolParam(skipLuxApi),
    skipOla: parseBoolParam(skipOla),
    skipPreload: parseBoolParam(skipPreload),
    apiKey,
    useProdEndpoint: parseBoolParam(useProdEndpoint),
    ocHierarchy: ocHierarchy ?? configureParams?.ocHierarchy,
    rtrVersion: rtrVersion,
    endpoint: endpoint ?? 'https://one-configurator-services-mockup.luxdeepblue.com/models?language=',
    lang: lang ?? 'en',
    store: store ?? '10151',
    mockInspirations: parseBoolParam(mockInspirations),
    mockMyDesigns: parseBoolParam(mockMyDesigns),
    startWithStyleSelector: startWithStyleSelector,
    mockModels: parseBoolParam(mockModels),
    brand: brand
  };
  const mergedParams = {
    ...params,
    ...configureParams
  };

  return mergedParams as MergedParams;
}

export const runAsync = (fn: () => Promise<unknown>, onError: (e: unknown) => void = console.error) => {
  queueMicrotask(() => {
    Promise.resolve().then(fn).catch(onError);
  });
};

export function runIdle<T>(fn: () => T | Promise<T>, timeout = 2000): Promise<T> {
  return new Promise((resolve, reject) => {
    const execute = () => {
      Promise.resolve().then(fn).then(resolve).catch(reject);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => execute(), { timeout });
    } else {
      setTimeout(execute, 0);
    }
  });
}

type SchedulePriority = 'microtask' | 'idle' | 'animation' | 'timeout';

export function schedule<T>(fn: () => T | Promise<T>, priority: SchedulePriority = 'microtask'): Promise<T> {
  const execute = () => Promise.resolve().then(fn);

  switch (priority) {
    case 'microtask':
      return new Promise((resolve, reject) => queueMicrotask(() => execute().then(resolve).catch(reject)));

    case 'animation':
      return new Promise((resolve, reject) => requestAnimationFrame(() => execute().then(resolve).catch(reject)));

    case 'idle':
      return runIdle(fn);

    default:
      return new Promise((resolve, reject) => setTimeout(() => execute().then(resolve).catch(reject)));
  }
}
