import { useEffect, useMemo, type ReactNode } from 'react';

import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { DataContext } from '@/style-selector/context/context';
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
      {children}
    </DataContext.Provider>
  );
};
