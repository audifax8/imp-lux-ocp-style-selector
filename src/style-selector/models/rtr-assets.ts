import type { QuickLink, RtrAssetsAPI } from '@/declarations/interfaces';
import type { Originator } from '@/style-selector/bootstrap/state/originator';
import { AsyncTask } from '@/models/async-task';

export class RTRAssets extends AsyncTask {
  private assets: RtrAssetsAPI = undefined!;
  private assetsAlreadePreloaded: string[] = [];
  private quickLink: QuickLink = undefined!;
  protected originator: Originator = undefined!;
  private RTR_ASSETS_URL = 'https://cp.luxottica.com/public/v1/prefetch/_vendorId_?qa=_rtrQa_';
  private miniProduct = 'https://cdn-prod.fluidconfigure.com/static/fluid-implementation-lux.s3.amazonaws.com/lux-ocp/rbn/_workflow_/products/_vendorId_.json';


  constructor(originator: Originator) {
    super();
    this.originator = originator;
  }

  public getAssetsURL(rtrVendorId: string): string {
    const assetsURL = this.RTR_ASSETS_URL.replace('_vendorId_', rtrVendorId).replace('_rtrQa_', 'false');
    return assetsURL;
  }

  public getMiniProductsURL(workflow: string, rtrVendorId: string): string {
    const assetsURL = this.miniProduct.replace('_workflow_', workflow).replace('_vendorId_', rtrVendorId);
    return assetsURL;
  }

  async downloadRTRAssets() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const state = this.originator.getState();
      //const params = state.getParams();
      const logger = state.getLogger();
      const performance = state.getPerformance();
      //const objectsFactory = state.getObjectsFactory();
      this.runMicrotask(async () => {
        try {
          /*const { vendorId, workflow } = params;
          const miniproductUrl = this.getMiniProductsURL(workflow, vendorId);
          performance?.processStart('loadMiniProduct');
          const miniProductResponse = await fetch(miniproductUrl);
          if (!miniProductResponse.ok) {
            performance?.processEnd('loadMiniProduct');
            logger?.error('[RTR ASSETS] Error loading assets');
            return reject(false);
          }
          const miniProduct = await miniProductResponse.json();
          performance?.processEnd('loadMiniProduct');
          performance?.logMeasure('loadMiniProduct');
          const { vendorIdSize } = miniProduct;*/

          const vendorIdSize = '0RB2140CP50';
          const rtrAssetsURL = this.getAssetsURL(vendorIdSize);
          console.log({ rtrAssetsURL });
          performance?.processStart('loadRTRAssets');
          const response = await fetch(rtrAssetsURL);
          if (!response.ok) {
            performance?.processEnd('loadRTRAssets');
            logger?.error('[RTR ASSETS] Error loading assets');
            return reject(false);
          }
          const assets = await response.json();

          //const rtrAssets = await objectsFactory?.buildRTRAssets();
          //rtrAssets?.setRTRAssets(assets);
          this.setQuickLink(window.quicklink);
          this.prefetchListStartup();

          this.assets = assets;
          //this.registerDependency('rtrAssets', rtrAssets);
          performance?.processEnd('loadRTRAssets');
          performance?.logMeasure('loadRTRAssets');
          return resolve(true);
        } catch (e) {
          performance?.processEnd('loadRTRAssets');
          logger?.error('');
          logger?.object(e);
          return reject(false);
        }
      });
    });
  }
  public addAssetsAlreadyPreloaded(assetName: string): void {
    this.assetsAlreadePreloaded.push(assetName);
  }

  public setRTRAssets(assets: RtrAssetsAPI): void {
    this.assets = assets;
  }

  public isAssetAlreadyPreloaded(assetName: string): boolean {
    return this.assetsAlreadePreloaded.find((asset) => asset === assetName) ? true : false;
  }

  public setQuickLink(quickLink: QuickLink): void {
    this.quickLink = quickLink;
  }

  public prefetchListStartup(): void {
    this.prefetch(this.assets?.prefetchListStartup);
  }

  public prefetchByKeyName(keyName: string): void {
    const isAlreadyDownloaded = this.assetsAlreadePreloaded?.find((name) => name === keyName);
    if (isAlreadyDownloaded) {
      return;
    }
    const urls = this.assets?.prefetchListConfigurableAttributes?.[keyName];
    if (urls?.length) {
      this.assetsAlreadePreloaded?.push(keyName);
      this.quickLink?.prefetch(urls, false, true);
    }
  }

  private prefetch(URLs: string[]): void {
    this.quickLink?.prefetch(URLs, false, true);
  }
}
