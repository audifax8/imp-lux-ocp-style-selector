import { useState } from 'react'

import { Card } from '@/style-selector/components/card'
import { ModelCard } from '@/style-selector/components/model';
import { Header } from '@/style-selector/components/header'
import { SubNav } from '@/style-selector/components/sub-nav'
import { activeBrand } from '@/white-label/detect'
import { getSVGURLByType } from '@/shared/assets';
import type { Category } from '@/style-selector/api/models'
import { CategoryFilterComponent } from '@/style-selector/components/category-filter';
import { useData } from '@/style-selector/context/context';
import type { LuxApiModel, Step } from '@/declarations/interfaces';
import { StepType } from '@/declarations/enums';

const Style = () => {
  const phase1Data = useData();
  console.log(phase1Data);

  const [filteredModels, setFilteredModels] = useState<LuxApiModel[]>(phase1Data?.preselectedModels ?? []);
  const [selectedModel, setSelectedModel] = useState<LuxApiModel>();

  const [filteredInspirations, setFilteredInspirations] = useState<LuxApiModel[]>();

  const [subCategories, setSubCategories] = useState<Category[]>(phase1Data?.preselectedCategories ?? []);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(phase1Data?.preselectedCategory);

  const [steps] = useState<Step[]>(phase1Data?.steps ?? []);
  const [selectedStep, setSelectedStep] = useState<Step>(phase1Data?.preselectedStep ?? steps[0]);

  const onClick = (type: string) => {
    const filtered = phase1Data?.categories?.filter(category => category.type === type);
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
  const onHeaderClick = (step?: Step) => {
    if (!step || step.id >= selectedStep.id) return;
    if (step.id === 0) {
      setSelectedStep(steps[0]);
      setSelectedCategory(undefined);
    } else if (step.id === 1) {
      setSelectedStep(steps[1]);
    }
  };

  const onCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    const models = phase1Data?.categories?.find(cat => cat.category === category.category && cat.type === category.type);
    setFilteredModels(models?.models ?? []);
  };

  const onModelClick = (model: LuxApiModel) => {
    //Custom model
    if (model.recipeId) {
      return window.open(model?.pageUrl, '_blank');
    }
    const { inspirations } = phase1Data;
    const ins = inspirations?.filter((inspiration) => inspiration.vendorId === model.vendorId);
    if (!ins || !ins.length) {
       return window.open(selectedModel?.pageUrl, '_blank');
    }
    setSelectedStep(steps[2]);
    setFilteredInspirations(ins);
    setSelectedModel(model);
  };

  const onSkipToCustomizationClick = () => {
    //TODO
    window.open(selectedModel?.pageUrl, '_blank');
  };

  return (
    <div className={`style-selector style-selector-${activeBrand}`}>
      <Header steps={phase1Data?.steps} selectedStep={selectedStep} onClick={onHeaderClick} />
      <SubNav steps={phase1Data?.steps} selectedStep={selectedStep} onClick={onHeaderClick} />
      {/* Step 0: Type */}
      {selectedStep?.type === StepType.TYPE && (
        <main className='style-selector__elements'>
          {phase1Data?.estepTypesTranslated
            ? phase1Data.estepTypesTranslated.map((step) =>
                <Card
                  length={step.length}
                  key={step.type}
                  title={step.translation}
                  imageSrc={getSVGURLByType(step.type, activeBrand, 'img')}
                  imageAlt={step.type}
                  onClick={() => onClick(step.type)}
                />
              )
            : [0, 1, 2].map(i => <Card key={i} skeleton />)
          }
        </main>
      )}

      {/* Step 1: Model */}
      {selectedStep?.type === StepType.MODEL && (
        <main className='style-selector__models'>
          <CategoryFilterComponent subCategories={subCategories} selectedCategory={selectedCategory} onClick={onCategoryClick}/>
          <ul className="style-selector__models-list"
            role="list"
            aria-label="">
              {filteredModels?.map(
                (model, i) =>
                  (<li
                    role="none"
                    className='style-selector__models-list-item'
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

      {/* Step 2: Inspiration */}
      {selectedStep?.type === StepType.INSPIRATIONS && (
        <main className='style-selector__inspiration'>
          <div className='style-selector__inspiration__container'>
            <p className='style-selector__inspiration__container__label'>Select trending styles or
              <a
                tabIndex={0}
                className='style-selector__inspiration__container__link'
                onClick={() => onSkipToCustomizationClick()}> skip to customization
              </a>
            </p>
          </div>
          <ul className="style-selector__inspiration-list"
            role="list"
            aria-label="">
              {filteredInspirations?.map(
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
