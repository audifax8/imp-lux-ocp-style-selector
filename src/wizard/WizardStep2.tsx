// ─────────────────────────────────────────────────────────────────────────────
// CHUNK LAZY — WizardStep2
// Solo se descarga cuando el usuario ha seleccionado un tipo en Step 1.
// El SCSS se inyecta al cargar el módulo, antes de que React monte el componente.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import step2Styles from './WizardStep2.scss?inline'
import { activeBrand } from '@/brands/detect'
import {
  fetchModels,
  getCategoriesByType,
  getModelsByType,
  type ApiModel,
  type ApiModelsResponse,
  type ModelCategory,
} from '@/api/models'
import type { GlassType } from './types'
import { useLabels } from '@/labels/useLabels'
import { interpolate } from '@/labels/types'

// Inyección de SCSS al cargar el chunk (una sola vez, a nivel de módulo)
const styleEl = document.createElement('style')
styleEl.dataset.id = 'wizard-step2'
styleEl.textContent = step2Styles
document.head.appendChild(styleEl)

// Valor especial para el filtro "Todos"
const ALL = '__all__'

// ── Skeleton interno (mientras la API responde) ──────────────────────────────

const DataSkeleton = ({ label }: { label: string }) => (
  <div role="status" aria-live="polite" aria-label={label}>
    <div className="step2-skeleton__header" />
    <div className="step2-skeleton__grid">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="step2-skeleton__card" />
      ))}
    </div>
  </div>
)

// ── Props ───────────────────────────────────────────────────────────────────

interface Props {
  type: GlassType
  onBack: () => void
}

// ── Componente ──────────────────────────────────────────────────────────────

const WizardStep2 = ({ type, onBack }: Props) => {
  const [data, setData] = useState<ApiModelsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const labels = useLabels()

  const typeLabels: Record<GlassType, string> = {
    sunglasses: labels.step2.sunglasses,
    eyeglasses: labels.step2.eyeglasses,
    'kids-sunglasses': labels.step2.kidsSunglasses,
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null)
    setError(null)
    setSelectedCategory(ALL)
    setSelectedId(null)

    fetchModels(activeBrand)
      .then(setData)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error loading models')
      })
  }, [type])

  // Categorías dinámicas: vienen tal cual del response de la API
  const categories: ModelCategory[] = data ? getCategoriesByType(data, type) : []

  // Modelos a mostrar según el filtro seleccionado
  const visibleModels: ApiModel[] =
    data === null
      ? []
      : selectedCategory === ALL
        ? getModelsByType(data, type)
        : (categories.find(c => c.name === selectedCategory)?.models ?? [])

  const showCategoryFilter = categories.length > 1

  const handleConfirm = () => {
    const model = visibleModels.find(m => m.modelCode === selectedId)
    if (model) window.open(model.pageUrl, '_blank', 'noopener')
  }

  return (
    <div className="step2">
      {/* Navegación */}
      <nav className="wizard-nav" aria-label={labels.step2.breadcrumbAria}>
        <ol className="wizard-nav__list">
          <li>
            <button
              className="wizard-nav__back"
              onClick={onBack}
              aria-label={labels.step2.backAria}
            >
              {labels.step2.back}
            </button>
          </li>
          <li aria-hidden="true"><span className="wizard-nav__sep">/</span></li>
          <li aria-current="page">
            <span className="wizard-nav__current">{typeLabels[type]}</span>
          </li>
        </ol>
      </nav>

      {/* Error */}
      {error !== null && (
        <div className="step2__error" role="alert">
          <p>{error}</p>
          <button onClick={() => { setError(null); setData(null) }}>
            {labels.step2.retry}
          </button>
        </div>
      )}

      {/* Skeleton de carga de datos */}
      {data === null && error === null && (
        <DataSkeleton label={labels.step2.loading} />
      )}

      {/* Contenido */}
      {data !== null && (
        <>
          <div className="step2__header">
            <h2 className="step2__title">{typeLabels[type]}</h2>
            <span className="step2__count">
              {interpolate(labels.step2.modelsCount, {
                count: String(visibleModels.length),
                brand: activeBrand.toUpperCase(),
              })}
            </span>
          </div>

          {/* Filtros de categoría — se renderizan solo si hay más de una */}
          {showCategoryFilter && (
            <div
              className="step2__filters"
              role="group"
              aria-label={labels.step2.filterAria}
            >
              <button
                className={`step2__filter-chip${selectedCategory === ALL ? ' step2__filter-chip--active' : ''}`}
                aria-pressed={selectedCategory === ALL}
                onClick={() => { setSelectedCategory(ALL); setSelectedId(null) }}
              >
                {labels.step2.filterAll}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.name}
                  className={`step2__filter-chip${selectedCategory === cat.name ? ' step2__filter-chip--active' : ''}`}
                  aria-pressed={selectedCategory === cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setSelectedId(null) }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Grid de modelos */}
          <div className="step2__grid" role="list">
            {visibleModels.map(model => (
              <button
                key={model.modelCode}
                role="listitem"
                className={`model-card${selectedId === model.modelCode ? ' model-card--selected' : ''}`}
                aria-pressed={selectedId === model.modelCode}
                aria-label={`${model.label}${model.promoBadge ? `, ${model.promoBadge}` : ''}${selectedId === model.modelCode ? ', selected' : ''}`}
                onClick={() => setSelectedId(model.modelCode)}
              >
                <div className="model-card__media">
                  <img
                    src={model.thumbnailUrl}
                    alt=""
                    className="model-card__img"
                    loading="lazy"
                  />
                  {model.promoBadge && (
                    <span className="model-card__badge" aria-hidden="true">
                      {model.promoBadge}
                    </span>
                  )}
                </div>
                <span className="model-card__name" aria-hidden="true">
                  {model.label}
                </span>
              </button>
            ))}
          </div>

          {/* Confirmación */}
          <div className="step2-confirm">
            <button
              disabled={selectedId === null}
              onClick={handleConfirm}
              aria-disabled={selectedId === null}
            >
              {selectedId ? labels.step2.confirm : labels.step2.confirmDisabled}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default WizardStep2
