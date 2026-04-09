import { useEffect, useState, type ReactNode } from 'react';

import { fetchModels, mapData, type Output } from '@/style-selector/api/models';
import { completeStyleSelectorPromise } from '@/style-selector/lazy-imports';
import { activeBrand } from '@/white-label/detect'
import { DataContext } from '@/style-selector/context/context';
//import { i18n } from '@/models/i18n';

/*
const getLabel = (models: any, vendorId: string) => {
  let label = '';

  if (models && models.length) {
    models.forEach((category: any) => {
      const { models: innerModels } = category;

      if (innerModels && innerModels.length) {
        const model = innerModels.find((model: any) => model.vendorId === vendorId);

        if (model) {
          label = model.label;
        }
      }
    });
  }

  return label;
};
*/

/*
const getLabelFromModels = (model: any, models: any) => {
  let label = '';
  if (model && model.vendorId && models) {
    const { vendorId } = model;
    const { sunglasses } = models;
    const { eyeglasses } = models;

    label = getLabel(sunglasses, vendorId);

    if (!label) {
      label = getLabel(eyeglasses, vendorId);
    }
  }

  return label;
};
*/

/*
const CATEGORY_LABEL = 'style_selector_category_label_';
const translateModels = (l10n: any, models: any) => {
  const translatedModels: any = {};
  if (!models) {
    return null;
  }
  Object.keys(models).forEach((category) => {
    const key = l10n.getLang(CATEGORY_LABEL + category, category).toLowerCase();
    const topCategory = category;
    const modelsCategory: any[] = models[category];

    if (!modelsCategory) {
      return;
    }

    translatedModels[category] = modelsCategory.map(({ category, models }) => {
      const name = l10n.getLang(CATEGORY_LABEL + category, category);
      return {
        topCategory,
        category: name,
        models,
        translatedName: key
      };
    });
  });

  return translatedModels;
};

/*
interface MyDesignModel {
  vendorId: string;
  recipeId: number;
  pageUrl: string;
};

const myDesignsModels: MyDesignModel =  [
  {
    "vendorId": "0RB3025CP",
    "recipeId": 31970482,
    "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482"
  },
  {
    "vendorId": "0RB2140CP",
    "recipeId": 41444424,
    "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424"
  },
  {
    "vendorId": "0RB3025CP",
    "recipeId": 31970482,
    "pageUrl": "https://www.ray-ban.com/usa/customize/rb-3025-aviator-large-metal-sunglasses?recipeId=31970482"
  },
  {
    "vendorId": "0RB2140CP",
    "recipeId": 41444424,
    "pageUrl": "https://www.ray-ban.com/usa/customize/rb-2140-original-wayfarer-sunglasses?recipeId=41444424"
  }
];
*/

//const uiSettingsURL = 'https://cdn-prod.fluidconfigure.com/static/configs/3.13.0/prod/prod/1581/product/22956/ui-settings-en_US.json';
//const uiSettingsURL = 'https://cdn-prod.fluidconfigure.com/static/configs/3.13.0/prod/prod/1581/product/22956/ui-settings-it_IT.json';
//const SUNGLASSES_CATEGORY_LABEL = 'sunglasses';
//const EYEGLASSES_CATEGORY_LABEL = 'eyeglasses';

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Output>({});

  useEffect(() => {
    /*Promise.all([
      fetchModels(activeBrand),
      fetchUiSetting(uiSettingsURL)
    ]).then(([data, ui]) => {
      //console.log({ data, ui });
      /*const l10n = new i18n(ui);
      const sunglassesLabel = l10n.getLang(CATEGORY_LABEL + SUNGLASSES_CATEGORY_LABEL, SUNGLASSES_CATEGORY_LABEL).toLowerCase();
      const eyeglassesLabel = l10n.getLang(CATEGORY_LABEL + EYEGLASSES_CATEGORY_LABEL, EYEGLASSES_CATEGORY_LABEL).toLowerCase();
      const t = translateModels(l10n, data);
      console.log({ data, ui, l10n, t, sunglassesLabel, eyeglassesLabel });
    }).catch((e) => {
      console.log(e);
    });*/

    fetchModels(activeBrand)
      .then((data) => {
        const mapped = mapData(data);
        //console.log(mapped);
        setData(mapped);
        completeStyleSelectorPromise();
      })
      .catch((err: unknown) => {
        console.log(err)
      })
  }, [])

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};
