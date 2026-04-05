import React, { useState } from 'react'

import { Card } from '@/style-selector/components/card'
import { ModelCard } from '@/style-selector/components/model';
import { Header } from '@/style-selector/components/header'
import { SubNav } from '@/style-selector/components/sub-nav'
import { useData } from '@/style-selector/providers/context'
import { activeBrand } from '@/white-label/detect'
import { getSVGURLByType } from '@/shared/assets';
import type { Category, Model, Step } from './api/models'
import { CategoryFilterComponent } from './components/category-filter';

const Style = () => {
  const { types, categories } = useData()
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
    }
  ]
  const [steps] = useState<Step[]>(STEPS);
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const onClick = (e: React.MouseEvent, type: string) => {
    setSelectedType(type);
    const filtered = categories?.filter(category => category.type === type);
    setSubCategories(filtered);
    if (filtered && filtered[0].models) {
      setSelectedCategory(filtered[0]);
      setFilteredModels(filtered[0].models);
      //TODO
      setSelectedStep(1);
    }
  };

  const onHeaderClick = (e: React.MouseEvent, stepId: number) => {
    if (stepId === 0) {
      setSelectedStep(0);
      setSelectedCategory(undefined);
    }
  };

  const onCategoryClick = (e: React.MouseEvent, category: Category) => {
    setSelectedCategory(category);
    const models = categories?.find(cat => cat.category === category.category);
    setFilteredModels(models?.models);
  };

  return (
    <div className='style-selector'>
      <Header steps={steps} selectedStep={selectedStep} onClick={onHeaderClick} />
      <SubNav steps={steps} selectedStep={selectedStep} onClick={onHeaderClick} />
      {!selectedCategory && (<main className='style-selector__elements'>
        {types?.map((type) =>
          <Card
            key={type}
            title={type}
            imageSrc={getSVGURLByType(type, activeBrand, 'img')}
            imageAlt={type}
            onClick={(e: React.MouseEvent) => onClick(e, type)}
          />)}
      </main>)}
      {selectedCategory && (<main className='style-selector__models'>
        <CategoryFilterComponent subCategories={subCategories} selectedCategory={selectedCategory} onClick={onCategoryClick}/>
        {filteredModels?.map(
          (model) => 
            <ModelCard
              key={model.modelCode}
              title={model.label}
              imageSrc={model.thumbnailUrl}
              imageAlt={model.label}
              //onClick={(e: React.MouseEvent) => onClick(e, model.label)}
            />
        )}
      </main>)}
    </div>
  )
}

export default Style
