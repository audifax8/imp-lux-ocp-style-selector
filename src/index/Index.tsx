// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — Index
// Se descarga cuando el modo activo es 'index'.
// El SCSS ya fue inyectado en bootstrap-index antes del mount.
// ─────────────────────────────────────────────────────────────────────────────
import { lazy, Suspense, useState, useEffect } from 'react'
import DarkModeSwitch from '@/components/DarkModeSwitch'
import { getCurrentTheme, toggleTheme, type Theme } from '@/theme/darkMode'
import { useLabels } from '@/labels/useLabels'

const MOUNT_ID = 'imp-lux-ocp-style-selector'

const IndexContent = lazy(() => import('./IndexContent'))

interface Product {
  id: number;
  vendorId: string;
  name: string
}

const Index = () => {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  const labels = useLabels()

  const [products, setProducts] = useState<Product[]>();

  useEffect(() => {
    const container = document.getElementById(MOUNT_ID)
    if (container) container.setAttribute('aria-label', labels.widget.title)

    fetch('https://cdn-prod.fluidconfigure.com/static/configs/3.13.0/prod/dev/1581/report.json')
      .then(response => {
        if (!response?.ok) {
          return;
        }
        response.json().then(data => {
          setProducts(data.productDetails);
        });
      });
  }, [labels.widget.title])

  return (
    <div className="index">
      <h1 className="sr-only">{labels.widget.title}</h1>
      <div className="index__toolbar">
        <DarkModeSwitch
          theme={theme}
          onToggle={() => setTheme(prev => toggleTheme(prev))}
        />
      </div>
      <Suspense fallback={null}>
        <IndexContent />
        {products && products.length && 
          <ul>
            {products?.map((p) => <li key={p.id}>{p.vendorId}</li>)}
          </ul>
        }
      </Suspense>
    </div>
  )
}

export default Index
