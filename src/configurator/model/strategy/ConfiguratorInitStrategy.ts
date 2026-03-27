// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IInitStrategy, InitPhase1Data, InitPhase2Data } from './types'
import { fetchPhase1Mock, fetchPhase2Mock } from './mocks'

export class ConfiguratorInitStrategy
  implements IInitStrategy<InitPhase1Data, InitPhase2Data>
{
  async executePhase1(): Promise<InitPhase1Data> {
    console.log('here');
    try {
      const [{ getInitQueryParams }, { RTRTest }, { Caretaker }, { Originator }, { LoadState }] = await Promise.all([
        import('@/libs/helpers'),
        import('@/configurator/model/strategy/rtr-test'),
        import('@/bootstrap/state/caretaker'),
        import('@/bootstrap/state/originator'),
        import('@/bootstrap/state/load-state'),
      ]);
      const params = getInitQueryParams();
      console.log({ params });
      //if (params.skeleton) return;
        //const { showPerformance, showLogs } = params;
      const state = new LoadState();
      state.setParams(params);
      const originator = new Originator();
      const caretaker = new Caretaker();
      originator.setState(state);
      caretaker.addMemento(originator.saveMemento());
      const rtTest = new RTRTest(caretaker, originator, state);
      rtTest.init();
    } catch (e) {
      console.log(e);
    }
    return fetchPhase1Mock()
  }

  executePhase2(phase1Result: InitPhase1Data): Promise<InitPhase2Data> {
    return fetchPhase2Mock(phase1Result)
  }
}
