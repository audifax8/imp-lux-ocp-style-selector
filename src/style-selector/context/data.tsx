import { useEffect, useMemo, type ReactNode } from 'react';

import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { DataContext } from '@/style-selector/context/context';
import { I18nContext } from '@/style-selector/context/i18n-context';
import { StyleSelectorInitStrategy } from '@/style-selector/bootstrap/strategy';
import { useInitStyleSelectorStrategy } from '@/style-selector/bootstrap/strategy/useInitStyleSelectorStrategy';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const strategy = useMemo(() => new StyleSelectorInitStrategy(), []);
  const { styleSelectorInitData } = useInitStyleSelectorStrategy(strategy);

  // Prefetch del chunk de UI en paralelo con los fetches de la API.
  // Cuando los datos llegan, el módulo ya está cacheado → completeStyleSelectorPromise
  // lo resuelve de inmediato sin waterfall adicional.
  useEffect(() => {
    import('@/style-selector/bootstrap/App').catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (styleSelectorInitData) { completeStyleSelectorPromise(); }
  }, [styleSelectorInitData])

  return (
    <DataContext.Provider value={styleSelectorInitData}>
      <I18nContext.Provider value={styleSelectorInitData?.i18n}>
        {children}
      </I18nContext.Provider>
    </DataContext.Provider>
  );
};
