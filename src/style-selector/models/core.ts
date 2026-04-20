import type { ConfigureCore } from '@fluid.inc/yr-configure-wrapper/core';
import type { ConfigureJsons, ConfigureJsonsURLs, MergedParams } from '@/declarations/types';

import type { Caretaker } from '@/style-selector/bootstrap/state/caretaker';
import type { Originator } from '@/style-selector/bootstrap/state/originator';
import type { Overrides } from '@/models/overrides';

import { CheckPointType } from '@/declarations/enums';
import { AsyncTask } from '@/models/async-task';
import type { HeadlessProductsData } from '@/declarations/interfaces';

// Minimal types for the Fluid configure-ui SDK queue pattern.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FluidSDKInstance = { apps: { configure: (params: MergedParams, cb: (error: Error | null, c: any) => void) => void } }
type FluidQueue = Array<(err: string | null, fluid: FluidSDKInstance) => void>

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function downloadScript(url: string, onLoadCB: Function, priority?: 'high' | 'low' | 'auto') {
  const script = document.createElement('script');
  script.src = url;
  script.crossOrigin = 'anonymous';
  script.onload = () => onLoadCB(null, true);
  script.onerror = () => onLoadCB(`Error loading script ${url}`, null);
  script.async = true;
  script.fetchPriority = priority ?? 'auto';
  document.head.appendChild(script);
}

export abstract class InitBaseMethods {
  abstract createCore(measureName: string): Promise<ConfigureCore>;
  abstract getConfigureJsons(params: MergedParams, product: number): Promise<ConfigureJsons>;
  abstract getConfigureJsonsURLs(params: MergedParams, product: number): ConfigureJsonsURLs;
}

export class Core extends AsyncTask implements InitBaseMethods {
  protected CDN_FLUID_BASE_URL = 'https://cdn-prod.fluidconfigure.com';
  protected FLUID_BASE_URL = 'https://prod.fluidconfigure.com';
  protected HEADLESS_URL = 'https://cdn-prod-ingress.fluidconfigure.com/headless/graphql';
  protected HEADLESS_BASE = 'https://prod-ingress.fluidconfigure.com/headless';
  protected UI_URL = `${this.CDN_FLUID_BASE_URL}/static/code/configure-ui/stable/js/configure-app.js`;
  protected caretaker: Caretaker = undefined!;
  protected originator: Originator = undefined!;
  protected rtrDisabled: boolean = true;

  constructor(caretaker: Caretaker, originator: Originator) {
    super();
    this.caretaker = caretaker;
    this.originator = originator;
    /*const state = originator.getState();
    const params = state.getParams();
    if (params.darkMode) {
      this.updateUIState({ theme: Theme.DARK });
    }*/
  }

  public loadConfigureUIScript() {
    const url = this.UI_URL;
    const state = this.originator.getState();
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const _fluid = (window._fluid = (window._fluid as FluidQueue | undefined) ?? []) as FluidQueue;
      const params = state.getParams();
      console.log({ params });

      _fluid.push(function(err, fluid) {
        console.log({ err, fluid });
        // Handle loading errors
        if (err) {
          return reject(err);
        }

        // The configure application constructor
        const configureApp = fluid.apps.configure;
        configureApp(params, (error, c) => {
          if (error) {
            return reject('[CORE] Error creating core');
          }
          console.log({ err, c });
          console.log(c.run('getProduct'));
          return resolve(true);
        });
      });

      
      const performance = state.getPerformance();
      performance?.processStart('LoadingUIScript');
      downloadScript(
        url,
        (error: string, success: boolean) => {
          performance?.processEnd('LoadingUIScript');
          performance?.logMeasure('LoadingUIScript');
          if (error || !success) {
            return reject('[CORE] Error loading UI script');
          }
          //return resolve(true);
        },
        'high'
      );
    });
  }

  public async init(): Promise<void> {
    const state = this.originator.getState();
    const logger = state.getLogger();
    const performance = state.getPerformance();
    const params = state.getParams();
    performance?.processStart('initCore');
    try {
      const configureJsons = await this.getConfigureJsons(params, params.product);
      const newState = state.clone({
        configureJsons,
        checkPoint: CheckPointType.JSON
      });

      this.originator.setState(newState);
      this.caretaker.addMemento(this.originator.saveMemento());
      const core = await this.createCore('CreatingConfigure');
      console.log({ core });
      if (params.skipOla) {
        return;
      }
      const product = core.getProduct();
      const vendorId = product.vendorId;
      const { Overrides } = await import('@/models/overrides');
      const overrides = new Overrides(params, logger, performance);
      const components = await overrides.getLuxComponents(vendorId);
      const attributes = product?.attributes;
      overrides.getProductOverrides(components, attributes);
      console.log({ overrides });

      const { RAYBAN_CODE, getFrameOverrides } = await import('@fluid.inc/imp-tools-lux');
      console.log({ getFrameOverrides, RAYBAN_CODE });

      const coreWithOla = await this.createCore('ApplyOverrides', overrides);
      console.log({ coreWithOla });
    } catch (e) {
      console.log(e);
      logger?.object(e);
    }
    performance?.processEnd('initCore');
    performance?.logMeasure('initCore');
  }

  async render2D(): Promise<void> {
    const state = this.originator.getState();
    const params = state.getParams();
    const logger = state.getLogger();
    const performance = state.getPerformance();
    try {
      const { skipOla } = params;
      if (skipOla) {
        performance?.processEnd('initDefault');
        performance?.logMeasure('initDefault');
        return;
      }
    } catch (e) {
      logger?.object(e);
    }
  }

  public destroy() {
    //this.timeOuts.forEach((tOut) => clearTimeout(tOut));
  }

  /*
  public createUI(measureName: string, overrides?: Overrides): Promise<void> {
    return new Promise((resolve, reject) => {
      const state = this.originator.getState();
      const performance = state.getPerformance();
      performance?.processStart(measureName);
      const logger = state.getLogger();

      const { workflow, customer, product, locale } = state.getParams();
      const { productGraph, preferences } = state.getConfigureJsons();
    });
  }
  */

  createCore(measureName: string, overrides?: Overrides): Promise<ConfigureCore> {
    console.log(overrides);
    return new Promise((resolve, reject) => {
      const state = this.originator.getState();
      const performance = state.getPerformance();
      performance?.processStart(measureName);
      const logger = state.getLogger();

      const { workflow, customer, product, locale } = state.getParams();
      const { productGraph, preferences } = state.getConfigureJsons();

      import('@cfg.plat/configure-core')
        .then((createCore) => {
          createCore?.default(
            {
              productGraph,
              preferences,
              shouldSkipCache: false,
              product,
              customer,
              workflow,
              locale,
              productOverrides: {
                debug: false,
                values: overrides?.mappedAttributes
              }
            },
            (error: Error, configureCore: ConfigureCore) => {
              performance?.processEnd(measureName);
              performance?.logMeasure(measureName);

              if (error) {
                logger?.error('[createCore] error creating configure');
                logger?.object?.(error);
                return reject(error);
              }

              import('@fluid.inc/yr-configure-wrapper/core')
                .then(({ ConfigureCore }) => {
                  const core = new ConfigureCore(configureCore);
                  console.log(core.getProduct());
                  resolve(core);
                })
                .catch(reject);
            }
          );
        })
        .catch(reject);
    });
  }

  async getHeadlessProducts(): Promise<HeadlessProductsData> {
    const state = this.originator.getState();
    const params = state.getParams();
    const { customer, workflow, apiKey } = params!;
    const url = `${this.HEADLESS_BASE}/customers/${customer}/products?workflow=${workflow}&apiKey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Headless products API ${res.status}: ${url}`);
    return res.json() as Promise<HeadlessProductsData>;
  }

  async getConfigureJsons(params: MergedParams, product: number): Promise<ConfigureJsons> {
    const state = this.originator.getState();
    const performance = state.getPerformance();
    const logger = state.getLogger();
    performance?.processStart('JSONs');
    try {
      const urls = this.getConfigureJsonsURLs(params, product);

      const [productGraphRes, preferencesRes, uiSettingsRes] = await Promise.all([
        fetch(urls.productGraphURL),
        fetch(urls.preferencesURL),
        fetch(urls.uiSettingsURL)
      ]);

      if (!productGraphRes.ok || !preferencesRes.ok || !uiSettingsRes.ok) {
        throw new Error('error loading configure JSONs');
      }

      const [productGraph, preferences, uiSettings] = await Promise.all([
        productGraphRes.json(),
        preferencesRes.json(),
        uiSettingsRes.json()
      ]);

      return {
        productGraph,
        preferences,
        uiSettings
      };
    } catch (error) {
      logger?.log('error loading configure JSONs');
      logger?.object(error);
      throw new Error('error loading configure JSONs');
    } finally {
      performance?.processEnd('JSONs');
      performance?.logMeasure('JSONs');
    }
  }

  getConfigureJsonsURLs(params: MergedParams, product: number): ConfigureJsonsURLs {
    const { workflow, customer, locale } = params;
    const productGraphURL = `${this.CDN_FLUID_BASE_URL}/static/configs/3.13.0/prod/${workflow}/${customer}/product/${product}/graph-settings-${locale}.json`;
    const preferencesURL = `${this.CDN_FLUID_BASE_URL}/static/configs/3.13.0/prod/${workflow}/${customer}/preferences.json`;
    const uiSettingsURL = `${this.CDN_FLUID_BASE_URL}/static/configs/3.13.0/prod/${workflow}/${customer}/product/${product}/ui-settings-${locale}.json`;
    return {
      productGraphURL,
      preferencesURL,
      uiSettingsURL
    };
  }
}
