import type { Brand } from '@/brands/types'
import type { GlassType } from '@/wizard/types'
import { API_BASE_URL, API_LANGUAGE, BRAND_STORE_IDS } from './config'

// ── Tipos del response de la API ────────────────────────────────────────────

export interface ApiModel {
  modelCode: string
  vendorId: string
  pageUrl: string
  promoBadge: string
  label: string
  thumbnailUrl: string
}

interface ApiCategory {
  models: ApiModel[]
  category: string
}

export interface ApiModelsResponse {
  sunglasses?: ApiCategory[]
  eyeglasses?: ApiCategory[]
}

// ── Fetch ───────────────────────────────────────────────────────────────────

export const fetchModels = async (brand: Brand): Promise<ApiModelsResponse> => {
  const storeId = BRAND_STORE_IDS[brand]
  const url = `${API_BASE_URL}/wcs/resources/store/${storeId}/remix/models?language=${API_LANGUAGE}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`)
  return res.json() as Promise<ApiModelsResponse>
}

// ── Tipos de salida ──────────────────────────────────────────────────────────

export interface ModelCategory {
  name: string
  models: ApiModel[]
}

// ── Helpers internos ─────────────────────────────────────────────────────────

const deduplicateByCode = (models: ApiModel[]): ApiModel[] => {
  const seen = new Set<string>()
  return models.filter(m => {
    if (seen.has(m.modelCode)) return false
    seen.add(m.modelCode)
    return true
  })
}

// Selecciona las ApiCategory relevantes para cada GlassType.
// kids-sunglasses → sunglasses donde category === "KIDS"
// sunglasses      → sunglasses donde category !== "KIDS"
// eyeglasses      → toda la clave eyeglasses
const rawCategoriesForType = (
  data: ApiModelsResponse,
  type: GlassType,
): { models: ApiModel[]; category: string }[] => {
  switch (type) {
    case 'sunglasses':
      return (data.sunglasses ?? []).filter(c => c.category !== 'KIDS')
    case 'eyeglasses':
      return data.eyeglasses ?? []
    case 'kids-sunglasses':
      return (data.sunglasses ?? []).filter(c => c.category === 'KIDS')
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

// Devuelve las categorías dinámicas de la API para el tipo seleccionado,
// excluyendo las que lleguen vacías. Los nombres vienen tal cual del response.
export const getCategoriesByType = (
  data: ApiModelsResponse,
  type: GlassType,
): ModelCategory[] =>
  rawCategoriesForType(data, type)
    .filter(c => c.models.length > 0)
    .map(c => ({ name: c.category, models: c.models }))

// Todos los modelos del tipo, deduplicados por modelCode (vista "All").
export const getModelsByType = (
  data: ApiModelsResponse,
  type: GlassType,
): ApiModel[] =>
  deduplicateByCode(rawCategoriesForType(data, type).flatMap(c => c.models))
