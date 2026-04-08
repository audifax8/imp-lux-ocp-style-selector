import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import { getSVGURL } from '@/shared/assets';
import { Logo } from '@/style-selector/components/logo';
import type { Step } from '@/style-selector/api/models';

import './index.scss';
interface SubNavProps {
  skeleton?: boolean;
  steps?: Step[];
  selectedStep?: Step;
  onClick?: (step?: Step) => void;
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
    <div className="subnav">
      <div className='subnav__back'>
        {skeleton && <Skeleton className='subnav__back' variant={SkeletonVariant.rectangular} />}
        {!skeleton && onClick && selectedStep?.id ?
          <Component
            className='header-nav-items'
            onClick={() => onClick?.(steps && steps[0])}
            {...(isClickable && {
              type: 'button',
              'aria-label': '',
            })}
          >
            <Logo className={'yr-button__icon'} url={getSVGURL('ArrowLeftBlack', 'wl')} height={16} width={16} />
          </Component> : <></>
        }
      </div>
      <div className="subnav__center">
        <div className="subnav__title">
          {!skeleton ?
            <span className="subnav__title">{selectedStep?.name}</span> :
            <Skeleton className='subnav__title' variant={SkeletonVariant.text} />
          }
        </div>
        <div className="subnav__count">
          {!skeleton ? <span className="subnav__count">{((selectedStep?.id || 0) + 1 ) + '/' + (steps?.length)}</span> : <Skeleton className='subnav__count' variant={SkeletonVariant.text} />}
        </div>
      </div>
      <div className='subnav__close'>
        {skeleton && <Skeleton className='subnav__close' variant={SkeletonVariant.rectangular} />}
        {!skeleton && onClick && selectedStep?.id ?
          <Component
            className='header-nav-items'
            onClick={() => onClick?.(steps && steps[0])}
            {...(isClickable && {
              type: 'button',
              'aria-label': '',
            })}
          >
            <Logo className={'yr-button__icon'} url={getSVGURL('CloseBlack', 'wl')} height={16} width={16} />
          </Component> :
          <></>
        }
      </div>
    </div>
  );
};