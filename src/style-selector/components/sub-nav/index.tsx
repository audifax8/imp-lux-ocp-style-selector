import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import { getSVGURL } from '@/shared/assets';
import { Logo } from '../logo';
import type { Step } from '@/style-selector/api/models';

import './index.scss';
interface SubNavProps {
  skeleton?: boolean;
  steps: Step[];
  selectedStep: number;
  onClick: (e: React.MouseEvent, stepId: number) => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  skeleton,
  onClick,
  steps,
  selectedStep
}) => {
  const isClickable = typeof onClick === 'function';
  const Component = isClickable ? 'button' : 'div';

  return (
    <div className="demo-subnav">
      {!skeleton ?
        <Component
          className='header-nav-items'
          onClick={(e) => onClick(e, 0)}
          {...(isClickable && {
            type: 'button',
            'aria-label': '',
          })}
        >
          <Logo className={'yr-button__icon'} url={getSVGURL('ArrowLeftBlack', 'wl')} height={16} width={16} />
        </Component>
         :
        <Skeleton className='demo-subnav__back' variant={SkeletonVariant.rectangular} />
      }
      <div className="demo-subnav__center">
        <div className="demo-subnav__title">
          {!skeleton ? <span className="demo-subnav__title">Page title</span> : <Skeleton className='demo-subnav__title' variant={SkeletonVariant.text} />}
        </div>
        <div className="demo-subnav__count">
          {!skeleton ? <span className="demo-subnav__count">{(selectedStep + 1 ) + '/' + (steps.length)}</span> : <Skeleton className='demo-subnav__count' variant={SkeletonVariant.text} />}
        </div>
      </div>
      {!skeleton ?
        <Component
          className='header-nav-items'
          onClick={(e) => onClick(e, 0)}
          {...(isClickable && {
            type: 'button',
            'aria-label': '',
          })}
        >
          <Logo className={'yr-button__icon'} url={getSVGURL('CloseBlack', 'wl')} height={16} width={16} />
        </Component> :
        <Skeleton className='demo-subnav__close' variant={SkeletonVariant.rectangular} />
      }
    </div>
  );
};