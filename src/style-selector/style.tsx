import { useState, useRef, useEffect } from 'react';

import { Card } from '@/style-selector/components/card';
import { ModelCard } from '@/style-selector/components/model';
import { Header } from '@/style-selector/components/header';
import { SubNav } from '@/style-selector/components/sub-nav';
import { CategoryFilterComponent } from '@/style-selector/components/category-filter';

import { activeBrand } from '@/white-label/detect';
import { getSVGURLByType } from '@/shared/assets';

import { useData } from '@/style-selector/context/context';
import { useI18n } from '@/style-selector/context/i18n-context';

import { StepType } from '@/declarations/enums';
import type { LuxApiModel, FlatModel, ModelsTranslated, StepWithTranslation } from '@/declarations/interfaces';


const Style = () => {
  const styleSelectorInitData = useData();
  const {
    modelsToRender,
    preselectedCategoriesFilters,
    preselectedFlatModel,
    stepsTranslated,
    preselectedStep,
    modelsTypesTranslated,
    flatModels
  } = styleSelectorInitData;

  const i18n = useI18n();

  const [filteredModels, setFilteredModels] = useState<LuxApiModel[]>(modelsToRender ?? []);
  const [selectedModel, setSelectedModel] = useState<LuxApiModel>();

  const [subCategories, setSubCategories] = useState<FlatModel[]>(preselectedCategoriesFilters ?? []);
  const [selectedFlatModel, setSelectedFlatModel] = useState<FlatModel | undefined>(preselectedFlatModel);

  const [steps] = useState<StepWithTranslation[]>(stepsTranslated ?? []);
  const [selectedStep, setSelectedStep] = useState<StepWithTranslation>(preselectedStep ?? steps[0]);

  const [modelsTypes] = useState<ModelsTranslated[]>(modelsTypesTranslated ?? []);

  const mainRef = useRef<HTMLElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (selectedStep?.type === StepType.MODEL || selectedStep?.type === StepType.INSPIRATIONS) {
      mainRef.current?.querySelector<HTMLElement>('button, a[href]')?.focus();
    }
  }, [selectedStep]);

  const onClick = (type: string) => {
    const filtered = flatModels?.filter(model => model.type === type);
    setSubCategories(filtered ?? []);
    if (filtered && filtered[0].models) {
      setSelectedFlatModel(filtered[0]);
      setFilteredModels(filtered[0].models);
      setSelectedStep(steps[1]);
    }
  };

  const onHeaderClick = (step?: StepWithTranslation) => {
    if (step?.type === StepType.TYPE) {
      setSelectedStep(steps[0]);
      setSelectedFlatModel(undefined);
    } else if (step?.type === StepType.MODEL) {
      setSelectedStep(step);
      const newModels = flatModels?.find(cate => cate.type === selectedFlatModel?.type);
      setFilteredModels(newModels?.models ?? []);
    }
  };

  const onCategoryClick = (flatModel: FlatModel) => {
    setSelectedFlatModel(flatModel);
    const models = styleSelectorInitData?.flatModels?.find(cat => cat.category === flatModel.category && cat.type === flatModel.type);
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

  /*const onSkipToCustomizationClick = () => {
    //TODO
    window.open(selectedModel?.pageUrl, '_blank');
  };*/

  const trendingLabel = i18n?.getLabel(`style_selector_category_label_trending`, 'Select trending styles or');
  const skipLabel = i18n?.getLabel('style_selector_category_label_skip', ' skip to customization');

  return (
    <div className={`style-selector style-selector-${activeBrand}`}>
      <Header steps={stepsTranslated} selectedStep={selectedStep} onClick={onHeaderClick} />
      <SubNav steps={stepsTranslated} selectedStep={selectedStep} onClick={onHeaderClick} />
      {selectedStep?.type === StepType.TYPE && (
        <section
          className='style-selector__elements'
          aria-label={i18n?.getLabel('style_selector_step_type_title', 'Select glasses type')}
        >
          <ul
            className='style-selector__types-list'
            role="list"
            aria-label={i18n?.getLabel('style_selector_step_type_list_label', 'Glasses types')}
          >
            {modelsTypes
              ? modelsTypes.map((model, index) => (
                  <li key={index}>
                    <Card
                      length={model.length}
                      title={model.translation}
                      imageSrc={getSVGURLByType(model.name, activeBrand, 'img')}
                      imageAlt={model.translation}
                      onClick={() => onClick(model.name)}
                    />
                  </li>
                ))
              : [0, 1, 2].map(i => (
                  <li key={i} aria-hidden="true">
                    <Card skeleton />
                  </li>
                ))
            }
          </ul>
        </section>
      )}
      {(selectedStep?.type === StepType.MODEL || selectedStep?.type === StepType.INSPIRATIONS) && (
        <section
          ref={mainRef}
          className='style-selector__inspiration'
          aria-label={
            selectedStep?.type === StepType.INSPIRATIONS
              ? i18n?.getLabel('style_selector_step_inspirations_title', 'Trending styles')
              : i18n?.getLabel('style_selector_step_model_title', 'Select a model')
          }
        >
          {selectedStep?.type === StepType.MODEL && (
            <CategoryFilterComponent subCategories={subCategories} selectedCategory={selectedFlatModel} onClick={onCategoryClick}/>
          )}
          {selectedStep?.type === StepType.INSPIRATIONS && (
            <div className='style-selector__inspiration__container'>
              <p className='style-selector__inspiration__container__label'>
                {trendingLabel}
                <a
                  href={selectedModel?.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='style-selector__inspiration__container__link'
                >
                  {skipLabel}
                  <span className="sr-only">{i18n?.getLabel('style_selector_opens_new_tab', ', opens in new tab') ?? ', opens in new tab'}</span>
                </a>
              </p>
            </div>
          )}
          <ul
            className="style-selector__inspiration-list"
            role="list"
            aria-label={
              selectedStep?.type === StepType.INSPIRATIONS
                ? i18n?.getLabel('style_selector_inspirations_list_label', 'Trending styles')
                : i18n?.getLabel('style_selector_models_list_label', 'Models')
            }
          >
            {filteredModels?.map((model, i) => (
              <li
                className='style-selector__inspiration-list-item'
                key={i}
              >
                <ModelCard
                  key={model.modelCode}
                  title={model.label}
                  imageSrc={model.thumbnailUrl}
                  imageAlt={model.label}
                  onClick={() => onModelClick(model)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default Style
