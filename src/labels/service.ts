import type { Labels } from './types'
import { API_BASE_URL, API_LANGUAGE, BRAND_STORE_IDS } from '@/style-selector/api/config'
import { activeBrand } from '@/white-label/detect'

/**
 * Carga los labels del widget desde la API.
 *
 * Endpoint inferido (ajustar cuando la API esté lista):
 *   GET {API_BASE_URL}/wcs/resources/store/{storeId}/remix/labels?language={lang}
 *
 * Response esperado: objeto JSON compatible con la interfaz Labels.
 * Si la API devuelve un formato distinto, adaptar el mapeo aquí sin
 * tocar los componentes (ellos solo consumen el tipo Labels).
 */
export const fetchLabels = async (): Promise<Labels> => {
  const storeId = BRAND_STORE_IDS[activeBrand]
  const url = `${API_BASE_URL}/wcs/resources/store/${storeId}/remix/labels?language=${API_LANGUAGE}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Labels API ${res.status}: ${url}`)
  return res.json() as Promise<Labels>
}
