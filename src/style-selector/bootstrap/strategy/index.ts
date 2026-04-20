// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IStyleSelectorInitStrategy, StyleSelectorConfigurator, StyleSelectorInitData } from '@/declarations/interfaces';
import type { Caretaker } from '@/style-selector/bootstrap/state/caretaker';
import type { Originator } from '@/style-selector/bootstrap/state/originator';

import { Logger } from '@/models/logger';
import { Performance } from '@/models/performance';

import { Models } from '@/style-selector/api/models';

export class StyleSelectorInitStrategy
  implements IStyleSelectorInitStrategy<StyleSelectorInitData, StyleSelectorConfigurator>
{
  private caretaker: Caretaker = undefined!;
  private originator: Originator = undefined!;
  private logger: Logger | undefined;
  private performance: Performance | undefined;

  async loadAppData(): Promise<StyleSelectorInitData> {
    const { getInitQueryParams, Caretaker, Originator, LoadingState } = await import('./configurator-init');
    const params = getInitQueryParams();
    const { showPerformance, showLogs } = params;
    const state = new LoadingState();
    this.logger = new Logger(showLogs ?? false);
    this.performance = new Performance(showPerformance ?? false);
    state.setParams(params);
    state.setLogger(this.logger);
    state.setPerformance(this.performance);
    this.originator = new Originator();
    this.caretaker = new Caretaker();
    this.originator.setState(state);
    this.caretaker.addMemento(this.originator.saveMemento());
    try {
      const models = new Models(params, this.originator);
      return await models.init();
    } catch (e) {
      this.logger?.error('');
      this.logger?.object(e);
      return undefined!;
    }
  }

  async preloadConfiguratorData(_styleSelectorInitData: StyleSelectorInitData): Promise<StyleSelectorConfigurator> {
    try {

      console.log(_styleSelectorInitData);
      const [
        { Core },
        { RTRSkeleton },
        { Overrides }
      ] = await Promise.all([
        import('@/style-selector/models/core'),
        import('@/style-selector/models/rtr-skeleton'),
        import('@/models/overrides')
     ]);
      const state = this.originator.getState();
      const params = state.getParams();
      const { vendorId } = params;
      const logger = state.getLogger();
      const performance = state.getPerformance();
      const core = new Core(this.caretaker, this.originator);
      const rtrSkeleton = new RTRSkeleton(this.caretaker, this.originator, state);
      const overrides = new Overrides(params, logger, performance);
      console.log({ overrides, vendorId });

      const [, headlessProduct] = await Promise.all([
        rtrSkeleton.downLoadAssets(),
        core.getHeadlessProducts(),
        core.loadConfigureUIScript()
        //overrides.getLuxComponents(vendorId)
      ]);
      
      return {
        data: headlessProduct.data,
        core,
        rtrSkeleton
      };
    } catch (e) {
      this.logger?.error('[StyleSelectorInitStrategy] preloadConfiguratorData error');
      this.logger?.object(e);
      return undefined!;
    }
  }
}
