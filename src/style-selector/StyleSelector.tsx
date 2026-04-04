import { lazy, Suspense, useEffect, useState } from 'react'

import { completeStyleSelectorPromise, StyleSelectorComponent } from '@/style-selector/lazy-imports'
import { fetchModels, type ApiModelsResponse } from '@/style-selector/api/models'

import { activeBrand } from '@/white-label/detect'

// SharedSkeleton: chunk alternativo, se descarga SOLO cuando se renderiza.
// ?skeletonLoader=true → activo; ausente/false → skeletons originales (sin coste de red).
const _raw = new URLSearchParams(window.location.search).get('skeletonLoader')
const skeletonEnabled = _raw !== null && (_raw === '' || _raw === 'true')

const sharedSkeletonImport = skeletonEnabled
  ? import('@/shared/components/skeleton-loader')
  : import('./WizardStep2Skeleton')
const SharedSkeleton = lazy(() => sharedSkeletonImport!)

const StyleSelector = () => {
  const [, setData] = useState<ApiModelsResponse | null>(null)

  useEffect(() => {
    fetchModels(activeBrand)
      .then((data) => {
        setData(data);
        completeStyleSelectorPromise();
      })
      .catch((err: unknown) => {
        console.log(err)
      })
  }, [])
  return (
    <Suspense fallback={<SharedSkeleton />}>
      <StyleSelectorComponent />
    </Suspense>
  )
}

export default StyleSelector
