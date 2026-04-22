import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { ConfigureInitParams, ConfigureParams, LuxApiCategory, ScriptResult } from '@/declarations/interfaces';

export type GraphSettings = {
  edgeGroups: unknown;
  vertices: unknown;
};

export type Preferences = {
  apiKey: string;
  apiVersion: string;
  licenseeKey: string;
  name: string;
  version: number;
  locales: unknown;
};

export type UISettings = {
  globals: unknown;
};

export type ConfigureJsons = {
  productGraph: GraphSettings;
  preferences: Preferences;
  uiSettings: UISettings;
};

export type ConfigureJsonsURLs = {
  productGraphURL: string;
  preferencesURL: string;
  uiSettingsURL: string;
};

export type ScriptType = {
  time: string;
  status: boolean;
};

export type MergedParams = ConfigureInitParams & ConfigureParams;

export type KeyString<T> = Record<string, T>;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  children?: ReactNode;
  variant?: 'rounded' | 'square';
  className?: string;
  showSkeleton?: boolean;
  onResourceResult?: (result: ScriptResult) => void;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export type LuxApiModelsResponse = Record<string, LuxApiCategory[]>;

export const BRANDS = ['rbn', 'oak', 'sgh', 'bliz', 'cdm', 'whitelabel'] as const;
export type Brand = (typeof BRANDS)[number];
