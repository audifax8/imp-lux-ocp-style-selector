// =============================================================================
// Mocks — simulan las llamadas a APIs externas
// =============================================================================

import type { Output } from '@/style-selector/api/models'
import type { InitPhase1Data, InitPhase2Data } from './types'

// ── Fase 1 ────────────────────────────────────────────────────────────────────
// Datos mínimos para mostrar las gafas: modelo, colección, precio.
export const fetchPhase1Mock = (): Promise<InitPhase1Data | Output> =>
  new Promise(resolve =>
    setTimeout(
      () =>
        resolve({
          modelId: 'RB3025',
          modelName: 'Aviator Classic',
          collection: 'Icons',
          price: '$161.00',
        }),
      900,
    ),
  )

// ── Fase 2 ────────────────────────────────────────────────────────────────────
// Enriquecimiento: recomendaciones + sesión. Solo se lanza tras Fase 1.
export const fetchPhase2Mock = (_phase1: InitPhase1Data): Promise<InitPhase2Data> =>
  new Promise(resolve =>
    setTimeout(
      () =>
        resolve({
          recommendations: [
            { id: 'RB2132', name: 'New Wayfarer' },
            { id: 'RB4105', name: 'Folding Wayfarer' },
            { id: 'RB3447', name: 'Round Metal' },
          ],
          sessionId: crypto.randomUUID(),
        }),
      600,
    ),
  )
