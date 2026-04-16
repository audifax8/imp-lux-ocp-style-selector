import { createContext, useContext } from 'react';
import type { StyleSelectorInitData } from '@/declarations/interfaces';

const data: StyleSelectorInitData = undefined!;
export const DataContext = createContext(data);

export const useData = () => useContext(DataContext)