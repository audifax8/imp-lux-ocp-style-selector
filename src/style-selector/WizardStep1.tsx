// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — WizardStep1
// Este módulo se descarga solo cuando el Wizard lo necesita (React.lazy).
// El SCSS se inyecta al cargar el módulo, antes de que React monte el componente.
// ─────────────────────────────────────────────────────────────────────────────
import step1Styles from './WizardStep1.scss?inline'
import type { GlassType } from './types'
import { useLabels } from '@/labels/useLabels'

// Inyección de SCSS al cargar el chunk (una sola vez, a nivel de módulo)
const styleEl = document.createElement('style')
styleEl.dataset.id = 'wizard-step1'
styleEl.textContent = step1Styles
document.head.appendChild(styleEl)

interface Props {
  onSelect: (type: GlassType) => void
}

const WizardStep1 = ({ onSelect }: Props) => {
  const labels = useLabels()

  const types = [
    { id: 'sunglasses' as GlassType,      icon: '🕶️', ...labels.step1.sunglasses },
    { id: 'eyeglasses' as GlassType,      icon: '👓', ...labels.step1.eyeglasses },
    { id: 'kids-sunglasses' as GlassType, icon: '🌈', ...labels.step1.kidsSunglasses },
  ]

  return (
    <section className="step1" aria-labelledby="step1-title">
      <h2 id="step1-title" className="step1__title">{labels.step1.title}</h2>
      <div className="step1__grid" role="list">
        {types.map(({ id, label, sub, icon }) => (
          <button
            key={id}
            role="listitem"
            className="step1-card"
            onClick={() => onSelect(id)}
            aria-label={`${label} — ${sub}`}
          >
            <span className="step1-card__icon" aria-hidden="true">{icon}</span>
            <span className="step1-card__label">{label}</span>
            <span className="step1-card__sub">{sub}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default WizardStep1
