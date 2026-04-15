import React from 'react';

import { Button } from '@/style-selector/components/category-button';
import type { FlatModel } from '@/declarations/interfaces';

import './index.scss';

interface CategoryFilterProps {
  subCategories?: FlatModel[],
  selectedCategory?: FlatModel,
  onClick?: (category: FlatModel) => void;
}

export const CategoryFilterComponent: React.FC<CategoryFilterProps> = ({
  subCategories,
  selectedCategory,
  onClick
}) => {
  return (
    <div className="category-filter">
      <ul className="category-filter-nav"
        role="menubar"
        aria-label="">
          {subCategories?.map(
            (category, i) =>
              (<li
                role="none"
                className="category-filter-nav-item"
                aria-current={`${category?.type === selectedCategory?.type ? true : false}`}
                key={i}>
                  <Button selected={category.category === selectedCategory?.category} label={category.category} onClick={() => onClick?.(category)}/>
              </li>))}
      </ul>
    </div>
  );
};