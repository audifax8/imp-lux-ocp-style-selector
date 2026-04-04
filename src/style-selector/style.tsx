import React, { useState } from 'react'

import { Card } from '@/style-selector/components/card'
import { ModelCard } from '@/style-selector/components/model';
import { Header } from '@/style-selector/components/header'
import { SubNav } from '@/style-selector/components/sub-nav'
import { useData } from '@/style-selector/providers/context'
import { activeBrand } from '@/white-label/detect'
import { getSVGURLByType } from '@/shared/assets';
import type { Category, Model } from './api/models'
import { Button } from '@/style-selector/components/category-button';

const Style = () => {
  const { types, categories } = useData()
  console.log({ types, categories });
  const [selectedType, setSelectedType] = useState<string>('');
  const [filteredModels, setFilteredModels] = useState<Model[]>();
  const [subCategories, setSubCategories] = useState<Category[]>();
  console.log({ categories, types });
  //const brand = memo(activeBrand)

  const onClick = (e: React.MouseEvent, type: string) => {
    setSelectedType(type);
    const filtered = categories?.filter(category => category.type === type);
    setSubCategories(filtered);
    console.log(filtered);
    if (filtered && filtered[0].models) {
      setFilteredModels(filtered[0].models);
    }
  };

  return (
    <div className='style-selector'>
      <Header />
      <SubNav />
      <main className='style-selector__elements'>
        {types?.map((type) =>
          <Card
            key={type}
            title={type}
            imageSrc={getSVGURLByType(type, activeBrand, 'img')}
            imageAlt={type}
            onClick={(e: React.MouseEvent) => onClick(e, type)}
          />)}
      </main>
      <main className='style-selector__models'>
        {subCategories?.map((cat) => <Button skeleton={false} label={cat.category}/> )}
        {filteredModels?.map(
          (model) => 
            <ModelCard
              key={model.modelCode}
              title={model.label}
              imageSrc={model.thumbnailUrl}
              imageAlt={model.label}
              onClick={(e: React.MouseEvent) => onClick(e, model.label)}
            />
        )}
      </main>
    </div>
  )
}

export default Style
