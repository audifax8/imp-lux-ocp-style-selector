import type { Brand } from "@/declarations/types";

const param = new URLSearchParams(window.location.search).get('tokenVersion');
export const activeTokenVersion: string = param ?? '1.0';


export const SKIN_NAME: Record<Brand, string> = {
  rbn: 'ray-ban',
  oak: 'whitelabel',
  sgh: 'whitelabel',
  bliz: 'whitelabel',
  cdm: 'whitelabel',
  whitelabel: 'whitelabel'
};