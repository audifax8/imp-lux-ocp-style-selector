const ModelSkeleton = () => (
  <div className="model-skeleton" role="status" aria-live="polite" aria-label="Loading model">
    <div className="model-skeleton__glasses">
      <div className="model-skeleton__temple" />
      <div className="model-skeleton__lens" />
      <div className="model-skeleton__bridge" />
      <div className="model-skeleton__lens" />
      <div className="model-skeleton__temple" />
    </div>
    <div className="model-skeleton__label" />
  </div>
)

export default ModelSkeleton
