import { useLabels } from '../labels/useLabels'

const ConfiguratorSkeleton = () => {
  const labels = useLabels()
  return (
    <div
      className="configurator-skeleton"
      role="status"
      aria-live="polite"
      aria-label={labels.configurator.loading}
    >
      <div className="configurator-skeleton__bar configurator-skeleton__title" />
      <div className="configurator-skeleton__bar configurator-skeleton__subtitle" />
      <div className="configurator-skeleton__body" />
    </div>
  )
}

export default ConfiguratorSkeleton
