import type { LuxApiModelsResponse, MergedParams } from '@/declarations/types'
import { i18n } from '@/models/i18n';
import type { Originator } from '@/configurator/model/strategy/configurator-init';
import type { Logger } from '@/models/logger';
import type { Performance } from '@/models/performance';
import type { LuxApiModel, UiSettings, Step } from '@/declarations/interfaces';
import { StepType } from '@/declarations/enums';

// ── Tipos del response de la API ────────────────────────────────────────────

export type Output = {
  stepsTypes?: string[];
  estepTypesTranslated?: Translated[];
  categories?: Category[];
  inspirations?: LuxApiModel[];
  l10n?: i18n;
  steps?: Step[],
  preselectedStep?: Step | undefined;
  preselectedCategory?: Category | undefined;
  preselectedModels?: LuxApiModel[];
  preselectedCategories?: Category[];
};

export type Category = {
  type: string;
  category: string;
  models: LuxApiModel[];
  length?: number;
};

interface Translated {
  type: string;
  translation: string;
  length?: number;
}

export class Models {
  private params: MergedParams = undefined!;
  private uiSettingsURL: string =
    '//cdn-prod.fluidconfigure.com/static/configs/3.13.0/prod/_workflow_/_customer_/product/_product_/ui-settings-_locale_.json';

  private logger: Logger | undefined = undefined!;
  private performance: Performance | undefined = undefined!;

  constructor(params: MergedParams, originator?: Originator) {
    this.params = params;
    console.log(params);
    const state = originator?.getState();
    this.logger = state?.getLogger();
    this.performance = state?.getPerformance();
    this.parseParam();
  }

  private parseParam(): { preselectedStep: string, preselectedCategory: string } {
    try {
      const { startWithStyleSelector } = this.params;
      const query = startWithStyleSelector.split(',');
      const preselectedStep = query && query[0]?.toLowerCase();
      const preselectedCategory = query && query[1]?.toLowerCase();
      return {
        preselectedCategory,
        preselectedStep
      }
    } catch (e) {
      this.logger?.error('[style selector] Error parsing param');
      this.logger?.object(e);
      return {
        preselectedCategory: '',
        preselectedStep: ''
      }
    }
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

  /**
   * function to map the Lux models API and translate labels
   * @param models 
   * @param l10n 
   * @param myDesigns 
   * @param inspirations 
   * @returns Output
   */
  private mapModels(models: LuxApiModelsResponse, l10n: i18n,  myDesigns?: LuxApiModel[], inspirations?: LuxApiModel[]): Output {
    const stepsTypes: string[] = Object.keys(models);
    const estepTypesTranslated: Translated[] = [];

    const categories: Category[] = stepsTypes.flatMap((type) => {
      const groups = models[type];
      const uniqueMap = new Map<string, LuxApiModel>();
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
      //types.push(MY_DESIGN);
      const myDesignName = l10n.getLang(MY_DESIGN, MY_DESIGN);
      categories.push({
        type: MY_DESIGN,      
        category: myDesignName,
        models: myDesigns,
        length: myDesigns.length
      });

      const translated: Translated = {
        type: MY_DESIGN,
        translation: myDesignName
      };
      if (myDesigns?.length) {
        translated.length = myDesigns?.length;
      }
      estepTypesTranslated.push(translated);
    }

    stepsTypes.forEach((type: string) => {
      //const studioLabel = 'styleSelectorCategoryLabel';
      const studioLabel = 'style_selector_category_label_';
      const merged = studioLabel + type;
      const translation = l10n.getLang(merged, type);

      const translated: Translated = {
        type,
        translation
      };
      estepTypesTranslated.push(translated);
    });

    const DEFAULT_STEPS: Step[] = [
      {
        id: 0,
        name: 'type',
        type: StepType.TYPE
      },
      {
        id: 1,
        name: 'model',
        type: StepType.MODEL
      },
      /*{
        id: 2,
        name: 'inspiration'
      }*/
    ];

    const steps: Step[] = DEFAULT_STEPS.map(({ id, name, type }) => {
      const studioLabel = 'style_selector_category_label_';
      const merged = studioLabel + name;
      const translation = l10n.getLang(merged, name);
      return {
        id,
        name: translation,
        type
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
          name: translation,
          type: StepType.INSPIRATIONS
        }
      );
    }

    const param = this.parseParam();
    console.log({ param });
    
    //TODO FIx
    const preselectedCategory: Category | undefined = categories.find((category) => category.type === param.preselectedStep && category.category?.toLowerCase() === param.preselectedCategory);
    //TODO hardcoded model
    const preselectedStep: Step | undefined = steps.find((step) => step.name === 'model' && param.preselectedStep);
    const preselectedCategories: Category[] = categories.filter((category) => category.type?.toLocaleLowerCase() === param.preselectedStep);
    const preselectedModels: LuxApiModel[] = preselectedCategory?.models ?? [];
    console.log({ preselectedCategory, preselectedStep, preselectedModels, preselectedCategories });

    return {
      l10n,
      stepsTypes,
      categories,
      inspirations,
      estepTypesTranslated,
      steps,
      preselectedCategory,
      preselectedStep,
      preselectedModels,
      preselectedCategories
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

  private async getUiSettings(): Promise<UiSettings> {
    this.performance?.processStart('getUiSettings');
    const url = this.getUiSettingsUrl();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`);
    this.performance?.processEnd('getUiSettings');
    this.performance?.logMeasure('getUiSettings');
    return res.json() as Promise<UiSettings>
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

  private async getModels(): Promise<LuxApiModelsResponse> {
    this.performance?.processStart('getModels');
    const url = this.getModelsUrl();
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Models API ${res.status}: ${url}`)
    this.performance?.processEnd('getModels');
    this.performance?.logMeasure('getModels');
    return res.json() as Promise<LuxApiModelsResponse>
  }

  private async getMyDesigns(): Promise<LuxApiModel[]> {
    const { mockMyDesigns, getMyDesign } = this.params;

    const myDesignsModels: LuxApiModel[] =  [
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/31970482/image/FFL,1.png?width=320`
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/41444424/image/FFL,1.png?width=320`
      },
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/31970482/image/FFL,1.png?width=320`
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/41444424/image/FFL,1.png?width=320`
      }
    ];
    if (mockMyDesigns) {
      return new Promise((resolve) => resolve(myDesignsModels))
    }

    const hasMyDesigns = getMyDesign && getMyDesign instanceof Function;
    if (hasMyDesigns) {
      const responseModels = await getMyDesign();
      if (responseModels.length) {
        //TODO
        // Transform my Design models
        /*
        const sanitizedMyDesignModels = responseModels.map((model) => {
          model.label = getLabelFromModels(model, models);
          model.thumbnailUrl = `https://prod.fluidconfigure.com/imagecomposer/recipe/${model.recipeId}/image/FFL,1.png?width=320`;
          return model;
        });*/
        return new Promise((resolve) => resolve(responseModels));
      }
    }
    return new Promise((resolve) => resolve([]))
  }

  /**
   * this method has not been defined yet by Lux
   * @returns 
   */
  private getInspirationsDesigns(): Promise<LuxApiModel[]> {
    const { mockInspirations } = this.params;
    if (!mockInspirations) {
      return new Promise((resolve) => resolve([]))
    } 
    //TODO
    const myDesignsModels: LuxApiModel[] =  [
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/31970482/image/FFL,1.png?width=320`
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/41444424/image/FFL,1.png?width=320`
      },
      {
        "vendorId": "0RB3025CP",
        "modelCode": "0RB3025CP",
        "label": "0RB3025CP",
        "recipeId": 31970482,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/31970482/image/FFL,1.png?width=320`
      },
      {
        "vendorId": "0RB2140CP",
        "modelCode": "0RB2140CP",
        "label": "0RB2140CP",
        "recipeId": 41444424,
        "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424",
        "thumbnailUrl": `https://prod.fluidconfigure.com/imagecomposer/recipe/41444424/image/FFL,1.png?width=320`
      }
    ];
    return new Promise((resolve) => resolve(myDesignsModels))
  }
}

