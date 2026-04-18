import { StepType } from '@/declarations/enums';
import type { StepWithTranslation } from '@/declarations/interfaces';
import { Card } from '@/style-selector/components/card';
import { Header } from '@/style-selector/components/header';
import { SubNav } from '@/style-selector/components/sub-nav';
import { activeBrand } from '@/white-label/detect';
import { useI18n } from '@/style-selector/context/i18n-context';


const StyleSelectorSkeleton = () => {
  const i18n = useI18n();
  const steps: StepWithTranslation[] = [
    {
      id: 0,
      name: '1. Type',
      type: StepType.TYPE
    },
    {
      id: 1,
      name: '2. Model',
      type: StepType.MODEL
    },
    {
      id: 2,
      name: '3. Inspiration',
      type: StepType.INSPIRATIONS
    }
  ];

  return (
    <div className={`style-selector-skeleton style-selector-skeleton-${activeBrand}`}>
      <Header skeleton={true} steps={steps}/>
      <SubNav skeleton={true} />
      <section
        className='style-selector-skeleton__elements'
        aria-label={i18n?.getLabel('style_selector_loading_label', 'Loading') ?? 'Loading'}
        aria-busy="true"
      >
        <Card title='Test' skeleton={true} />
        <Card title='Test' skeleton={true} />
        <Card title='Test' skeleton={true} />
      </section>
    </div>
  )
}

export default StyleSelectorSkeleton
