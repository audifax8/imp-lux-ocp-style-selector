// Componente raíz del modo demo.
// Layouts:
//   Desktop — header con logo + stepper + menú, 3 cards centradas con max-width
//   Mobile  — header logo + menú, sub-nav con atrás/título/cerrar, cards a ancho completo

import { Card } from "@/style-selector/components/card"

const STEPS = ['1. Type', '2. Prescription', '3. Model', '4. Inspiration']

/*
const CARDS = [
  { label: 'Eyeglasses' },
  { label: 'Sunglasses' },
  { label: 'Kids sunglasses' },
  { label: 'Your Designs (3)' },
]
*/

const AppDemo = () => (
  <div className="demo ligh">
    <header className="demo-header">
      <span className="demo-header__logo">EssilorLuxottica</span>

      {/* Stepper — solo visible en desktop */}
      <nav className="demo-header__steps" aria-label="Steps">
        {STEPS.map((step, i) => (
          <span
            key={step}
            className={`demo-header__step${i === 0 ? ' demo-header__step--active' : ''}`}
          >
            {step}
          </span>
        ))}
      </nav>

      <div className="demo-header__menu" aria-label="Menu" role="button" tabIndex={0}>
        <span /><span /><span />
      </div>
    </header>

    {/* Sub-nav — solo visible en mobile */}
    <div className="demo-subnav">
      <button className="demo-subnav__back" aria-label="Back">&#8249;</button>
      <div className="demo-subnav__center">
        <span className="demo-subnav__title">Page title</span>
        <span className="demo-subnav__count">X/X</span>
      </div>
      <button className="demo-subnav__close" aria-label="Close">&#x2715;</button>
    </div>

    <main className="demo-content">
      <Card title="Test" skeleton={true} />
      <Card title="Test" skeleton={false} />
    </main>

    <div className="demo-floor" />
  </div>
)

/*
{CARDS.map((card, i) => (
        <div className="demo-card" key={i}>
          <p className="demo-card__label">{card.label}</p>
          <div className="demo-card__preview" role="img" aria-label="Product preview" />
        </div>
      ))}
*/
export default AppDemo
