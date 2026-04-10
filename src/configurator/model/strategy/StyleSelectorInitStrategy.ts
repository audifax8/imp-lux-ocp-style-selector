// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IInitStrategy } from '@/configurator/model/strategy/types'
import type { Caretaker } from '@/configurator/bootstrap/state/caretaker'
import type { Originator } from '@/configurator/bootstrap/state/originator'

import { Logger } from '@/models/logger'
import { Performance } from '@/models/performance'

import { Models, type Output } from '@/style-selector/api/models';

export class StyleSelectorInitStrategy
  implements IInitStrategy<Output, Output>
{
  private caretaker: Caretaker | undefined
  private originator: Originator | undefined

  async executePhase1(): Promise<Output> {
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
      return {} as Output
    }
  }

  async executePhase2(phase1Result: Output): Promise<Output> {
    try {
      console.log(phase1Result);
    } catch (e) {
      console.log(e);
    }
    return {} as Output
  }
}
