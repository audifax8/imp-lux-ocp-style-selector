import { useMemo, useState } from 'react'

import { Card } from '@/style-selector/components/card'
import { ModelCard } from '@/style-selector/components/model';
import { Header } from '@/style-selector/components/header'
import { SubNav } from '@/style-selector/components/sub-nav'
import { activeBrand } from '@/white-label/detect'
import { getSVGURLByType } from '@/shared/assets';
import type { Category, Model, Step } from '@/style-selector/api/models'
import { CategoryFilterComponent } from '@/style-selector/components/category-filter';
import { StyleSelectorInitStrategy } from '@/configurator/model/strategy/StyleSelectorInitStrategy';
import { useInitStyleSelectorStrategy } from '@/configurator/model/useInitStyleSelectorStrategy';

const Style = () => {
  const strategy = useMemo(() => new StyleSelectorInitStrategy(), [])
  const { phase1Data } = useInitStyleSelectorStrategy(strategy)
  const [, setSelectedType] = useState<string>('');
  const [filteredModels, setFilteredModels] = useState<Model[]>();
  const [subCategories, setSubCategories] = useState<Category[]>();
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  //const STEPS = ['1. Type', '2. Prescription', '3. Model', '4. Inspiration']
  //TODO
  const STEPS: Step[] = [
    {
      id: 0,
      name: '1. Type'
    },
    {
      id: 1,
      name: '2. Model'
    },
    {
      id: 2,
      name: '3. Inspiration'
    }
  ]
  const [steps] = useState<Step[]>(STEPS);
  const [selectedStep, setSelectedStep] = useState<Step>(steps[0]);

  const onClick = (type: string) => {
    setSelectedType(type);
    const filtered = phase1Data?.categories?.filter(category => category.type === type);
    setSubCategories(filtered);
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
    console.log(step);
    /*if (!step || step.id >= selectedStep.id) return;

    if (step.id === 0) {
      setSelectedStep(steps[0]);
      setSelectedCategory(undefined);
    } else if (step.id === 1) {
      setSelectedStep(steps[1]);
    }*/
  };

  const onCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    const models = phase1Data?.categories?.find(cat => cat.category === category.category);
    setFilteredModels(models?.models);
  };

  const onModelClick = (model: Model) => {
    setSelectedStep(steps[2]);
    //TODO: cargar contenido de inspiración para el modelo seleccionado
    console.log(model);
  };

  return (
    <div className={`style-selector style-selector-${activeBrand}`}>
      <Header steps={steps} selectedStep={selectedStep} onClick={onHeaderClick} />
      <SubNav steps={steps} selectedStep={selectedStep} onClick={onHeaderClick} />
      {/* Step 0: Type */}
      {selectedStep.id === 0 && (
        <main className='style-selector__elements'>
          {phase1Data?.types
            ? phase1Data.types.map((type) =>
                <Card
                  key={type}
                  title={type}
                  imageSrc={getSVGURLByType(type, activeBrand, 'img')}
                  imageAlt={type}
                  onClick={() => onClick(type)}
                />
              )
            : [0, 1, 2].map(i => <Card key={i} skeleton />)
          }
        </main>
      )}

      {/* Step 1: Model */}
      {selectedStep.id === 1 && (
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
      {selectedStep.id === 2 && (
        <main className='style-selector__inspiration'>
          {/* TODO: contenido de inspiración */}
        </main>
      )}
    </div>
  )
}

export default Style
