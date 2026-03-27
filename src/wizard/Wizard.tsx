import { lazy, Suspense, useState, useEffect } from 'react'
import type { GlassType } from './types'
import WizardStep1Skeleton from './WizardStep1Skeleton'
import WizardStep2Skeleton from './WizardStep2Skeleton'
import DarkModeSwitch from '../components/DarkModeSwitch'
import { getCurrentTheme, toggleTheme, type Theme } from '../theme/darkMode'
import { useLabels } from '../labels/useLabels'

const WizardStep1 = lazy(() => import('./WizardStep1'))
const WizardStep2 = lazy(() => import('./WizardStep2'))

const MOUNT_ID = 'imp-lux-ocp-style-selector'

const Wizard = () => {
  const [selectedType, setSelectedType] = useState<GlassType | null>(null)
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  const labels = useLabels()

  // Sincroniza el aria-label del container con el label cargado desde la API.
  // main.tsx pone el valor por defecto antes del mount; aquí lo actualizamos
  // cuando los labels reales llegan.
  useEffect(() => {
    const container = document.getElementById(MOUNT_ID)
    if (container) container.setAttribute('aria-label', labels.widget.title)
  }, [labels.widget.title])

  return (
    <div className="wizard">
      <h1 className="sr-only">{labels.widget.title}</h1>
      <div className="wizard__toolbar">
        <DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />
      </div>

      {selectedType === null ? (
        <Suspense fallback={<WizardStep1Skeleton />}>
          <WizardStep1 onSelect={setSelectedType} />
        </Suspense>
      ) : (
        <Suspense fallback={<WizardStep2Skeleton />}>
          <WizardStep2
            type={selectedType}
            onBack={() => setSelectedType(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default Wizard
