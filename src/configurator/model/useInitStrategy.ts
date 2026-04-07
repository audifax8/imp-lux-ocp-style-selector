// =============================================================================
// useInitStrategy — orquesta las dos fases de inicialización del configurador
// =============================================================================
//
// Flujo:
//   1. Skeleton visible de inmediato (phase1Data === null)
//   2. Fase 1 carga en background (no bloquea el hilo principal)
//      → cuando termina: phase1Data se setea → gafas visibles
//   3. Fase 2 arranca SOLO tras Fase 1, también en background
//      → cuando termina: phase2Data se setea → datos de enriquecimiento disponibles
//
// El flag `cancelled` evita setState sobre un componente desmontado.

import { useState, useEffect } from 'react'
import type { IInitStrategy, InitPhase1Data, InitPhase2Data } from './strategy/types'
import type { Output } from '@/style-selector/api/models'

export interface InitState {
  phase1Data: InitPhase1Data | Output | null
  phase2Data: InitPhase2Data | null
  phase1Error: Error | null
  phase2Error: Error | null
}

const INITIAL_STATE: InitState = {
  phase1Data: null,
  phase2Data: null,
  phase1Error: null,
  phase2Error: null,
}

export const useInitStrategy = (
  strategy: IInitStrategy<InitPhase1Data | Output, InitPhase2Data>,
): InitState => {
  const [state, setState] = useState<InitState>(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false

    strategy
      .executePhase1()
      .then(phase1Data => {
        if (cancelled) return
        setState(prev => ({ ...prev, phase1Data }))

        // Fase 2 arranca inmediatamente tras Fase 1 — sin bloquear
        strategy
          .executePhase2(phase1Data)
          .then(phase2Data => {
            if (cancelled) return
            setState(prev => ({ ...prev, phase2Data }))
          })
          .catch(err => {
            if (cancelled) return
            setState(prev => ({ ...prev, phase2Error: err instanceof Error ? err : new Error(String(err)) }))
          })
      })
      .catch(err => {
        if (cancelled) return
        setState(prev => ({ ...prev, phase1Error: err instanceof Error ? err : new Error(String(err)) }))
      })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // strategy es estable (useMemo en el padre) — no se re-ejecuta

  return state
}
