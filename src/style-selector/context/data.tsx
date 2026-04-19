import { useEffect, useMemo, useRef, type ReactNode } from 'react';

import type { Core } from '@/style-selector/models/core';
import type { RTRSkeleton } from '@/style-selector/models/rtr-skeleton';

import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { DataContext } from '@/style-selector/context/context';
import { I18nContext } from '@/style-selector/context/i18n-context';
import { ProductsContext } from '@/style-selector/context/products-context';
import { ConfiguratorActionsContext, type ConfiguratorActions } from '@/style-selector/context/configurator-actions-context';
import { StyleSelectorInitStrategy } from '@/style-selector/bootstrap/strategy';
import { useInitStyleSelectorStrategy } from '@/style-selector/bootstrap/strategy/useInitStyleSelectorStrategy';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const strategy = useMemo(() => new StyleSelectorInitStrategy(), []);
  const { styleSelectorInitData, configuratorData } = useInitStyleSelectorStrategy(strategy);

  // Servicios de fase 2 en ref — nunca en state ni en context directamente.
  // useRef no provoca re-renders; los callbacks de abajo leen .current en tiempo de ejecución.
  const servicesRef = useRef<{ core: Core; rtrSkeleton: RTRSkeleton } | null>(null);

  useEffect(() => {
    if (configuratorData) {
      servicesRef.current = {
        core: configuratorData.core,
        rtrSkeleton: configuratorData.rtrSkeleton,
      };
    }
  }, [configuratorData]);

  // Callbacks estables (creados una sola vez) — los componentes llaman comportamiento,
  // no métodos de clase en bruto. La referencia no cambia → no genera re-renders.
  const configuratorActions = useMemo<ConfiguratorActions>(() => ({
    onModelHover: (_product) => {
      servicesRef.current?.rtrSkeleton.downLoadAssets();
    },
    onModelSelect: (_product) => {
      servicesRef.current?.core.render2D();
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // Prefetch del chunk de UI en paralelo con los fetches de la API.
  useEffect(() => {
    import('@/style-selector/bootstrap/App').catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (styleSelectorInitData) { completeStyleSelectorPromise(); }
  }, [styleSelectorInitData]);

  return (
    <ConfiguratorActionsContext.Provider value={configuratorActions}>
      <ProductsContext.Provider value={configuratorData?.data}>
        <DataContext.Provider value={styleSelectorInitData}>
          <I18nContext.Provider value={styleSelectorInitData?.i18n}>
            {children}
          </I18nContext.Provider>
        </DataContext.Provider>
      </ProductsContext.Provider>
    </ConfiguratorActionsContext.Provider>
  );
};
