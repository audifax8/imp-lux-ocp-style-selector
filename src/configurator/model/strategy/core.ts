import type { ConfigureCore } from '@fluid.inc/yr-configure-wrapper/core';
import type { ConfigureJsons, ConfigureJsonsURLs, MergedParams } from '@/declarations/types';
//import type { i18n } from '@/models/i18n';
//import type { Overrides } from '@/models/overrides';
//import type { Originator, Caretaker, LoadState } from '@/bootstrap/state';
//import { CheckPointType } from '@/declarations/enums';
import { AsyncTask } from '@/models/async-task';

import type { Caretaker } from '@/configurator/bootstrap/state/caretaker';
import type { Originator } from '@/configurator/bootstrap/state/originator';
import { CheckPointType } from '@/declarations/enums';
import type { Overrides } from '@/models/overrides';
//import { ApisFactory } from '@/factory/apis-factory';

/*import type { LuxAPI } from '@/models/lux';
import { updateUIStore } from '@/state/actions/ui';
import { updateAPIStore } from '@/state/actions/apis';
import type { APIsState } from '@/store/APIsStore';
import { useUIStore, type UIState } from '@/store/UIStore';
import { completeLayoutPromise, completeMenuPromise } from '@/lazy-imports';*/
//import { registerDependency } from '@/context/dependencies-apis';
//import type { Dependencies } from '@/declarations/interfaces';
//import { initPriceStore, updatePrice } from '@/store/PriceStore';

export abstract class InitBaseMethods {
  //abstract createCore(measureName: string, overrides?: Overrides): Promise<ConfigureCore>;
  abstract createCore(measureName: string): Promise<ConfigureCore>;
  abstract getConfigureJsons(params: MergedParams): Promise<ConfigureJsons>;
  abstract getConfigureJsonsURLs(params: MergedParams): ConfigureJsonsURLs;
  //abstract getProductOverrides(): Promise<Overrides>;
}

export class Core extends AsyncTask implements InitBaseMethods {
  protected CDN_FLUID_BASE_URL = 'https://cdn-prod.fluidconfigure.com';
  protected FLUID_BASE_URL = 'https://prod.fluidconfigure.com';
  protected HEADLESS_URL = 'https://cdn-prod-ingress.fluidconfigure.com/headless/graphql';
  protected caretaker: Caretaker = undefined!;
  protected originator: Originator = undefined!;
  protected rtrDisabled: boolean = true;

  constructor(caretaker: Caretaker, originator: Originator) {
    super();
    this.caretaker = caretaker;
    this.originator = originator;
    const state = originator.getState();
    const params = state.getParams();
    if (params.yrEnv) {
      window.caretaker = this.caretaker;
    }
    if (params.darkMode) {
      //this.updateUIState({ theme: Theme.DARK });
    }
  }

  /*
  protected updateAPIState(newApiState: APIsState) {
    return updateAPIStore(newApiState);
  }

  protected updateUIState(newUIState: UIState) {
    return updateUIStore(newUIState);
  }

  protected resolveLayoutPromise() {
    this.resolveMenuPromise();
    return completeLayoutPromise();
  }

  protected resolveMenuPromise() {
    const { isMobile, menuLoaded } = useUIStore.getState();
    if (!menuLoaded) {
      if (!isMobile) {
        completeMenuPromise();
      }
      this.updateUIState({ showSkeleton: false });
    }
  }

  protected registerDependency<K extends keyof Dependencies>(key: K, value: Dependencies[K]) {
    return registerDependency(key, value);
  }
  */

  /*
  protected initBase(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.runMicrotask(async () => {
        try {
          const { core, i18n, configureJsons } = await this.initBaseApi();

          /*this.registerDependency('i18n', i18n);
          this.registerDependency('core', core);
          this.registerDependency('luxApi', luxApi);
          this.registerDependency('configureJsons', configureJsons);
          initPriceStore();

          const state = this.originator.getState();
          const newState = state.clone({
            //luxApi,
            core,
            i18n,
            configureJsons,
            checkPoint: CheckPointType.CORE
          });

          this.originator.setState(newState);
          this.caretaker.addMemento(this.originator.saveMemento());

          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    });
  }*/

  /*
  protected initOverrides(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.runIdle(async () => {
        try {
          const { overrides, core } = await this.loadOverrides();
          const checkPoint = CheckPointType.OVERRIDES;
          const state = this.originator.getState();
          const luxApi = state.getLuxApi();
          luxApi.setCore(core);
          const newState = state.clone({ overrides, core, luxApi, checkPoint });
          this.originator.setState(newState);
          this.caretaker.addMemento(this.originator.saveMemento());
          this.registerDependency('core', core);
          this.registerDependency('overrides', overrides);
          this.registerDependency('luxApi', luxApi);
          updatePrice();

          resolve(true);
        } catch (error) {
          reject(error);
        }
      });
    });
  }*/

  public async init(): Promise<void> {
    const state = this.originator.getState();
    const logger = state.getLogger();
    const performance = state.getPerformance();
    const params = state.getParams();
    performance?.processStart('initCore');
    try {
      const configureJsons = await this.getConfigureJsons(params);
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
      const coreWithOla = await this.createCore('ApplyOverrides', overrides);
      console.log({ coreWithOla });
    } catch (e) {
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
      //this.resolveLayoutPromise();
      //this.loadVM();
      const { skipOla } = params;
      if (skipOla) {
        performance?.processEnd('initDefault');
        performance?.logMeasure('initDefault');
        return;
      }
      //await this.initOverrides();
    } catch (e) {
      logger?.object(e);
    }
  }

  /*
  initBaseApi(): Promise<{
    core: ConfigureCore;
    i18n: i18n;
    luxApi: LuxAPI;
    configureJsons: ConfigureJsons;
  }> {
    return new Promise((resolve, reject) => {
      const state = this.originator.getState();
      const params = state.getParams();

      this.runMicrotask(async () => {
        try {
          const configureJsons = await this.getConfigureJsons(params);
          const i18n = await state.getObjectsFactory()?.buildI18n(configureJsons.uiSettings);
          const newState = state.clone({
            configureJsons,
            i18n,
            checkPoint: CheckPointType.JSON
          });

          this.originator.setState(newState);
          this.caretaker.addMemento(this.originator.saveMemento());

          const core = await this.createCore('CreatingConfigure');
          const apisFactory = new ApisFactory();
          const luxApi = (await apisFactory.buildLuxByCustomerId(
            core,
            params,
            state.getLogger(),
            state.getPerformance()
          )) as LuxAPI;
          luxApi.loadFonts();

          resolve({ core, luxApi, i18n, configureJsons });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /*
  public loadOverrides(): Promise<{ overrides: Overrides; core: ConfigureCore }> {
    return new Promise((resolve, reject) => {
      this.runIdle(async () => {
        try {
          const overrides = await this.getProductOverrides();
          const core = await this.createCore('ApplyOverrides', overrides);
          resolve({ overrides, core });
        } catch (error) {
          reject(error);
        }
      });
    });
  }*/

  public destroy() {
    //this.timeOuts.forEach((tOut) => clearTimeout(tOut));
  }

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

  async getConfigureJsons(params: MergedParams): Promise<ConfigureJsons> {
    const state = this.originator.getState();
    const performance = state.getPerformance();
    const logger = state.getLogger();
    performance?.processStart('JSONs');
    try {
      const urls = this.getConfigureJsonsURLs(params);

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

  getConfigureJsonsURLs(params: MergedParams): ConfigureJsonsURLs {
    const { workflow, customer, product, locale } = params;
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
