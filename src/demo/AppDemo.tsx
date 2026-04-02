// Componente raíz del modo demo.
// Layout: pantalla de carga RTR a viewport completo.
//   Fondo: gradiente gris neutro (simula entorno de estudio)
//   Contenido: brand + título + barra de progreso centrados, ligeramente por encima del centro

import { getSVGURL } from "@/shared/assets"
import { Logo } from "@/style-selector/components/logo"

const AppDemo = () => (
  <div className="demo" role="main">
    <div className="demo-scene">
      {/* role="status" + aria-live="polite": announces loading state to AT on mount */}
      <div className="demo-overlay" role="status" aria-live="polite">
        <Logo className={'demo-brand'} url={getSVGURL('EssilorLuxotticaBlack', 'wl')} />
        <p className="demo-title">Starting your Remix experience</p>
        <div
          className="demo-progress"
          role="progressbar"
          aria-label="Loading"
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="demo-progress__fill" />
        </div>
      </div>
    </div>
  </div>
)

export default AppDemo
