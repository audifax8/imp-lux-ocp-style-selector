import { BaseStrategy } from './base';
import type { Caretaker } from '@/bootstrap/state/caretaker';
import type { LoadState } from '@/bootstrap/state/load-state';
import type { Originator } from '@/bootstrap/state/originator';

import { RTRVersion } from '@/models/rtr/rtr-version';
import type { RTRAssets } from '@/models/rtr/rtr-assets';

import { RTRBackground } from '@/declarations/enums';
import type { MergedParams } from '@/declarations/types';

export class RTRTest extends BaseStrategy {
  protected rtrAssets: RTRAssets = undefined!;
  private version: string = undefined!;
  private rtrVersion: RTRVersion = undefined!;

  constructor(caretaker: Caretaker, originator: Originator, state: LoadState) {
    super(caretaker, originator);
    this.version = this.getRTRVersion();
    this.rtrVersion = new RTRVersion(this.version, state.getLogger(), state.getPerformance());
  }

  private getRTRVersion(): string {
    const params = this.originator.getState().getParams();
    const { rtrVersion } = params;
    if (rtrVersion) {
      return rtrVersion;
    }
    const DEFAULT_RTR_VERSION = '7.2.2';
    return DEFAULT_RTR_VERSION;
  }

  override async init(): Promise<void> {
    const state = this.originator.getState();
    const logger = state.getLogger();
    const performance = state.getPerformance();
    try {
      this.loadRTRAssets();
      performance?.processStart('initRTR');
      await this.initRTR();
      performance?.processEnd('initRTR');
      performance?.logMeasure('initRTR');
    } catch (e) {
      logger?.error('[Error]');
      logger?.object(e);
    }
  }

  async loadRTRAssets(): Promise<undefined> {
    const state = this.originator.getState();
    const logger = state.getLogger();
    const performance = state.getPerformance();
    //const objectsFactory = state.getObjectsFactory();
    this.runMicrotask(async () => {
      try {
        performance?.processStart('loadRTRAssets');
        //TODO it needs to be sent by configure params
        const vendorIdSize = '0RB2140CP50';
        const rtrAssetsURL = this.rtrVersion.getAssetsURL(vendorIdSize);
        const response = await fetch(rtrAssetsURL);
        console.log({ response });
        //const assets = await response.json();

        //const rtrAssets = await objectsFactory?.buildRTRAssets();
        //rtrAssets?.setRTRAssets(assets);
        //rtrAssets?.setQuickLink(window.quicklink);
        //rtrAssets?.prefetchListStartup();

        //this.rtrAssets = rtrAssets;
        //this.registerDependency('rtrAssets', rtrAssets);
        performance?.processEnd('loadRTRAssets');
        performance?.logMeasure('loadRTRAssets');
        return true;
      } catch (e) {
        performance?.processEnd('loadRTRAssets');
        logger?.error('');
        logger?.object(e);
        return false;
      }
    });
  }

  public getBackGround(params: MergedParams): RTRBackground {
    if (params.darkMode) {
      return RTRBackground.DARK;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? RTRBackground.DARK : RTRBackground.LIGHT;
  }

  async initRTR() {
    const state = this.originator.getState();
    const logger = state.getLogger();
    try {
      const params = state.getParams();
      if (params.rtrDisabled) {
        return false;
      }
      //TODO this needs to be provided by Lux
      const DEFAULT_TOKEN =
        'TKN~0RB2140CP~2RB2140J61_901...AA~2AJ3031111_901...AA~NULL~1RB0050L020_GRIDFK~NULL~RBCP..50';
      const token = DEFAULT_TOKEN;
      await this.rtrVersion.downloadScript();
      this.rtrVersion.setAPI();
      await this.runAnimation(async () => {
        const background = this.getBackGround(params);
        const initResult = await this.rtrVersion.init(token, background);
        if (!initResult) {
          throw new Error('[RTR] init failed');
        }
        /*this.updateUIState({ token, showSkeleton: false });
        this.updateAPIState({
          rtrApiReady: true,
          rtrOn: true,
          rtrDisabled: false
        });*/
      });
      return true;
    } catch (e) {
      logger?.error('[RTR] init failed');
      logger?.object(e);
      return false;
    }
  }
}
