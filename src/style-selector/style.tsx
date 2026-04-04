import { Card } from '@/style-selector/components/card'
import { Header } from '@/style-selector/components/header'
import { SubNav } from '@/style-selector/components/sub-nav'
import { useData } from '@/style-selector/providers/context'

const Style = () => {
  const data = useData()
  console.log(data);

  return (
    <div className='style-selector-skeleton'>
      <Header skeleton={false} />
      <SubNav skeleton={false} />
      <main className='style-selector-skeleton__elements'>
        <Card title='Test' skeleton={false} />
        <Card title='Test' skeleton={false} />
        <Card title='Test' skeleton={false} />
      </main>
    </div>
  )
}

export default Style
