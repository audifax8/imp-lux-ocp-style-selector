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

export { getInitQueryParams, schedule } from '@/libs/helpers'
export { AsyncTask } from '@/models/async-task'
export { RTRAssets } from '@/models/rtr/rtr-assets'
export { RTRVersion } from '@/models/rtr/rtr-version'
export { Caretaker } from '@/configurator/bootstrap/state/caretaker'
export { Originator } from '@/configurator/bootstrap/state/originator'
export { RTRSkeleton } from '@/configurator/model/strategy/rtr-skeleton'
export { LoadingState } from '@/configurator/bootstrap/state/loading-state'
