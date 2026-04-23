import React from 'react';

import { StepType } from '@/declarations/enums';
import type { LuxApiModel, FlatModel, StepWithTranslation } from '@/declarations/interfaces';
import { CategoryFilterComponent } from '@/style-selector/components/category-filter';
import { ModelCard } from '@/style-selector/components/model';
import { useI18n } from '@/style-selector/context/i18n-context';

interface ModelStepProps {
  selectedStep: StepWithTranslation;
  subCategories: FlatModel[];
  selectedFlatModel: FlatModel | undefined;
  filteredModels: LuxApiModel[];
  selectedModel: LuxApiModel | undefined;
  onCategoryClick: (category: FlatModel) => void;
  onModelClick: (model: LuxApiModel) => void;
}

export const ModelStep = React.forwardRef<HTMLElement, ModelStepProps>(({
  selectedStep,
  subCategories,
  selectedFlatModel,
  filteredModels,
  selectedModel,
  onCategoryClick,
  onModelClick,
}, ref) => {
  const i18n = useI18n();
  const isInspirations = selectedStep?.type === StepType.INSPIRATIONS;

  const trendingLabel = i18n?.getLabel('style_selector_category_label_trending', 'Select trending styles or');
  const skipLabel = i18n?.getLabel('style_selector_category_label_skip', ' skip to customization');
  const opensNewTabLabel = i18n?.getLabel('style_selector_opens_new_tab', ', opens in new tab') ?? ', opens in new tab';

  return (
    <section
      ref={ref}
      className='style-selector__inspiration'
      aria-label={
        isInspirations
          ? i18n?.getLabel('style_selector_step_inspirations_title', 'Trending styles') ?? 'Trending styles'
          : i18n?.getLabel('style_selector_step_model_title', 'Select a model') ?? 'Select a model'
      }
    >
      {!isInspirations && (
        <CategoryFilterComponent
          subCategories={subCategories}
          selectedCategory={selectedFlatModel}
          onClick={onCategoryClick}
        />
      )}
      {isInspirations && (
        <div className='style-selector__inspiration__container'>
          <p className='style-selector__inspiration__container__label'>
            {trendingLabel}
            <a
              href={selectedModel?.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className='style-selector__inspiration__container__link'
            >
              {skipLabel}
              <span className="sr-only">{opensNewTabLabel}</span>
            </a>
          </p>
        </div>
      )}
      <ul
        className="style-selector__inspiration-list"
        role="list"
        aria-label={
          isInspirations
            ? i18n?.getLabel('style_selector_inspirations_list_label', 'Trending styles') ?? 'Trending styles'
            : i18n?.getLabel('style_selector_models_list_label', 'Models') ?? 'Models'
        }
      >
        {filteredModels?.map((model, i) => (
          <li
            className='style-selector__inspiration-list-item'
            key={i}
          >
            <ModelCard
              key={model.modelCode}
              title={model.label}
              imageSrc={model.thumbnailUrl}
              imageAlt={model.label}
              vendorId={model.vendorId}
              promoBadge={model.promoBadge}
              onClick={() => onModelClick(model)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
});

ModelStep.displayName = 'ModelStep';
