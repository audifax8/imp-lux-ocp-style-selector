import React from 'react';

import type { Step } from '@/style-selector/api/models';

import { SkeletonVariant } from '@/declarations/enums';

import { Skeleton } from '@/shared/components/skeleton';
//import { getCurrentTheme, type Theme } from '@/shared/theme/darkMode'
//import DarkModeSwitch from '@/shared/components/dark-mode-switch';

/*<DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />*/

import './index.scss';
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

  //const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  
  return (
    <header className="header">
      <div className="header-logo" aria-label="Menu" role="button" tabIndex={0}>
        {!skeleton ? 
          <div className="header-logo__icon"></div> :
          <Skeleton className="header-logo__icon yr-skeleton" variant={SkeletonVariant.text} />
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
              (!skeleton ? (<li
                role="none"
                key={i}>
                  <Component
                    className={`header-nav-item ${skeleton ? 'yr-skeleton' : ''} ${step.id === selectedStep?.id ? 'header-nav-item__selected' : ''}`}
                    onClick={() => onClick?.(step)}
                    {...(isClickable && {
                      type: 'button',
                      'aria-label': '',
                    })}
                  >
                    <a role="menuitem">{step?.name}</a>
                  </Component>
              </li>) : (<Skeleton className="header-nav-item__skeleton yr-skeleton" variant={SkeletonVariant.text} />))
          )
        } 
        </ul>
      </nav>
      <div className="header-switch">
        {/*  */}
      </div>
      <div className="header-menu" aria-label="Menu" role="button" tabIndex={0}>
        {!skeleton ? 
          <div className="header-menu__icon"></div> :
          <Skeleton className='header-menu__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
    </header>
  );
};