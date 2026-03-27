// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — Configurator
// Se descarga solo cuando el modo activo es 'configurator'.
// El SCSS ya fue inyectado en bootstrap-configurator antes del mount.
// ─────────────────────────────────────────────────────────────────────────────
import { lazy, Suspense, useState, useEffect } from 'react'
import ConfiguratorSkeleton from './ConfiguratorSkeleton'
import DarkModeSwitch from '../components/DarkModeSwitch'
import { getCurrentTheme, toggleTheme, type Theme } from '../theme/darkMode'
import { useLabels } from '../labels/useLabels'

const MOUNT_ID = 'imp-lux-ocp-style-selector'

const Model = lazy(() => import('./model/Model'))

const Configurator = () => {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  const labels = useLabels()

  useEffect(() => {
    const container = document.getElementById(MOUNT_ID)
    if (container) container.setAttribute('aria-label', labels.widget.title)
  }, [labels.widget.title])

  return (
    <div className="configurator">
      <h1 className="sr-only">{labels.widget.title}</h1>
      <div className="configurator__toolbar">
        <DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />
      </div>
      <Suspense fallback={<ConfiguratorSkeleton />}>
        <Model />
      </Suspense>
    </div>
  )
}

export default Configurator
