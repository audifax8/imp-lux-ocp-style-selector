import { useEffect, useMemo, type ReactNode } from 'react';

import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { DataContext } from '@/style-selector/context/context';
import { I18nContext } from '@/style-selector/context/i18n-context';
import { StyleSelectorInitStrategy } from '@/style-selector/bootstrap/strategy';
import { useInitStyleSelectorStrategy } from '@/style-selector/bootstrap/strategy/useInitStyleSelectorStrategy';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const strategy = useMemo(() => new StyleSelectorInitStrategy(), []);
  const { phase1Data } = useInitStyleSelectorStrategy(strategy);

  useEffect(() => {
    if (phase1Data) { completeStyleSelectorPromise(); }
  }, [phase1Data])

  return (
    <DataContext.Provider value={phase1Data}>
      <I18nContext.Provider value={phase1Data?.i18n}>
        {children}
      </I18nContext.Provider>
    </DataContext.Provider>
  );
};
