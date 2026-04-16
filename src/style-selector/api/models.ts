import { i18n } from '@/models/i18n';
import { StepType } from '@/declarations/enums';

import type { Originator } from '@/configurator/model/strategy/configurator-init';
import type { Logger } from '@/models/logger';
import type { Performance } from '@/models/performance';
import type { LuxApiModel, UiSettings, FlatModel, StepWithTranslation, StyleSelectorMapped, ModelsTranslated, StyleSelectorFilter, StyleSelectorInitData } from '@/declarations/interfaces';
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

  private parseParam(): { preselectedModelType: string, preselectedModelCategory: string } {
    try {
      const { startWithStyleSelector } = this.params;
      const query = startWithStyleSelector?.split(',');
      const preselectedModelType = query && query[0]?.toLowerCase();
      const preselectedModelCategory = query && query[1]?.toLowerCase();
      return {
        preselectedModelType,
        preselectedModelCategory
      }
    } catch (e) {
      this.logger?.error('[style selector] Error parsing param');
      this.logger?.object(e);
      return {
        preselectedModelType: '',
        preselectedModelCategory: ''
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
      const mappedModels = this.mapModels(models, l10n, myDesigns, inspirations);
      const mapPreselections = this.mapPreselections(mappedModels.flatModels, mappedModels.stepsTranslated);
      this.performance?.processEnd('parseModels');
      this.performance?.logMeasure('parseModels');
      return {
        i18n: l10n,
        ...mappedModels,
        ...mapPreselections
      };
    } catch(e) {
      this.performance?.processEnd('parseModels');
      this.performance?.logMeasure('parseModels');
      this.logger?.error('[MODELS] Error');
      this.logger?.object(e);
      return undefined!;
    }
  }

  /**
   * when the filter is sent E.G: &startWithStyleSelector=sunglasses,adulti
   * @param flatModels 
   * @param stepsTranslated 
   * @returns 
   */
  private mapPreselections(flatModels?: FlatModel[], stepsTranslated?: StepWithTranslation[]): StyleSelectorFilter {
    try {
      const styleSelectorFilter = this.parseParam();
      const preselectedCategoriesFilters = flatModels?.filter(model => model.type === styleSelectorFilter.preselectedModelType);

      //It means that the filter is sent and valid, so the step is MODEL.
      const preselectedStep: StepWithTranslation | undefined
        = stepsTranslated?.find((step) => step.type === StepType.MODEL && preselectedCategoriesFilters && preselectedCategoriesFilters.length)

      const preselectedFlatModel: FlatModel | undefined
        = preselectedCategoriesFilters?.find(
          (model) => {
            const sanitized = model.category.replace(' ', '').toLowerCase();
            if (sanitized === styleSelectorFilter.preselectedModelType || sanitized === styleSelectorFilter.preselectedModelCategory) {
              return model;
            }
          }
        );

      const modelsToRender: LuxApiModel[] = preselectedFlatModel?.models || [];

      return {
        //usually is Model step
        preselectedStep,
        // Models to rendes
        modelsToRender,
        // First type 
        preselectedFlatModel,
        // Filters categories to show
        preselectedCategoriesFilters
      };
    } catch (e) {
      this.logger?.error('[MODELS] Error parsing Param');
      this.logger?.object(e);
      return {
        modelsToRender: [],
        preselectedStep: undefined,
        preselectedFlatModel: undefined,
        preselectedCategoriesFilters: []
      };
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
  private mapModels(luxModelsResponse: LuxApiModelsResponse, l10n: i18n,  myDesigns?: LuxApiModel[], inspirations?: LuxApiModel[]): StyleSelectorMapped {
    let modelsTypesKeys: string[] = [];
    const MY_DESIGN = 'my_design';
    if (myDesigns && myDesigns.length) {
      modelsTypesKeys.push(MY_DESIGN);
    }

    modelsTypesKeys = modelsTypesKeys.concat(Object.keys(luxModelsResponse));
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

    const flatModels: FlatModel[] = modelsTypesKeys.flatMap((type) => {
      const groups = luxModelsResponse[type];
      const uniqueMap = new Map<string, LuxApiModel>();
      groups?.forEach((group) => {
        group.models.forEach((model) => {
          if (!uniqueMap.has(model.modelCode)) {
            uniqueMap.set(model.modelCode, model);
          }
        });
      });

      const allModels = Array.from(uniqueMap.values());
      const allCategoryName = l10n.getLang('allLabel', 'All');
      let allCategory: FlatModel = {
        modelKey: type,
        type,
        category: allCategoryName,
        models: allModels,
      };

      if (type === MY_DESIGN && myDesigns && myDesigns.length) {
        allCategory = {
          modelKey: type,
          type,
          category: type,
          models: myDesigns,
        };
      }

      const normalCategories = groups?.map((group) => ({
        modelKey: type,
        type,
        category: group.category,
        models: group.models,
      })) ?? [];
      return [allCategory, ...normalCategories];
    });

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

    const modelsTypesTranslated: ModelsTranslated[] = modelsTypesKeys.map((name) => {
      const STUDIO_BASE_LABEL = 'style_selector_category_label_';
      const merged = STUDIO_BASE_LABEL + name;
      const translation = l10n.getLang(merged, name);
      return {
        translation,
        name,
        length: name === MY_DESIGN ? myDesigns?.length : undefined
      }
    });

    return {
      modelsTypesTranslated,
      stepsTranslated,
      flatModels,
      inspirations
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

