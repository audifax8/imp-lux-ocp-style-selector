// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — Configurator
// Se descarga solo cuando el modo activo es 'configurator'.
// El SCSS ya fue inyectado en bootstrap-configurator antes del mount.
// ─────────────────────────────────────────────────────────────────────────────
import { lazy, useState, useEffect } from 'react'
import DarkModeSwitch from '@/shared/components/dark-mode-switch'
import { getCurrentTheme, toggleTheme, type Theme } from '@/shared/theme/darkMode'
import { useLabels } from '@/labels/useLabels'

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
      <Model />
    </div>
  )
}

export default Configurator
