export const BRANDS = ['rbn', 'oak', 'sgh', 'bliz', 'cdm'] as const
export type Brand = (typeof BRANDS)[number]
