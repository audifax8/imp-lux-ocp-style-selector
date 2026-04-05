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
  selectedStep: Step;
  onClick: (step: Step) => void;
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
      <div className='demo-subnav__back'>
        {skeleton && <Skeleton className='demo-subnav__back' variant={SkeletonVariant.rectangular} />}
        {!skeleton && selectedStep.id ?
          <Component
            className='header-nav-items'
            onClick={() => onClick(steps[0])}
            {...(isClickable && {
              type: 'button',
              'aria-label': '',
            })}
          >
            <Logo className={'yr-button__icon'} url={getSVGURL('ArrowLeftBlack', 'wl')} height={16} width={16} />
          </Component> : <></>
        }
      </div>
      <div className="demo-subnav__center">
        <div className="demo-subnav__title">
          {!skeleton ? <span className="demo-subnav__title">{selectedStep?.name}</span> : <Skeleton className='demo-subnav__title' variant={SkeletonVariant.text} />}
        </div>
        <div className="demo-subnav__count">
          {!skeleton ? <span className="demo-subnav__count">{(selectedStep.id + 1 ) + '/' + (steps.length)}</span> : <Skeleton className='demo-subnav__count' variant={SkeletonVariant.text} />}
        </div>
      </div>
      <div className='demo-subnav__close'>
        {skeleton && <Skeleton className='demo-subnav__close' variant={SkeletonVariant.rectangular} />}
        {!skeleton && selectedStep.id ?
          <Component
            className='header-nav-items'
            onClick={() => onClick(steps[0])}
            {...(isClickable && {
              type: 'button',
              'aria-label': '',
            })}
          >
            <Logo className={'yr-button__icon'} url={getSVGURL('CloseBlack', 'wl')} height={16} width={16} />
          </Component> : <></>
        }
      </div>
    </div>
  );
};