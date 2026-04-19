import { createContext, useContext } from 'react';
import type { HProduct } from '@/declarations/interfaces';

// Callbacks derivados de los servicios Core/RTRSkeleton.
// Expone comportamiento, no instancias de clase — los componentes
// no tienen acceso directo a los servicios.
export interface ConfiguratorActions {
  /** Hover sobre una card: descarga el script RTR en background (idempotente). */
  onModelHover: (product: HProduct) => void;
  /** Selección de modelo: arranca render2D en Core. */
  onModelSelect: (product: HProduct) => void;
}

export const ConfiguratorActionsContext = createContext<ConfiguratorActions | undefined>(undefined);

export const useConfiguratorActions = () => useContext(ConfiguratorActionsContext);
