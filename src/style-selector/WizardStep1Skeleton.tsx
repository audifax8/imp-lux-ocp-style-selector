import { useLabels } from '@/labels/useLabels'

const WizardStep1Skeleton = () => {
  const labels = useLabels()
  return (
    <div
      className="step1-skeleton"
      role="status"
      aria-live="polite"
      aria-label={labels.step1.loading}
    >
      <div className="step1-skeleton__card" />
      <div className="step1-skeleton__card" />
      <div className="step1-skeleton__card" />
    </div>
  )
}

export default WizardStep1Skeleton
