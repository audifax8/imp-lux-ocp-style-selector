import { useState, useEffect } from 'react'

type ColorMode = 'inverse' | undefined

function getCurrentMode(): ColorMode {
  return document.documentElement.dataset.theme === 'dark' ? 'inverse' : undefined
}

export function useDarkMode(): ColorMode {
  const [mode, setMode] = useState<ColorMode>(getCurrentMode)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMode(getCurrentMode())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return mode
}
