import RatingStars from './RatingStars';
import SourceBadge from './SourceBadge';
import './ProductCard.css';

export default function ProductCard({ product, onClick, index = 0 }) {
  const {
    productTitle,
    brand,
    priceDisplay,
    convertedPriceINR,
    image,
    sourceName,
    ratingStars,
    availability,
    needsVerification,
    category,
  } = product;

  return (
    <div
      className="product-card fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onClick(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(product)}
    >
      {/* Image */}
      <div className="card-image-wrapper">
        {image ? (
          <img
            src={image}
            alt={productTitle}
            className="card-image"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="card-image-placeholder" style={{ display: image ? 'none' : 'flex' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <SourceBadge source={sourceName} />
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title" title={productTitle}>
          {productTitle}
        </h3>

        {brand && brand !== 'Unknown Brand' && (
          <p className="card-brand">{brand}</p>
        )}

        {category && (
          <span className="card-category">{category}</span>
        )}

        <div className="card-footer">
          <div className="card-price-block">
            <span className={`card-price ${convertedPriceINR === null ? 'card-price--na' : ''}`}>
              {priceDisplay}
            </span>
          </div>
          <RatingStars stars={ratingStars} size="sm" />
        </div>

        {needsVerification && (
          <span className="card-verification">⚠ Needs verification</span>
        )}

        {availability && availability !== 'Unknown' && (
          <span className="card-availability">{availability}</span>
        )}
      </div>
    </div>
  );
}
