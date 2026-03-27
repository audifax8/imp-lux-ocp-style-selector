// =============================================================================
// ConfiguratorInitStrategy — implementación concreta del contrato IInitStrategy
// =============================================================================

import type { IInitStrategy, InitPhase1Data, InitPhase2Data } from './types'
import { fetchPhase1Mock, fetchPhase2Mock } from './mocks'

export class ConfiguratorInitStrategy
  implements IInitStrategy<InitPhase1Data, InitPhase2Data>
{
  executePhase1(): Promise<InitPhase1Data> {
    return fetchPhase1Mock()
  }

  executePhase2(phase1Result: InitPhase1Data): Promise<InitPhase2Data> {
    return fetchPhase2Mock(phase1Result)
  }
}
