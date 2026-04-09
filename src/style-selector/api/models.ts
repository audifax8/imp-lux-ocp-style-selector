import type { Brand } from '@/white-label/types'
import type { GlassType } from '@/style-selector/types'
import { API_LANGUAGE, BRAND_URLS } from '@/style-selector/api/config'
import type { MergedParams } from '@/declarations/types'
import { i18n } from '@/models/i18n';

// ── Tipos del response de la API ────────────────────────────────────────────

export interface ApiModel {
  modelCode: string
  vendorId: string
  pageUrl: string
  promoBadge?: string
  label: string
  thumbnailUrl?: string
  recipeId?: number;
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
  promoBadge?: string;
  label: string;
  thumbnailUrl?: string;
  recipeId?: number;
};

export type CategoryGroup = {
  category: string;
  models: Model[];
};

export type InputData = Record<string, CategoryGroup[]>;

export type Output = {
  types?: string[];
  categories?: Category[];
  inspirations?: ApiModel[];
};

export type Category = {
  type: string;
  category: string;
  models: Model[] |  ApiModel[];
  length?: number;
};

export function mapData(data: InputData): Output {
  const types = Object.keys(data);

  const categories = types.flatMap((type) => {
    const groups = data[type];
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

export function mapData2(data: InputData, myDesigns?: ApiModel[], inspirations?: ApiModel[]): Output {
  const types = Object.keys(data);

  const categories: Category[] = types.flatMap((type) => {
    const groups = data[type];
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

    const normalCategories = groups.map((group) => ({
      type,
      category: group.category,
      models: group.models,
    }));

    return [allCategory, ...normalCategories];
  });

  if (myDesigns && myDesigns.length) {
    types.push('my designs');
    categories.push({
      type: 'myDesigns',      
      category: 'myDesigns',
      models: myDesigns,
      length: myDesigns.length
    });
  }

  return {
    types,
    categories,
    inspirations
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

export const fetchUiSetting = async (url: string): Promise<InputData> => {
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

export class Models {
  private params: MergedParams = undefined!;
  private uiSettingsURL: string =
    '//cdn-prod.fluidconfigure.com/static/configs/3.13.0/prod/_workflow_/_customer_/product/_product_/ui-settings-_locale_.json';
  //private SUNGLASSES_CATEGORY_LABEL: string = 'sunglasses';
  //private EYEGLASSES_CATEGORY_LABEL: string = 'eyeglasses';

  //private l10n: i18n = undefined!;

  constructor(params: MergedParams) {
    this.params = params;
  }

  public async init(): Promise<void> {
    try {
      Promise.all([
        this.getModels(),
        this.getUiSettings(),
        this.getMyDesigns(),
        this.getInspirationsDesigns()
      ]).then(([models, uiSetting, myDesigns, inspirations]) => {
        const l10n = new i18n(uiSetting);
        const mapped = this.mapModels(models, myDesigns, inspirations);
        console.log({ models, uiSetting, l10n, myDesigns, inspirations, mapped });
      }).catch((e) => console.log(e));
    } catch(e) {
      console.log(e);
    }
  }

  private mapModels(models: InputData, myDesigns?: ApiModel[], inspirations?: ApiModel[]) {
    return mapData2(models, myDesigns, inspirations);
  }

  private getUiSettingsUrl(): string {
    const { workflow, customer, product, locale } = this.params;
    const lo = locale?.toString() || 'en_US'
    const url = this.uiSettingsURL
      .replace('_workflow_', workflow)
      .replace('_customer_', customer.toString())
      .replace('_product_', product.toString())
      .replace('_locale_', lo);
    console.log({ url });
    return url;
  }

  private async getUiSettings(): Promise<unknown> {
    const url = this.getUiSettingsUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`);
    return res.json() as Promise<unknown>
  }

  private getModelsUrl(): string {
    const { endpoint, lang } = this.params;
    console.log({ endpoint, lang });
    return endpoint + lang;
  }

  private async getModels(): Promise<InputData> {
    const url = this.getModelsUrl();
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`)
    return res.json() as Promise<InputData>
  }

  private getMyDesigns(): Promise<ApiModel[]> {
    //TODO
    const myDesignsModels: ApiModel[] =  [
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482"
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424"
      },
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482"
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424"
      }
    ];
    return new Promise((resolve) => resolve(myDesignsModels))
  }

  private getInspirationsDesigns(): Promise<ApiModel[]> {
    //TODO
    const myDesignsModels: ApiModel[] =  [
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482"
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424"
      },
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482"
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424"
      }
    ];
    return new Promise((resolve) => resolve(myDesignsModels))
  }
}

