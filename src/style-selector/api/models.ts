import { i18n } from '@/models/i18n';
import { StepType } from '@/declarations/enums';

import type { Originator } from '@/configurator/model/strategy/configurator-init';
import type { Logger } from '@/models/logger';
import type { Performance } from '@/models/performance';
import type { LuxApiModel, UiSettings, ModelsCategory, StepWithTranslation, StyleSelectorInitData, ModelsTranslated } from '@/declarations/interfaces';
import type { LuxApiModelsResponse, MergedParams } from '@/declarations/types'

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
    this.parseParam();
  }

  private parseParam(): { preselectedType: string, preselectedCategory: string } {
    try {
      const { startWithStyleSelector } = this.params;
      const query = startWithStyleSelector?.split(',');
      const preselectedType = query && query[0]?.toLowerCase();
      const preselectedCategory = query && query[1]?.toLowerCase();
      return {
        preselectedType,
        preselectedCategory
      }
    } catch (e) {
      this.logger?.error('[style selector] Error parsing param');
      this.logger?.object(e);
      return {
        preselectedType: '',
        preselectedCategory: ''
      }
    }
  }

  public async init(): Promise<StyleSelectorInitData> {
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
   * @returns styleSelectorInitData
   */
  private mapModels(models: LuxApiModelsResponse, l10n: i18n,  myDesigns?: LuxApiModel[], inspirations?: LuxApiModel[]): StyleSelectorInitData {
    const modelsTypes: string[] = Object.keys(models);
    let stepsTranslated: StepWithTranslation[] = [];
    
    const DEFAULT_STEPS: StepWithTranslation[] = [
      {
        name: 'type',
        type: StepType.TYPE
      },
      {
        name: 'model',
        type: StepType.MODEL
      }
    ];

    if (inspirations && inspirations.length) {
      const name = 'inspirations';
      DEFAULT_STEPS.push(
        {
          name,
          type: StepType.INSPIRATIONS
        }
      );
    }

    const modelsMapped: ModelsCategory[] = modelsTypes.flatMap((type) => {
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
    const MY_DESIGN = 'my_design';
    if (myDesigns && myDesigns.length) {
      const STUDIO_BASE_LABEL = 'style_selector_category_label_';
      const merged = STUDIO_BASE_LABEL + MY_DESIGN;
      const translation = l10n.getLang(merged, 'my desing');
      modelsMapped.push({
        type: 'my design',      
        category: translation,
        models: myDesigns,
        length: myDesigns.length
      });

      const translated: StepWithTranslation = {
        name: MY_DESIGN,
        translation,
        id: 0
      };
      if (myDesigns?.length) {
        translated.length = myDesigns?.length;
      }
      modelsTypes.push('myDesign');
      stepsTranslated.push(translated);
    }

    stepsTranslated = DEFAULT_STEPS.map(({ name, type }, id: number) => {
      const STUDIO_BASE_LABEL = 'style_selector_category_label_';
      const merged = STUDIO_BASE_LABEL + name;
      const translation = l10n.getLang(merged, name);
      return {
        id,
        name: translation,
        type
      };
    });

    console.log({ modelsMapped });
    const styleSelectorFilter = this.parseParam();
    console.log(styleSelectorFilter);

    const preselectedCategories = modelsMapped.filter(model => model.type === styleSelectorFilter.preselectedType);
    //If the filter is sent and 
    const preselectedStep: StepWithTranslation | undefined
      = stepsTranslated?.find((step) => step.type === StepType.MODEL && preselectedCategories && preselectedCategories.length)

    const preselectedModel: ModelsCategory | undefined
      = preselectedCategories?.find(
        (model) => {
          const sanitized = model.category.replace(' ', '').toLowerCase();
          if (sanitized === styleSelectorFilter.preselectedType || sanitized === styleSelectorFilter.preselectedCategory) {
            return model;
          }
        }
      );

    const modelsTypesTranslated: ModelsTranslated[] = modelsTypes.map((name) => {
      const STUDIO_BASE_LABEL = 'style_selector_category_label_';
      const merged = STUDIO_BASE_LABEL + name;
      const translation = l10n.getLang(merged, name);
      return {
        translation,
        name
      }
    });

    const preselectedModels: LuxApiModel[]
      = preselectedModel?.models || [];

    console.log({ preselectedCategories, preselectedStep, preselectedModel, preselectedModels, modelsTypes, modelsTypesTranslated });
    /*const preselectedCategory: ModelsCategory | undefined
      = categories.find(
        (category) => {
          const sanitized = category.category.replace(' ', '').toLowerCase();
          if (sanitized === styleSelectorFilter.preselectedStep || sanitized === styleSelectorFilter.preselectedCategory) {
            return category;
          }
        }
      );
    const preselectedStep: Step | undefined
      = steps.find((step) => step.name === StepType.MODEL && styleSelectorFilter.preselectedStep);
    const preselectedCategories: ModelsCategory[]
      = categories.filter((category) => category.type?.toLowerCase() === styleSelectorFilter.preselectedStep);

    const preselectedModels: LuxApiModel[]
      = preselectedCategories?.find((category) => {
        const sanitized = category.category.replace(' ', '').toLowerCase();
        if (sanitized === styleSelectorFilter.preselectedStep || sanitized === styleSelectorFilter.preselectedCategory) {
          return category;
        }
      })?.models || [];
      */

    return {
      l10n,
      modelsTypesTranslated,
      //steps,
      //stepsTypes,
      stepsTranslated,
      categories: modelsMapped,
      inspirations,
      preselectedCategory: preselectedModel,
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
    //TO be defined
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

