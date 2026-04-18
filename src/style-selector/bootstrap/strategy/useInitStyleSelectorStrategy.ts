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

import { useState, useEffect } from 'react';
import type { IStyleSelectorInitStrategy } from '@/declarations/interfaces';
import type { StyleSelectorInitData } from '@/declarations/interfaces';

export interface InitState {
  styleSelectorInitData: StyleSelectorInitData;
  configuratorData: StyleSelectorInitData;
  phase1Error: Error | null
  phase2Error: Error | null
}

const INITIAL_STATE: InitState = {
  styleSelectorInitData: undefined!,
  configuratorData: undefined!,
  phase1Error: null,
  phase2Error: null,
}

export const useInitStyleSelectorStrategy = (
  strategy: IStyleSelectorInitStrategy<StyleSelectorInitData, StyleSelectorInitData>,
): InitState => {
  const [state, setState] = useState<InitState>(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false

    strategy
      .loadAppData()
      .then(styleSelectorInitData => {
        if (cancelled) return
        setState(prev => ({ ...prev, styleSelectorInitData }))

        // Fase 2 arranca inmediatamente tras Fase 1 — sin bloquear
        strategy
          .preloadConfiguratorData(styleSelectorInitData)
          .then(configuratorData => {
            if (cancelled) return
            // Solo actualiza el estado si hay datos reales — evita re-render innecesario
            if (configuratorData) setState(prev => ({ ...prev, configuratorData }))
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
