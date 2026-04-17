import React from 'react';

import { Button } from '@/style-selector/components/category-button';
import type { FlatModel } from '@/declarations/interfaces';

import './index.scss';

interface CategoryFilterProps {
  subCategories?: FlatModel[];
  selectedCategory?: FlatModel;
  onClick?: (category: FlatModel) => void;
  label?: string;
}

export const CategoryFilterComponent: React.FC<CategoryFilterProps> = ({
  subCategories,
  selectedCategory,
  onClick,
  label,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!subCategories?.length) return;
    const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
    const currentIndex = radios.findIndex(r => r === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % radios.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + radios.length) % radios.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = radios.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      radios[nextIndex].focus();
      onClick?.(subCategories[nextIndex]);
    }
  };

  return (
    <div className="category-filter">
      <ul
        className="category-filter-nav"
        role="radiogroup"
        aria-label={label ?? 'Filter by category'}
        onKeyDown={handleKeyDown}
      >
        {subCategories?.map((category, i) => {
          const isSelected = category.category === selectedCategory?.category;
          return (
            <li
              role="presentation"
              className="category-filter-nav-item"
              key={i}
            >
              <Button
                selected={isSelected}
                label={category.category}
                tabIndex={isSelected || (!selectedCategory && i === 0) ? 0 : -1}
                onClick={() => onClick?.(category)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
