import { Card } from "@/style-selector/components/card"
import { Header } from "@/style-selector/components/header"
import { SubNav } from "@/style-selector/components/sub-nav"

const WizardStep2Skeleton = () => {
  return (
    <div className="style-selector-skeleton">
      <Header skeleton={true} />
      <SubNav skeleton={true} />
      <main className="style-selector-skeleton__elements">
        <Card title="Test" skeleton={true} />
        <Card title="Test" skeleton={true} />
        <Card title="Test" skeleton={true} />
      </main>
    </div>
  )
}

export default WizardStep2Skeleton
