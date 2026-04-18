import { lazy, Suspense } from 'react'

import { StyleSelectorComponent } from '@/style-selector/lazy-imports'

// SharedSkeleton: chunk alternativo, se descarga SOLO cuando se renderiza.
// ?skeletonLoader=true → activo; ausente/false → skeletons originales (sin coste de red).
const _raw = new URLSearchParams(window.location.search).get('skeletonLoader')
const skeletonEnabled = _raw !== null && (_raw === '' || _raw === 'true')

const _skeleton = new URLSearchParams(window.location.search).get('skeleton')
const skeleton = _skeleton !== null && (_skeleton === '' || _skeleton === 'true')

const sharedSkeletonImport = skeletonEnabled
  ? import('@/shared/components/skeleton-loader')
  : import('@/style-selector/components/skeleton')
const SharedSkeleton = lazy(() => sharedSkeletonImport!)

const StyleSelector = () => {
  return (
    <Suspense fallback={<SharedSkeleton />}>
      {skeleton ? <SharedSkeleton /> : <StyleSelectorComponent />}
    </Suspense>
  )
}

export default StyleSelector
