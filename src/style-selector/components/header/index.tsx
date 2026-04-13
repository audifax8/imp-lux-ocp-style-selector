import React from 'react';


import { SkeletonVariant } from '@/declarations/enums';

import type { Step } from '@/declarations/interfaces';
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
  console.log({steps, selectedStep});

  //const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  
  return (
    <header className="header">
      <div className="header-logo">
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
            (step, i) => {
              const isDisabled = step.id > (selectedStep?.id ?? 0);
              const StepComponent = (isClickable && !isDisabled) ? 'button' : 'div';
              return !skeleton ?
                (<li
                  className='header-nav-items'
                  role="none"
                  aria-current={`${step.id === selectedStep?.id ? true : false}`}
                  key={i}>
                    <StepComponent
                      className={`header-nav-item ${step.id === selectedStep?.id ? 'header-nav-item__selected' : ''} ${isDisabled ? 'header-nav-item__disabled' : ''}`}
                      onClick={!isDisabled ? () => onClick?.(step) : undefined}
                      {...(isClickable && !isDisabled && {
                        type: 'button',
                        'aria-label': `${step.name}`,
                        'aria-current': `${step.id === selectedStep?.id ? true : false}`
                      })}
                    >
                      <a role="menuitem">{(step.id + 1)}. {step?.name}</a>
                    </StepComponent>
                </li>) :
                (<Skeleton
                  key={i}
                  className="header-nav-item__skeleton yr-skeleton"
                  variant={SkeletonVariant.text}
                />)
          }
        )}
        </ul>
      </nav>
      <div className="header-switch">
        {/*  */}
      </div>
      <div className="header-menu">
        {!skeleton ? 
          <div className="header-menu__icon" aria-label="Menu" role="button" tabIndex={0}></div> :
          <Skeleton className='header-menu__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
    </header>
  );
};