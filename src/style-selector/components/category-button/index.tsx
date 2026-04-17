import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';

interface ButtonProps {
  className?: string;
  label?: string;
  skeleton?: boolean;
  selected?: boolean;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent) => void;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  label,
  skeleton,
  selected,
  tabIndex,
  onClick,
}) => {
  return (
    <button
      className={`${className ?? ''} yr-button ${selected ? 'yr-button__selected' : ''}`}
      type="button"
      role="radio"
      aria-checked={selected ?? false}
      aria-label={label}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {!skeleton ?
        <span className={'yr-button__label'} aria-hidden="true">{label}</span> :
        <Skeleton className='yr-button__label yr-skeleton' variant={SkeletonVariant.text} />
      }
    </button>
  );
};
