// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IInitStrategy } from '@/declarations/interfaces';
import type { Caretaker } from '@/style-selector/bootstrap/state/caretaker';
import type { Originator } from '@/style-selector/bootstrap/state/originator';
import type { StyleSelectorInitData } from '@/declarations/interfaces';

import { Logger } from '@/models/logger';
import { Performance } from '@/models/performance';

import { Models } from '@/style-selector/api/models';

export class StyleSelectorInitStrategy
  implements IInitStrategy<StyleSelectorInitData, StyleSelectorInitData>
{
  private caretaker: Caretaker | undefined
  private originator: Originator | undefined

  async executePhase1(): Promise<StyleSelectorInitData> {
    try {
      const { getInitQueryParams, Caretaker, Originator, LoadingState } = await import('./configurator-init');
      const params = getInitQueryParams();
      const { showPerformance, showLogs } = params;
      const state = new LoadingState();
      state.setParams(params);
      state.setLogger(new Logger(showLogs ?? false));
      state.setPerformance(new Performance(showPerformance ?? false));
      this.originator = new Originator();
      this.caretaker = new Caretaker();
      this.originator.setState(state);
      this.caretaker.addMemento(this.originator.saveMemento());
      const models = new Models(params, this.originator);
      return await models.init();
    } catch (e) {
      console.log(e);
      return undefined!;
    }
  }

  async executePhase2(styleSelectorInitData: StyleSelectorInitData): Promise<StyleSelectorInitData> {
    try {
      console.log(styleSelectorInitData);
    } catch (e) {
      console.log(e);
    }
    return undefined!;
  }
}
