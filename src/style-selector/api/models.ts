import type { Brand } from '@/white-label/types'
import type { GlassType } from '@/style-selector/types'
import { API_LANGUAGE, BRAND_URLS } from '@/style-selector/api/config'

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

export interface Step {
  id: number;
  name: string;
}

export interface ApiModelsResponse {
  sunglasses?: ApiCategory[]
  eyeglasses?: ApiCategory[]
}

export type Model = {
  modelCode: string;
  vendorId: string;
  pageUrl: string;
  promoBadge: string;
  label: string;
  thumbnailUrl: string;
};

export type CategoryGroup = {
  category: string;
  models: Model[];
};

export type InputData = Record<string, CategoryGroup[]>;

export type Output = {
  types?: string[];
  categories?: Category[];
};

export type Category = {
  type: string;
  category: string;
  models: Model[];
};

export function mapData(data: InputData): Output {
  const types = Object.keys(data);

  const categories = types.flatMap((type) => {
    const groups = data[type];

    // 🔹 ALL sin duplicados (usando modelCode como clave única)
    const uniqueMap = new Map<string, Model>();

    groups.forEach((group) => {
      group.models.forEach((model) => {
        if (!uniqueMap.has(model.modelCode)) {
          uniqueMap.set(model.modelCode, model);
        }
      });
    });

    const allModels = Array.from(uniqueMap.values());

    const allCategory = {
      type,
      category: "ALL",
      models: allModels,
    };

    // 🔹 categorías normales
    const normalCategories = groups.map((group) => ({
      type,
      category: group.category,
      models: group.models,
    }));

    return [allCategory, ...normalCategories];
  });

  return {
    types,
    categories,
  };
}

// ── Fetch ───────────────────────────────────────────────────────────────────

export const fetchModels = async (brand: Brand): Promise<InputData> => {
  const brand_url = BRAND_URLS[brand]
  const url = `${brand_url + API_LANGUAGE}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`)
  return res.json() as Promise<InputData>
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
