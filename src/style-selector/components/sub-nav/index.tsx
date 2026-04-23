import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';
import type { StepWithTranslation } from '@/declarations/interfaces';
import { useI18n } from '@/style-selector/context/i18n-context';

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
  const i18n = useI18n();
  const stepNumber = (selectedStep?.id ?? 0) + 1;
  const totalSteps = steps?.length ?? 0;
  const previousStepName = steps?.[0]?.name ?? (i18n?.getLabel('style_selector_subnav_previous_step', 'previous step') ?? 'previous step');
  const backLabel = i18n?.getLang('style_selector_subnav_back_label', 'Back to {step}', { step: previousStepName }) ?? `Back to ${previousStepName}`;
  const stepCounterLabel = i18n?.getLang('style_selector_subnav_step_of', 'Step {n} of {m}', { n: stepNumber, m: totalSteps }) ?? `Step ${stepNumber} of ${totalSteps}`;
  const navLabel = i18n?.getLabel('style_selector_subnav_label', 'Step navigation') ?? 'Step navigation';

  return (
    <nav className="subnav" aria-label={navLabel}>
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
            aria-label={stepCounterLabel}
          >
            {stepNumber + '/' + totalSteps}
          </p> :
          <Skeleton className='subnav-count' variant={SkeletonVariant.text} />
        }
      </div>
      <div className='subnav-close'>
        {skeleton && <Skeleton className='subnav-close' variant={SkeletonVariant.rectangular} />}
        {!skeleton && onClick && (selectedStep?.id === 0) ?
          <button
            className='subnav-close-button'
            type="button"
            aria-label={backLabel}
            onClick={() => onClick?.(steps && steps[0])}
          >
            <div className='subnav-close-button__icon' aria-hidden="true"></div>
          </button> : <></>
        }
      </div>
    </nav>
  );
};