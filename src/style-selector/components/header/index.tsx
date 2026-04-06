import React, { useState } from 'react';

import { Logo } from '@/style-selector/components/logo';
import { getSVGURL } from '@/shared/assets';
import { SkeletonVariant } from '@/declarations/enums';
import { Skeleton } from '@/shared/components/skeleton';
import type { Step } from '@/style-selector/api/models';
import { getCurrentTheme, toggleTheme, type Theme } from '@/shared/theme/darkMode'

import './index.scss';
import DarkModeSwitch from '@/shared/components/dark-mode-switch';
interface HeaderProps {
  steps?: Step[];
  selectedStep?: Step;
  skeleton?: boolean;
  onClick?: (step: Step) => void;
}

export const Header: React.FC<HeaderProps> = ({
  steps,
  selectedStep,
  skeleton,
  onClick
}) => {
  const isClickable = typeof onClick === 'function';
  const Component = isClickable ? 'button' : 'div';

  const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  
  return (
    <header className="header">
      <div className="header-logo" aria-label="Menu" role="button" tabIndex={0}>
        {!skeleton ? 
          <div className={'header-logo__icon'}> </div> :
          <Skeleton className='header-logo__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
      
      <nav className="header-nav" aria-label="Steps">
        <ul
          className="header-nav-items"
          role="menubar"
          aria-label=""
        >
          {steps?.map(
            (step, i) =>
              (<li
                role="none"
                className={`header-nav-item ${skeleton ? 'yr-skeleton' : ''} ${step.id === selectedStep?.id ? 'header-nav-item__selected' : ''}`}
                key={i}>
                  <Component
                    className='header-nav-items'
                    onClick={() => onClick?.(step)}
                    {...(isClickable && {
                      type: 'button',
                      'aria-label': '',
                    })}
                  >
                    <a role="menuitem">{step?.name}</a>
                  </Component>
              </li>)
            )}
        </ul>
      </nav>
      <div className="header-switch">
        <DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />
      </div>
      <div className="header-menu" aria-label="Menu" role="button" tabIndex={0}>
        {!skeleton ? 
          <Logo className={'header-menu__icon'} url={getSVGURL('Menu', 'wl')} height={20} width={20} /> :
          <Skeleton className='header-menu__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
    </header>
  );
};