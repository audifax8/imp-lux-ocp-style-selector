import { createContext, useState, useEffect, type ReactNode } from 'react'
import type { Labels } from './types'
import { DEFAULT_LABELS } from './defaults'
import { fetchLabels } from './service'

export const LabelsContext = createContext<Labels>(DEFAULT_LABELS)

/**
 * Provee los labels a todo el árbol de componentes.
 * - Mientras la API carga, los componentes reciben DEFAULT_LABELS.
 * - Cuando la API responde, el contexto se actualiza y los componentes
 *   se re-renderizan con los valores reales.
 * - Si la API falla, los DEFAULT_LABELS permanecen activos silenciosamente.
 */
export const LabelsProvider = ({ children }: { children: ReactNode }) => {
  const [labels, setLabels] = useState<Labels>(DEFAULT_LABELS)

  useEffect(() => {
    fetchLabels()
      .then(setLabels)
      .catch(() => {
        // Error silencioso: la UI sigue funcionando con los DEFAULT_LABELS.
      })
  }, [])

  return (
    <LabelsContext.Provider value={labels}>
      {children}
    </LabelsContext.Provider>
  )
}
