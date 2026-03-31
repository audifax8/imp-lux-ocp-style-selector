// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IInitStrategy, InitPhase1Data, InitPhase2Data } from './types'
import type { Caretaker } from '@/configurator/bootstrap/state/caretaker'
import type { Originator } from '@/configurator/bootstrap/state/originator'
import { fetchPhase1Mock, fetchPhase2Mock } from './mocks'
import { Logger } from '@/models/logger'
import { Performance } from '@/models/performance'

export class ConfiguratorInitStrategy
  implements IInitStrategy<InitPhase1Data, InitPhase2Data>
{
  private caretaker: Caretaker | undefined
  private originator: Originator | undefined

  async executePhase1(): Promise<InitPhase1Data> {
    try {
      console.log('here 123');
      const { getInitQueryParams, RTRSkeleton, Caretaker, Originator, LoadingState } = await import('./configurator-init');
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
      const rtTest = new RTRSkeleton(this.caretaker, this.originator, state);
      await rtTest.init();
    } catch (e) {
      console.log(e);
    }
    return fetchPhase1Mock()
  }

  async executePhase2(phase1Result: InitPhase1Data): Promise<InitPhase2Data> {
    try {
      console.log('here 1');
      if (!this.caretaker || !this.originator) {
        throw new Error('executePhase1 must complete before executePhase2');
      }
      const { Core } = await import('./core');
      const core = new Core(this.caretaker, this.originator);
      core.init();
    } catch (e) {
      console.log(e);
    }
    return fetchPhase2Mock(phase1Result)
  }
}
