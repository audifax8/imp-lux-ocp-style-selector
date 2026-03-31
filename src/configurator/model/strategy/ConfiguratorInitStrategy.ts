// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IInitStrategy, InitPhase1Data, InitPhase2Data } from './types'
import { fetchPhase1Mock, fetchPhase2Mock } from './mocks'
import { Logger } from '@/models/logger'
import { Performance } from '@/models/performance'
//import type { ConfigureCore } from '@fluid.inc/yr-configure-wrapper/core';


export class ConfiguratorInitStrategy
  implements IInitStrategy<InitPhase1Data, InitPhase2Data>
{
  async executePhase1(): Promise<InitPhase1Data> {
    console.log('here');
    try {
      const { getInitQueryParams, RTRSkeleton, Caretaker, Originator, LoadingState } = await import('./configurator-init');
      const params = getInitQueryParams();
      const { showPerformance, showLogs } = params;
      const state = new LoadingState();
      state.setParams(params);
      state.setLogger(new Logger(showLogs ?? false));
      state.setPerformance(new Performance(showPerformance ?? false));
      const originator = new Originator();
      const caretaker = new Caretaker();
      originator.setState(state);
      caretaker.addMemento(originator.saveMemento());
      const rtTest = new RTRSkeleton(caretaker, originator, state);
      await rtTest.init();
    } catch (e) {
      console.log(e);
    }
    return fetchPhase1Mock()
  }

  async executePhase2(phase1Result: InitPhase1Data): Promise<InitPhase2Data> {
    try {
      console.log('here 1');
      const { getInitQueryParams, Caretaker, Originator, LoadingState } = await import('./configurator-init');
      const params = getInitQueryParams();
      const { showPerformance, showLogs } = params;
      const state = new LoadingState();
      state.setParams(params);
      state.setLogger(new Logger(showLogs ?? false));
      state.setPerformance(new Performance(showPerformance ?? false));
      const originator = new Originator();
      const caretaker = new Caretaker();
      originator.setState(state);
      caretaker.addMemento(originator.saveMemento());
      const { Core } = await import('./core');
      const core = new Core(caretaker, originator);
      core.init();
    } catch (e) {
      console.log(e);
    }
    return fetchPhase2Mock(phase1Result)
  }
}
