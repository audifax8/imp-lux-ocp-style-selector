import { Card } from '@/style-selector/components/card'
import { Header } from '@/style-selector/components/header'
import { SubNav } from '@/style-selector/components/sub-nav'
import { activeBrand } from '@/white-label/detect'
import type { Step } from './api/models'

const StyleSelectorSkeleton = () => {
  const steps: Step[] = [
    {
      id: 0,
      name: '1. Type'
    },
    {
      id: 1,
      name: '2. Model'
    }
  ];

  return (
    <div className={`style-selector-skeleton style-selector-skeleton-${activeBrand}`}>
      <Header skeleton={true} steps={steps}/>
      <SubNav skeleton={true} />
      <main className='style-selector-skeleton__elements'>
        <Card title='Test' skeleton={true} />
        <Card title='Test' skeleton={true} />
        <Card title='Test' skeleton={true} />
      </main>
    </div>
  )
}

export default StyleSelectorSkeleton
