import type { StyleSelectorInitData } from '@/declarations/interfaces';
import { createContext, useContext } from 'react';

const data: StyleSelectorInitData = undefined!;
export const DataContext = createContext(data);

export const useData = () => useContext(DataContext)