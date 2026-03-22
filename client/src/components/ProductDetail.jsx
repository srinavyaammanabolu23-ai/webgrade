import RatingStars from './RatingStars';
import SourceBadge from './SourceBadge';
import './ProductDetail.css';

export default function ProductDetail({ product, onClose }) {
  if (!product) return null;

  const {
    productTitle,
    brand,
    priceDisplay,
    convertedPriceINR,
    originalPrice,
    originalCurrency,
    image,
    sourceName,
    ratingStars,
    ratingTier,
    availability,
    description,
    url,
    lastUpdated,
    category,
    needsVerification,
    confidence,
    exchangeRate,
    additionalInfo = {},
  } = product;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-modal fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="detail-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {/* Header */}
        <div className="detail-header">
          {image ? (
            <img src={image} alt={productTitle} className="detail-image" />
          ) : (
            <div className="detail-image-placeholder">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}

          <div className="detail-header-info">
            <div className="detail-badges">
              <SourceBadge source={sourceName} />
              {category && <span className="detail-category">{category}</span>}
            </div>
            <h2 className="detail-title">{productTitle}</h2>
            {brand && brand !== 'Unknown Brand' && (
              <p className="detail-brand">by {brand}</p>
            )}
            <RatingStars stars={ratingStars} tier={ratingTier} showTier size="lg" />
          </div>
        </div>

        {/* Price Section */}
        <div className="detail-price-section">
          <div className="detail-price-main">
            <span className="detail-price-label">Price</span>
            <span className={`detail-price ${convertedPriceINR === null ? 'detail-price--na' : ''}`}>
              {priceDisplay}
            </span>
          </div>
          {convertedPriceINR !== null && exchangeRate && originalCurrency !== 'INR' && (
            <p className="detail-exchange-note">
              Converted from {originalCurrency} {originalPrice?.toFixed(2)} (rate: {exchangeRate.toFixed(2)})
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div className="detail-info-grid">
          {availability && availability !== 'Unknown' && (
            <div className="detail-info-item">
              <span className="detail-info-label">Availability</span>
              <span className="detail-info-value">{availability}</span>
            </div>
          )}
          <div className="detail-info-item">
            <span className="detail-info-label">Confidence</span>
            <span className="detail-info-value">{confidence}%</span>
          </div>
          <div className="detail-info-item">
            <span className="detail-info-label">Data Source</span>
            <span className="detail-info-value">{sourceName}</span>
          </div>
          {lastUpdated && (
            <div className="detail-info-item">
              <span className="detail-info-label">Last Updated</span>
              <span className="detail-info-value">
                {new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="detail-description">
            <h4>Description</h4>
            <p>{description}</p>
          </div>
        )}

        {/* Additional Info */}
        {Object.keys(additionalInfo).length > 0 && (
          <div className="detail-additional">
            <h4>Additional Information</h4>
            <div className="detail-additional-grid">
              {Object.entries(additionalInfo).map(([key, value]) => {
                if (!value || value === 'N/A' || value === '') return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                return (
                  <div key={key} className="detail-additional-item">
                    <span className="detail-info-label">{label}</span>
                    <span className="detail-info-value">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verification Warning */}
        {needsVerification && (
          <div className="detail-warning">
            ⚠ This product data has low confidence and needs independent verification before making purchasing decisions.
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
              View on {sourceName} →
            </a>
          )}
          <button className="detail-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
