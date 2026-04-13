import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
//import { getSVGURL } from '@/shared/assets';
import { SkeletonVariant } from '@/declarations/enums';
//import { Logo } from '@/style-selector/components/logo';

import './index.scss';

interface ButtonProps {
  //showLogo?: boolean;
  className?: string;
  label?: string;
  skeleton?: boolean;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}
/*
{!skeleton && showLogo ?
        {showLogo ? (<Logo className={'yr-button__icon'} width={24} height={24} url={getSVGURL('Category', 'wl')} />) : <></>} :
        <Skeleton className='yr-button__icon yr-skeleton' variant={SkeletonVariant.text} />
      }
*/
export const Button: React.FC<ButtonProps> = ({
  //showLogo,
  className,
  label,
  skeleton,
  selected,
  onClick,
}) => {
  return (
    <button
      className={`${className}
      yr-button ${selected ? 'yr-button__selected' : ''}`}
      type="button"
      aria-label={label}
      aria-current={`${selected ? true : false}`}
      onClick={onClick}>
      {!skeleton ?
        <span className={'yr-button__label'}>{label}</span> :
        <Skeleton className='yr-button__label yr-skeleton' variant={SkeletonVariant.text} />
      }
    </button>
  );
};