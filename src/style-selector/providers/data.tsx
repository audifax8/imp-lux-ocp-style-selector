import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchModels, type ApiModelsResponse } from '@/style-selector/api/models';
import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { activeBrand } from '@/white-label/detect'
import { DataContext } from '@/style-selector/providers/context';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ApiModelsResponse>({});
  const value = useMemo(() => (data), [data]);

  useEffect(() => {
    fetchModels(activeBrand)
      .then((data) => {
        setData(data);
        completeStyleSelectorPromise();
      })
      .catch((err: unknown) => {
        console.log(err)
      })
  }, [])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
