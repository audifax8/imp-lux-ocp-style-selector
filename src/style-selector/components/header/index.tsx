import React, { useState } from 'react';

import { SkeletonVariant } from '@/declarations/enums';
import { Skeleton } from '@/shared/components/skeleton';
import type { StepWithTranslation } from '@/declarations/interfaces';

import { getCurrentTheme, toggleTheme, type Theme } from '@/shared/theme/darkMode'
import DarkModeSwitch from '@/shared/components/dark-mode-switch';
import { useI18n } from '@/style-selector/context/i18n-context';

import './index.scss';
interface HeaderProps {
  steps?: StepWithTranslation[];
  selectedStep?: StepWithTranslation;
  skeleton?: boolean;
  onClick?: (step: StepWithTranslation) => void;
}

export const Header: React.FC<HeaderProps> = ({
  steps,
  selectedStep,
  skeleton,
  onClick
}) => {
  const isClickable = typeof onClick === 'function';
  const i18n = useI18n();

  const [theme, setTheme] = useState<Theme>(getCurrentTheme);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOListElement>) => {
    if (!steps?.length) return;
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
    const currentIndex = tabs.findIndex(t => t === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      tabs[nextIndex].focus();
    }
  };

  return (
    <header className="header">
      <div className="header-logo" aria-hidden="true">
        {!skeleton ?
          <div className="header-logo__icon"></div> :
          <Skeleton className="header-logo__icon yr-skeleton" variant={SkeletonVariant.text} />
        }
      </div>

      <nav className="header-nav" aria-label={i18n?.getLabel('style_selector_header_nav_label', 'Steps') ?? 'Steps'}>
        <ol
          className="header-nav-items"
          role="tablist"
          onKeyDown={handleKeyDown}
        >
          {steps?.map((step, i) => {
            const isDisabled = step?.id > (selectedStep?.id ?? 0);
            const isSelected = step?.id === selectedStep?.id;
            return !skeleton ? (
              <li role="presentation" className={`${isDisabled ? 'header-nav-item__disabled' : ''}`} key={i}>
                <button
                  role="tab"
                  className={`header-nav-item ${isSelected ? 'header-nav-item__selected' : ''} ${isDisabled ? 'header-nav-item__disabled' : ''}`}
                  aria-selected={isSelected}
                  aria-disabled={isDisabled || undefined}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={!isDisabled && isClickable ? () => onClick(step) : undefined}
                >
                  {((step.id ?? 0) + 1)}. {step?.name}
                </button>
              </li>
            ) : (
              <Skeleton
                key={i}
                className="header-nav-item__skeleton yr-skeleton"
                variant={SkeletonVariant.text}
              />
            );
          })}
        </ol>
      </nav>

      <div className="header-switch">
        <DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />
      </div>

      <div className="header-menu">
        {!skeleton ?
          <button className="header-menu__icon" aria-label={i18n?.getLabel('style_selector_header_menu_label', 'Menu') ?? 'Menu'} type="button"></button> :
          <Skeleton className='header-menu__icon yr-skeleton' variant={SkeletonVariant.text} />
        }
      </div>
    </header>
  );
};
