const CARD_COUNT = 8

const IndexSkeleton = () => (
  <div className="index-skeleton" role="status" aria-label="Loading products">
    <div className="index-skeleton__header" />
    <div className="index-skeleton__grid">
      {Array.from({ length: CARD_COUNT }, (_, i) => (
        <div key={i} className="index-skeleton__card" />
      ))}
    </div>
  </div>
)

export default IndexSkeleton
