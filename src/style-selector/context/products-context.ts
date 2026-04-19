import { createContext, useContext } from 'react';
import type { HProduct } from '@/declarations/interfaces';

export const ProductsContext = createContext<HProduct[] | undefined>(undefined);

export const useProducts = () => useContext(ProductsContext);
