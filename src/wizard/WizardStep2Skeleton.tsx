import { useLabels } from '@/labels/useLabels'

const WizardStep2Skeleton = () => {
  const labels = useLabels()
  return (
    <div role="status" aria-live="polite" aria-label={labels.step2.loading}>
      <div className="step2-skeleton__header" />
      <div className="step2-skeleton__grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="step2-skeleton__card" />
        ))}
      </div>
    </div>
  )
}

export default WizardStep2Skeleton
