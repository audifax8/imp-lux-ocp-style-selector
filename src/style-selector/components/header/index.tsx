import React from 'react';
import { Skeleton } from '@/shared/components/skeleton';
import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';
import { Logo } from '../logo';
import { getSVGURL } from '@/shared/assets';


interface HeaderProps {
  skeleton?: boolean;
  onClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  skeleton,
  //onClick,
}) => {

  const STEPS = ['1. Type', '2. Prescription', '3. Model', '4. Inspiration']

  return (
    <header className="demo-header">
      {!skeleton ?
        <Logo className={'yr-button__icon'} url={getSVGURL('EssilorLuxotticaBlack', 'wl')} /> :
        <Skeleton className='demo-header__logo' variant={SkeletonVariant.rectangular} />
      }

      {/* Stepper — solo visible en desktop */}
      <nav className="demo-header__steps" aria-label="Steps">
        {STEPS.map(
          (step, i) =>
            !skeleton ? (
              <span
                key={step}
                className={`demo-header__step${i === 0 ? ' demo-header__step--active' : ''}`}
              >
                {step}
              </span>
              ) : (<Skeleton key={step} className='demo-header__step' variant={SkeletonVariant.text} />)
          )
        }
      </nav>

      {!skeleton ? (
        <div className="demo-header__menu" aria-label="Menu" role="button" tabIndex={0}>
          <span/>
          <span />
          <span />
        </div>
      ) : <Skeleton className='demo-header__menu' variant={SkeletonVariant.text} />}
    </header>
  );
};