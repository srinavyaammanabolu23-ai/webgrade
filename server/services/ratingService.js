/**
 * Rating Service — assigns star ratings and tier names.
 *
 * Rating matrix:
 *   5 ⭐ Platinum — confidence ≥ 90%, price available, has image + brand
 *   4 ⭐ Gold     — confidence ≥ 75%, price available
 *   3 ⭐ Silver   — confidence ≥ 60%, partial data
 *   2 ⭐ Bronze   — below thresholds or missing critical data
 */

const TIERS = {
  5: 'Platinum',
  4: 'Gold',
  3: 'Silver',
  2: 'Bronze',
};

/**
 * Rate a single normalized product.
 * @param {object} product - normalized product
 * @returns {object} product with ratingStars and ratingTier set
 */
function rateProduct(product) {
  let score = 0;

  // Confidence contributes up to 40 points
  score += Math.min(Math.round((product.confidence || 0) * 0.4), 40);

  // Price availability: 20 points
  if (product.convertedPriceINR !== null) score += 20;

  // Image availability: 10 points
  if (product.image && product.image.length > 0) score += 10;

  // Brand known: 10 points
  if (product.brand && product.brand !== 'Unknown Brand') score += 10;

  // Product title quality: 10 points
  if (product.productTitle && product.productTitle.length > 10) score += 10;

  // URL available: 5 points
  if (product.url && product.url.length > 0) score += 5;

  // Description available: 5 points
  if (product.description && product.description.length > 20) score += 5;

  // Map score to stars
  let stars;
  if (score >= 85) stars = 5;
  else if (score >= 65) stars = 4;
  else if (score >= 45) stars = 3;
  else stars = 2;

  product.ratingStars = stars;
  product.ratingTier = TIERS[stars];
  product.ratingScore = score;
  product.needsVerification = score < 45;

  return product;
}

/**
 * Rate an array of normalized products.
 */
function rateProducts(products) {
  return products.map(rateProduct);
}

module.exports = { rateProduct, rateProducts, TIERS };
