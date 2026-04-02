import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { getSVGURL } from '@/shared/assets';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';
import { Logo } from '../logo';

//impl example
//<Card title="Test" skeleton={true} />
//<Card title="Test" skeleton={false} />


interface ButtonProps {
  className?: string;
  label?: string;
  skeleton?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  label,
  skeleton,
  selected,
  //onClick,
}) => {
  //const isClickable = typeof onClick === 'function';
  return (
    <button className={`${className} yr-button ${selected ? 'yr-button__selected' : ''}`} type="button" aria-label={label}>
      {!skeleton ?
        <Logo className={'yr-button__icon'} width={24} height={24} url={getSVGURL('Category', 'wl')} /> :
        <Skeleton className='yr-button__icon yr-skeleton' variant={SkeletonVariant.text} />
      }
      {!skeleton ?
        <span className={'yr-button__label'}>{label}</span> :
        <Skeleton className='yr-button__label yr-skeleton' variant={SkeletonVariant.text} />
      }
    </button>
  );
};