import { useState, useRef, useEffect } from 'react';

import { Header } from '@/style-selector/components/header';
import { SubNav } from '@/style-selector/components/sub-nav';
import { TypeStep } from '@/style-selector/components/type-step';
import { ModelStep } from '@/style-selector/components/model-step';

import { activeBrand } from '@/white-label/detect';
import { useData } from '@/style-selector/context/context';
import { useDarkMode } from '@/style-selector/bootstrap/useDarkMode';
import { activeTokenVersion, SKIN_NAME } from '@/style-selector/bootstrap/token-version';

import { StepType } from '@/declarations/enums';
import type { LuxApiModel, FlatModel, ModelsTranslated, StepWithTranslation } from '@/declarations/interfaces';

import './index.scss';


const Style = () => {
  const styleSelectorInitData = useData();
  const darkMode = useDarkMode();
  const {
    modelsToRender,
    preselectedCategoriesFilters,
    preselectedFlatModel,
    stepsTranslated,
    preselectedStep,
    modelsTypesTranslated,
    flatModels
  } = styleSelectorInitData;

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

  const onTypeClick = (type: string) => {
    const filtered = flatModels?.filter(model => model.type === type);
    setSubCategories(filtered ?? []);
    if (filtered && filtered[0].models) {
      setSelectedFlatModel(filtered[0]);
      setFilteredModels(filtered[0].models);
      setSelectedStep(steps[1]);
    }
  };

  // Navegación hacia atrás (Header tabs + SubNav back button).
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
    const models = styleSelectorInitData?.flatModels?.find(
      cat => cat.category === flatModel.category && cat.type === flatModel.type
    );
    setFilteredModels(models?.models ?? []);
  };

  const onModelClick = (model: LuxApiModel) => {
    // Custom model
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

  return (
    <div
      className={`style-selector style-selector-${activeBrand}`}
      data-token-version={activeTokenVersion}
      data-skin={SKIN_NAME[activeBrand] ?? 'whitelabel'}
      data-mode={darkMode}
    >
      <Header steps={stepsTranslated} selectedStep={selectedStep} onClick={onHeaderClick} />
      <SubNav steps={stepsTranslated} selectedStep={selectedStep} onClick={onHeaderClick} />
      {selectedStep?.type === StepType.TYPE && (
        <TypeStep modelsTypes={modelsTypes} onClick={onTypeClick} />
      )}
      {(selectedStep?.type === StepType.MODEL || selectedStep?.type === StepType.INSPIRATIONS) && (
        <ModelStep
          ref={mainRef}
          selectedStep={selectedStep}
          subCategories={subCategories}
          selectedFlatModel={selectedFlatModel}
          filteredModels={filteredModels}
          selectedModel={selectedModel}
          onCategoryClick={onCategoryClick}
          onModelClick={onModelClick}
        />
      )}
    </div>
  );
};

export default Style;
