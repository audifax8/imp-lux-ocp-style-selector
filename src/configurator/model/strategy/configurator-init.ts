// =============================================================================
// configurator-init — chunk preloadeable para executePhase1
// =============================================================================
// Agrega en un único módulo todas las dependencias de inicialización del
// configurador. executePhase1 lo importa con un solo dynamic import, y el HTML
// lo declara con <link rel="modulepreload"> para que esté en caché antes de
// que la cadena React llegue a ejecutarlo.
//
// Sin este chunk: executePhase1 lanza 5 dynamic imports en paralelo en el
// momento más tardío posible (dentro de Model → useInitStrategy → strategy).
// Con este chunk: el browser descarga todo desde <head>, el import resuelve
// de caché con latencia cero.
// =============================================================================

export { getInitQueryParams } from '@/libs/helpers'
export { RTRTest } from '@/configurator/model/strategy/rtr-test'
export { Caretaker } from '@/bootstrap/state/caretaker'
export { Originator } from '@/bootstrap/state/originator'
export { LoadState } from '@/bootstrap/state/load-state'
