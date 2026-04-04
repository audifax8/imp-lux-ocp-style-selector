import React from 'react';
//import { Skeleton } from '@/shared/components/skeleton';
//import { SkeletonVariant } from '@/declarations/enums';

import './index.scss';
import { Logo } from '../logo';
import { getSVGURL } from '@/shared/assets';
import { SkeletonVariant } from '@/declarations/enums';
import { Skeleton } from '@/shared/components/skeleton';


interface HeaderProps {
  skeleton?: boolean;
  onClick?: () => void;
}

/*
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
        */

export const Header: React.FC<HeaderProps> = ({
  skeleton,
  //onClick,
}) => {
  const STEPS = ['1. Type', '2. Prescription', '3. Model', '4. Inspiration']
  return (
    <header className="header">
      <div className="header-logo" aria-label="Menu" role="button" tabIndex={0}>
        {!skeleton ? 
          <Logo className={'header-logo__icon'} url={getSVGURL('EssilorLuxotticaBlack', 'wl')} /> :
          <Skeleton className='header-logo__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
      
      <nav className="header-nav" aria-label="Steps">
        <ul className="header-nav-items"
          role="menubar"
          aria-label="Mythical University">
            {STEPS.map(
              (step, i) =>
                (<li
                  role="none"
                  className={`header-nav-item ${skeleton ? 'yr-skeleton' : ''}`}
                  key={i}><a role="menuitem">
                    {step}</a>
                </li>))}
        </ul>
      </nav>
      <div className="header-menu" aria-label="Menu" role="button" tabIndex={0}>
        {!skeleton ? 
          <Logo className={'header-menu__icon'} url={getSVGURL('Menu', 'wl')} height={20} width={20} /> :
          <Skeleton className='header-menu__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
    </header>
  );
};