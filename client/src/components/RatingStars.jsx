import './RatingStars.css';

const TIER_CLASSES = {
  Platinum: 'tier-platinum',
  Gold: 'tier-gold',
  Silver: 'tier-silver',
  Bronze: 'tier-bronze',
};

export default function RatingStars({ stars = 0, tier = '', showTier = false, size = 'md' }) {
  const filledStars = Math.min(Math.max(Math.round(stars), 0), 5);

  return (
    <div className={`rating-stars rating-stars--${size}`}>
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className={`star ${i <= filledStars ? 'star--filled' : 'star--empty'}`}
          >
            ★
          </span>
        ))}
      </div>
      {showTier && tier && (
        <span className={`tier-badge ${TIER_CLASSES[tier] || ''}`}>
          {tier}
        </span>
      )}
    </div>
  );
}
