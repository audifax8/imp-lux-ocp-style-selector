import { createContext, useContext } from 'react';
import type { ApiModelsResponse } from '@/style-selector/api/models';

const data: ApiModelsResponse = {};
export const DataContext = createContext(data);

export const useData = () => useContext(DataContext)