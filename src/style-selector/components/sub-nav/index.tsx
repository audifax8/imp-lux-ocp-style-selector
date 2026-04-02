import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';


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
        <button className="demo-subnav__back" aria-label="Back">&#8249;</button> :
        <Skeleton className='demo-subnav__back' variant={SkeletonVariant.text} />
      }
      <div className="demo-subnav__center">
        {!skeleton ? <span className="demo-subnav__title">Page title</span> : <Skeleton className='demo-subnav__title' variant={SkeletonVariant.text} />}
        {!skeleton ? <span className="demo-subnav__count">X/X</span> : <Skeleton className='demo-subnav__count' variant={SkeletonVariant.text} />}
      </div>
      {!skeleton ?
        <button className="demo-subnav__close" aria-label="Close">&#x2715;</button> :
        <Skeleton className='demo-subnav__close' variant={SkeletonVariant.text} />
      }
    </div>
  );
};