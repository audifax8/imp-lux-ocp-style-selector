// Componente raíz del modo demo.
// Layouts:
//   Desktop — header con logo + stepper + menú, 3 cards centradas con max-width
//   Mobile  — header logo + menú, sub-nav con atrás/título/cerrar, cards a ancho completo

import { Card } from "@/style-selector/components/card"
import { Button } from "@/style-selector/components/category-button"
import { Header } from "@/style-selector/components/header"
import { SubNav } from "@/style-selector/components/sub-nav"

const AppDemo = () => (
  <div className="demo ligh">
    <Header />
    <Header skeleton={true} />

    {/* Sub-nav — solo visible en mobile */}
    <SubNav />
    <SubNav skeleton={true} />
    <Button label={'test'} />
    <Button label={'test'} skeleton={true} />
    <Button label={'test'} selected={true} />

    <main className="demo-content">
      <Card title="Test" skeleton={true} />
      <Card title="Test" skeleton={false} />
    </main>
  </div>
)

export default AppDemo
