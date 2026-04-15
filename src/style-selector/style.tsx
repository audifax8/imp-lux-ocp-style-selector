import { useState } from 'react';

import { Card } from '@/style-selector/components/card';
import { ModelCard } from '@/style-selector/components/model';
import { Header } from '@/style-selector/components/header';
import { SubNav } from '@/style-selector/components/sub-nav';
import { activeBrand } from '@/white-label/detect';
import { getSVGURLByType } from '@/shared/assets';
import { CategoryFilterComponent } from '@/style-selector/components/category-filter';
import { useData } from '@/style-selector/context/context';
import type { LuxApiModel, ModelsCategory, ModelsTranslated, StepWithTranslation } from '@/declarations/interfaces';
import { StepType } from '@/declarations/enums';

const Style = () => {
  const styleSelectorInitData = useData();
  console.log(styleSelectorInitData);

  const [filteredModels, setFilteredModels] = useState<LuxApiModel[]>(styleSelectorInitData?.preselectedModels ?? []);
  const [selectedModel, setSelectedModel] = useState<LuxApiModel>();

  const [subCategories, setSubCategories] = useState<ModelsCategory[]>(styleSelectorInitData?.preselectedCategories ?? []);
  const [selectedCategory, setSelectedCategory] = useState<ModelsCategory | undefined>(styleSelectorInitData?.preselectedCategory);

  const [steps] = useState<StepWithTranslation[]>(styleSelectorInitData?.stepsTranslated ?? []);
  const [selectedStep, setSelectedStep] = useState<StepWithTranslation>(styleSelectorInitData?.preselectedStep ?? steps[0]);

  const [modelsTypesTranslated] = useState<ModelsTranslated[]>(styleSelectorInitData?.modelsTypesTranslated ?? []);
  console.log({ selectedStep });

  const onClick = (type: string) => {
    const filtered = styleSelectorInitData?.categories?.filter(category => category.type === type);
    setSubCategories(filtered ?? []);
    if (filtered && filtered[0].models) {
      setSelectedCategory(filtered[0]);
      setFilteredModels(filtered[0].models);
      setSelectedStep(steps[1]);
    }
  };

  // Navegación hacia atrás (Header tabs + SubNav back button).
  // Reglas:
  //   - No se puede saltar hacia adelante desde el Header.
  //   - Step 0: reset completo (tipo, categoría).
  //   - Step 1: vuelve a la vista de modelos conservando la categoría.
  //   - SubNav siempre llama con steps[0], por lo que desde cualquier step
  //     el botón back retrocede a Type (cubre "step 3 → step 1" directamente).
  const onHeaderClick = (step?: StepWithTranslation) => {
    if (step?.type === StepType.TYPE) {
      setSelectedStep(steps[0]);
      setSelectedCategory(undefined);
    } else if (step?.type === StepType.MODEL) {
      setSelectedStep(step);
      const newModels = styleSelectorInitData.categories?.find(cate => cate.type === selectedCategory?.type);
      setFilteredModels(newModels?.models ?? []);
    }
  };

  const onCategoryClick = (category: ModelsCategory) => {
    setSelectedCategory(category);
    const models = styleSelectorInitData?.categories?.find(cat => cat.category === category.category && cat.type === category.type);
    setFilteredModels(models?.models ?? []);
  };

  const onModelClick = (model: LuxApiModel) => {
    //Custom model
    if (model.recipeId) {
      return window.open(model?.pageUrl, '_blank');
    }
    const { inspirations } = styleSelectorInitData;
    const ins = inspirations?.filter((inspiration) => inspiration.vendorId === model.vendorId);
    if (!ins || !ins.length) {
       return window.open(selectedModel?.pageUrl, '_blank');
    }
    setSelectedStep(steps[2]);
    setFilteredModels(ins ?? []);
    setSelectedModel(model);
  };

  const onSkipToCustomizationClick = () => {
    //TODO
    window.open(selectedModel?.pageUrl, '_blank');
  };

  const trendingLabel = styleSelectorInitData?.l10n?.getLabel(`style_selector_category_label_trending`, 'Select trending styles or');
  const skipLabel = styleSelectorInitData?.l10n?.getLabel('style_selector_category_label_skip', ' skip to customization');

  return (
    <div className={`style-selector style-selector-${activeBrand}`}>
      <Header steps={styleSelectorInitData?.stepsTranslated} selectedStep={selectedStep} onClick={onHeaderClick} />
      <SubNav steps={styleSelectorInitData?.stepsTranslated} selectedStep={selectedStep} onClick={onHeaderClick} />
      {selectedStep?.type === StepType.TYPE && (
        <main className='style-selector__elements'>
          {modelsTypesTranslated
            ? modelsTypesTranslated.map((model, index) =>
                <Card
                  key={index}
                  title={model.translation}
                  imageSrc={getSVGURLByType(model.name, activeBrand, 'img')}
                  imageAlt={model.translation}
                  onClick={() => onClick(model.name)}
                />
              )
            : [0, 1, 2].map(i => <Card key={i} skeleton />)
          }
        </main>
      )}
      {(selectedStep?.type === StepType.MODEL || selectedStep?.type === StepType.INSPIRATIONS) && (
        <main className='style-selector__inspiration'>
          {selectedStep?.type === StepType.MODEL && (
            <CategoryFilterComponent subCategories={subCategories} selectedCategory={selectedCategory} onClick={onCategoryClick}/>
          )}
            {selectedStep?.type === StepType.INSPIRATIONS && (
              <div className='style-selector__inspiration__container'>
                <p className='style-selector__inspiration__container__label'>{trendingLabel}
                  <a
                    href='#'
                    tabIndex={0}
                    className='style-selector__inspiration__container__link'
                    aria-label={`${trendingLabel} ${skipLabel}`}
                    onClick={() => onSkipToCustomizationClick()}>{skipLabel}
                  </a>
                </p>
              </div>
            )}
          <ul className="style-selector__inspiration-list"
            role="list"
            aria-label="">
              {filteredModels?.map(
                (model, i) =>
                  (<li
                    role="none"
                    className='style-selector__inspiration-list-item'
                    key={i}>
                      <ModelCard
                        key={model.modelCode}
                        title={model.label}
                        imageSrc={model.thumbnailUrl}
                        imageAlt={model.label}
                        onClick={() => onModelClick(model)}
                      />
                  </li>
                )
              )}
          </ul>
        </main>
      )}
    </div>
  )
}

export default Style
