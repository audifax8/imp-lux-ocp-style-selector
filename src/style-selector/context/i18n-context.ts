import { createContext, useContext } from 'react';
import type { i18n } from '@/models/i18n';

export const I18nContext = createContext<i18n | undefined>(undefined);

export const useI18n = () => useContext(I18nContext);
