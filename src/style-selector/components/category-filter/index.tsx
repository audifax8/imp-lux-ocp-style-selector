import React from 'react';

import type { Category } from '@/style-selector/api/models';
import { Button } from '../category-button';


import './index.scss';

interface CategoryFilterProps {
  subCategories?: Category[],
  selectedCategory?: Category,
  onClick: (e: React.MouseEvent, category: Category) => void;
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
                className={`category-filter-nav-item ${category.category === selectedCategory?.category ? 'category-filter-nav-item__selected' : ''}`}
                key={i}>
                  <Button label={category.category} onClick={(e) => onClick(e, category)}/>
              </li>))}
      </ul>
    </div>
  );
};