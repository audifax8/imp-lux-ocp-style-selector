import { createContext, useContext } from 'react';
import type { Output } from '@/style-selector/api/models';

const data: Output = {};
export const DataContext = createContext(data);

export const useData = () => useContext(DataContext)