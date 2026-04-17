import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';
import type { StepWithTranslation } from '@/declarations/interfaces';

import './index.scss';
interface SubNavProps {
  skeleton?: boolean;
  steps?: StepWithTranslation[];
  selectedStep?: StepWithTranslation;
  onClick?: (step?: StepWithTranslation) => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  skeleton,
  onClick,
  steps,
  selectedStep
}) => {
  const stepNumber = (selectedStep?.id ?? 0) + 1;
  const totalSteps = steps?.length ?? 0;
  const backLabel = `Back to ${steps?.[0]?.name ?? 'previous step'}`;

  return (
    <nav className="subnav" aria-label="Step navigation">
      <div className='subnav-back'>
        {skeleton && <Skeleton className='subnav-back' variant={SkeletonVariant.rectangular} />}
        {!skeleton && onClick && selectedStep?.id ?
          <button
            className='subnav-back-button'
            type="button"
            aria-label={backLabel}
            onClick={() => onClick?.(steps && steps[0])}
          >
            <div className='subnav-back-button__icon' aria-hidden="true"></div>
          </button> : <></>
        }
      </div>
      <div className="subnav-center">
        {!skeleton ?
          <p className="subnav-title">{selectedStep?.name}</p> :
          <Skeleton className='subnav-title' variant={SkeletonVariant.text} />
        }
        {!skeleton ?
          <p
            className="subnav-count"
            aria-label={`Step ${stepNumber} of ${totalSteps}`}
          >
            {stepNumber + '/' + totalSteps}
          </p> :
          <Skeleton className='subnav-count' variant={SkeletonVariant.text} />
        }
      </div>
      <div className='subnav-close'>
        {skeleton && <Skeleton className='subnav-close' variant={SkeletonVariant.rectangular} />}
      </div>
    </nav>
  );
};