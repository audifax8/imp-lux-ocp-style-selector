import React from 'react';

import { Card } from '@/style-selector/components/card';
import { activeBrand } from '@/white-label/detect';
import { getSVGURLByType } from '@/shared/assets';
import { useI18n } from '@/style-selector/context/i18n-context';
import type { ModelsTranslated } from '@/declarations/interfaces';

interface TypeStepProps {
  modelsTypes: ModelsTranslated[] | undefined;
  onClick: (type: string) => void;
}

export const TypeStep: React.FC<TypeStepProps> = ({ modelsTypes, onClick }) => {
  const i18n = useI18n();

  return (
    <section
      className='style-selector__elements'
      aria-label={i18n?.getLabel('style_selector_step_type_title', 'Select glasses type') ?? 'Select glasses type'}
    >
      <ul
        className='style-selector__types-list'
        role="list"
        aria-label={i18n?.getLabel('style_selector_step_type_list_label', 'Glasses types') ?? 'Glasses types'}
      >
        {modelsTypes
          ? modelsTypes.map((model, index) => (
              <li key={index}>
                <Card
                  length={model.length}
                  title={model.translation}
                  imageSrc={getSVGURLByType(model.name, activeBrand, 'img')}
                  imageAlt={model.translation}
                  onClick={() => onClick(model.name)}
                />
              </li>
            ))
          : [0, 1, 2].map(i => (
              <li key={i} aria-hidden="true">
                <Card skeleton />
              </li>
            ))
        }
      </ul>
    </section>
  );
};
