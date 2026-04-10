import type { Brand } from '@/white-label/types'
import type { GlassType } from '@/style-selector/types'
import { API_LANGUAGE, BRAND_URLS } from '@/style-selector/api/config'
import type { MergedParams } from '@/declarations/types'
import { i18n } from '@/models/i18n';
import type { Originator } from '@/configurator/model/strategy/configurator-init';
import type { Logger } from '@/models/logger';
import type { Performance } from '@/models/performance';

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
  typesTranslated?: Translated[];
  categories?: Category[];
  inspirations?: ApiModel[];
  l10n?: i18n;
  steps?: Step[]
};

export type Category = {
  type: string;
  category: string;
  models: Model[] |  ApiModel[];
  length?: number;
};

interface Translated {
  type: string;
  translation: string;
  length?: number;
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

  private logger: Logger | undefined = undefined!;
  private performance: Performance | undefined = undefined!;

  constructor(params: MergedParams, originator?: Originator) {
    this.params = params;
    const state = originator?.getState();
    this.logger = state?.getLogger();
    this.performance = state?.getPerformance();
  }

  public async init(): Promise<Output> {
    try {
      this.performance?.processStart('parseModels');
      const [ models, uiSetting, myDesigns, inspirations ] = await Promise.all([
        this.getModels(),
        this.getUiSettings(),
        this.getMyDesigns(),
        this.getInspirationsDesigns()
      ]);
      const l10n = new i18n(uiSetting);
      const mappedModels =  this.mapModels(models, l10n, myDesigns, inspirations);
      this.performance?.processEnd('parseModels');
      this.performance?.logMeasure('parseModels');
      return mappedModels;
    } catch(e) {
      this.performance?.processEnd('parseModels');
      this.performance?.logMeasure('parseModels');
      this.logger?.error('[MODELS] Error');
      this.logger?.object(e);
      return {};
    }
  }

  private mapModels(models: InputData, l10n: i18n,  myDesigns?: ApiModel[], inspirations?: ApiModel[]): Output {
    const types: string[] = Object.keys(models);
    let typesTranslated: Translated[] = [];

    const categories: Category[] = types.flatMap((type) => {
      const groups = models[type];
      const uniqueMap = new Map<string, Model>();
      groups.forEach((group) => {
        group.models.forEach((model) => {
          if (!uniqueMap.has(model.modelCode)) {
            uniqueMap.set(model.modelCode, model);
          }
        });
      });

      const allModels = Array.from(uniqueMap.values());
      const allCategoryName = l10n.getLang('allLabel', 'All');
      const allCategory = {
        type,
        category: allCategoryName,
        models: allModels,
      };

      const normalCategories = groups.map((group) => ({
        type,
        category: group.category,
        models: group.models,
      }));

      return [allCategory, ...normalCategories];
    });

    const MY_DESIGN = 'myDesign';
    if (myDesigns && myDesigns.length) {
      types.push(MY_DESIGN);
      const myDesignName = l10n.getLang(MY_DESIGN, MY_DESIGN);
      categories.push({
        type: MY_DESIGN,      
        category: myDesignName,
        models: myDesigns,
        length: myDesigns.length
      });
    }

    typesTranslated = types.map((type: string) => {
      //const studioLabel = 'styleSelectorCategoryLabel';
      const studioLabel = 'style_selector_category_label_';
      const merged = studioLabel + type;
      const translation = l10n.getLang(merged, type);

      const translated: Translated = {
        type,
        translation
      };
      if (type === MY_DESIGN && myDesigns?.length) {
        translated.length = myDesigns?.length;
      }
      return translated;
    });

    const DEFAULT_STEPS: Step[] = [
      {
        id: 0,
        name: 'type'
      },
      {
        id: 1,
        name: 'model'
      },
      /*{
        id: 2,
        name: 'inspiration'
      }*/
    ];

    const steps = DEFAULT_STEPS.map(({ id, name }) => {
      const studioLabel = 'style_selector_category_label_';
      const merged = studioLabel + name;
      const translation = l10n.getLang(merged, name);
      return {
        id,
        name: translation
      };
    });

    if (inspirations && inspirations.length) {
      const name = 'inspirations';
      const studioLabel = 'style_selector_category_label_';
      const merged = studioLabel + name;
      const translation = l10n.getLang(merged, name);
      steps.push(
        {
          id: steps.length,
          name: translation
        }
      );
    }

    return {
      l10n,
      types,
      categories,
      inspirations,
      typesTranslated,
      steps
    };
  }

  private getUiSettingsUrl(): string {
    const { workflow, customer, product, locale } = this.params;
    const url = this.uiSettingsURL
      .replace('_workflow_', workflow)
      .replace('_customer_', customer.toString())
      .replace('_product_', product.toString())
      .replace('_locale_', locale?.toString());
    return url;
  }

  private async getUiSettings(): Promise<unknown> {
    this.performance?.processStart('getUiSettings');
    const url = this.getUiSettingsUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`);
    this.performance?.processEnd('getUiSettings');
    this.performance?.logMeasure('getUiSettings');
    return res.json() as Promise<unknown>
  }

  private getModelsUrl(): string {
    const { endpoint, lang, store } = this.params;

    const replaceStore = (urlBase: string, store: string) => {
      return urlBase.replace(/store\/\d+/, `store/${store}`);
    }
    let url = endpoint;
    if (store) {
      url = replaceStore(url, store);
    }
    return url + lang;
  }

  private async getModels(): Promise<InputData> {
    this.performance?.processStart('getModels');
    const url = this.getModelsUrl();
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`)
    this.performance?.processEnd('getModels');
    this.performance?.logMeasure('getModels');
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

