import './LoadingState.css';

export default function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-cards">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="loading-card" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="skeleton loading-card-image" />
            <div className="loading-card-content">
              <div className="skeleton loading-card-title" />
              <div className="skeleton loading-card-brand" />
              <div className="loading-card-footer">
                <div className="skeleton loading-card-price" />
                <div className="skeleton loading-card-stars" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="loading-text">
        <div className="loading-spinner-large" />
        <p>Searching across verified sources...</p>
        <p className="loading-subtext">Fetching from eBay, OpenFoodFacts, openFDA & more</p>
      </div>
    </div>
  );
}
