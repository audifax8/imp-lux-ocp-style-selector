import { BaseStrategy } from './base';
import type { Caretaker } from '@/configurator/bootstrap/state/caretaker';
import type { LoadingState } from '@/configurator/bootstrap/state/loading-state';
import type { Originator } from '@/configurator/bootstrap/state/originator';

import { RTRVersion } from '@/models/rtr/rtr-version';
import { RTRAssets } from '@/models/rtr/rtr-assets';

import { RTRBackground } from '@/declarations/enums';
import type { MergedParams } from '@/declarations/types';

export class RTRSkeleton extends BaseStrategy {
  protected rtrAssets: RTRAssets = undefined!;
  private rtrVersion: RTRVersion = undefined!;

  constructor(caretaker: Caretaker, originator: Originator, state: LoadingState) {
    super(caretaker, originator);
    const params = this.originator?.getState()?.getParams();
    this.rtrVersion = new RTRVersion(params, state.getLogger(), state.getPerformance());
  }

  override async init(): Promise<boolean> {
    const state = this.originator.getState();
    const logger = state.getLogger();
    const performance = state.getPerformance();
    try {
      performance?.processStart('initRTR');
      await this.initRTR();
      performance?.processEnd('initRTR');
      performance?.logMeasure('initRTR');
      return true;
    } catch (e) {
      logger?.error('[Error]');
      logger?.object(e);
      performance?.processEnd('initRTR');
      performance?.logMeasure('initRTR');
      return false;
    }
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
      this.rtrAssets = new RTRAssets(this.originator);
      await Promise.all([
        this.rtrVersion.downloadScript(),
        this.rtrAssets.downloadRTRAssets()
      ]);
      this.rtrVersion.setAPI();
      await this.runAnimation(async () => {
        const background = this.getBackGround(params);
        const initResult = await this.rtrVersion.init(token, background);;
        if (!initResult) {
          throw new Error('[RTR] init failed');
        }
      });
      return true;
    } catch (e) {
      logger?.error('[RTR] init failed');
      logger?.object(e);
      return false;
    }
  }
}
