import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';
import type { Step } from '@/declarations/interfaces';

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
      <div className='subnav-back'>
        {skeleton && <Skeleton className='subnav-back' variant={SkeletonVariant.rectangular} />}
        {!skeleton && onClick && selectedStep?.id ?
          <Component
            className='subnav-back-button'
            onClick={() => onClick?.(steps && steps[0])}
            {...(isClickable && {
              type: 'button',
              'aria-label': '',
            })}
          >
            <div className='subnav-back-button__icon'></div>
          </Component> : <></>
        }
      </div>
      <div className="subnav-center">
        <div className="subnav-title">
          {!skeleton ?
            <span className="subnav-title">{selectedStep?.name}</span> :
            <Skeleton className='subnav-title' variant={SkeletonVariant.text} />
          }
        </div>
        <div className="subnav-count">
          {!skeleton ? 
            <span className="subnav-count">{((selectedStep?.id || 0) + 1 ) + '/' + (steps?.length)}</span> :
            <Skeleton className='subnav-count' variant={SkeletonVariant.text} />
          }
        </div>
      </div>
      <div className='subnav-close'>
        {skeleton && <Skeleton className='subnav-close' variant={SkeletonVariant.rectangular} />}
        {/*!skeleton && onClick && selectedStep?.id ?
          <Component
            className='header-nav-items'
            onClick={() => onClick?.(steps && steps[0])}
            {...(isClickable && {
              type: 'button',
              'aria-label': '',
            })}
          >
            {skeleton && <div className='yr-button__icon'></div>}
            {/*<Logo className={'yr-button__icon'} url={getSVGURL('CloseBlack', 'wl')} height={16} width={16} />}
          </Component> :
          <></>
        */}
      </div>
    </div>
  );
};