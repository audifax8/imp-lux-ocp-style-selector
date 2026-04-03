import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';
import { getSVGURL } from '@/shared/assets';
import { Logo } from '../logo';


interface SubNavProps {
  skeleton?: boolean;
  onClick?: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  skeleton,
  //onClick,
}) => {

  return (
    <div className="demo-subnav">
      {!skeleton ?
        <Logo className={'yr-button__icon'} url={getSVGURL('ArrowLeftBlack', 'wl')} height={16} width={16} /> :
        <Skeleton className='demo-subnav__back' variant={SkeletonVariant.rectangular} />
      }
      <div className="demo-subnav__center">
        <div className="demo-subnav__title">
          {!skeleton ? <span className="demo-subnav__title">Page title</span> : <Skeleton className='demo-subnav__title' variant={SkeletonVariant.text} />}
        </div>
        <div className="demo-subnav__count">
          {!skeleton ? <span className="demo-subnav__count">X/X</span> : <Skeleton className='demo-subnav__count' variant={SkeletonVariant.text} />}
        </div>
      </div>
      {!skeleton ?
        <Logo className={'yr-button__icon'} url={getSVGURL('CloseBlack', 'wl')} height={16} width={16} /> :
        <Skeleton className='demo-subnav__close' variant={SkeletonVariant.rectangular} />
      }
    </div>
  );
};