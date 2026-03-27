// =============================================================================
// Strategy pattern — contratos de inicialización del configurador
// =============================================================================

// ── Datos que retorna la Fase 1 ───────────────────────────────────────────────
// Lo mínimo necesario para pintar las gafas y el info principal.
export interface InitPhase1Data {
  modelId: string
  modelName: string
  collection: string
  price: string
}

// ── Datos que retorna la Fase 2 ───────────────────────────────────────────────
// Enriquecimiento: se carga DESPUÉS de que las gafas ya son visibles.
export interface InitPhase2Data {
  recommendations: Array<{ id: string; name: string }>
  sessionId: string
}

// ── Contrato de la estrategia ─────────────────────────────────────────────────
// P1 = resultado de la fase 1, P2 = resultado de la fase 2.
// La fase 2 recibe el resultado de la fase 1 (puede usarlo para derivar sus calls).
export interface IInitStrategy<P1, P2> {
  executePhase1(): Promise<P1>
  executePhase2(phase1Result: P1): Promise<P2>
}
