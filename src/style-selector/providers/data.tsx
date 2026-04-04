import { useEffect, useState, type ReactNode } from 'react';

import { fetchModels, mapData, type Output } from '@/style-selector/api/models';
import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { activeBrand } from '@/white-label/detect'
import { DataContext } from '@/style-selector/providers/context';


export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Output>({});

  useEffect(() => {
    fetchModels(activeBrand)
      .then((data) => {
        const mapped = mapData(data);
        setData(mapped);
        completeStyleSelectorPromise();
      })
      .catch((err: unknown) => {
        console.log(err)
      })
  }, [])

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};
