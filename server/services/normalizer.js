const { convertToINR } = require('./currencyService');

/**
 * Normalize a raw product object from any adapter into the unified schema.
 *
 * @param {object} raw - raw product data from adapter
 * @param {string} sourceName - 'eBay', 'OpenFoodFacts', 'openFDA', 'UPCItemDB'
 * @returns {object} normalized product
 */
async function normalizeProduct(raw, sourceName) {
  const originalPrice = parseFloat(raw.price) || null;
  const originalCurrency = (raw.currency || 'USD').toUpperCase();

  let convertedPriceINR = null;
  let exchangeRate = null;

  if (originalPrice !== null) {
    const conversion = await convertToINR(originalPrice, originalCurrency);
    convertedPriceINR = conversion.convertedPriceINR;
    exchangeRate = conversion.exchangeRate;
  }

  return {
    sourceName,
    productTitle: raw.title || raw.productTitle || 'Unknown Product',
    brand: raw.brand || 'Unknown Brand',
    category: raw.category || '',
    originalPrice,
    originalCurrency,
    convertedPriceINR,
    displayCurrency: 'INR',
    priceDisplay: convertedPriceINR !== null
      ? `₹${convertedPriceINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Price not available',
    availability: raw.availability || 'Unknown',
    url: raw.url || raw.link || '',
    image: raw.image || raw.imageUrl || '',
    description: raw.description || '',
    lastUpdated: new Date().toISOString(),
    confidence: raw.confidence || 0,
    ratingStars: 0,       // Will be set by rating service
    ratingTier: '',       // Will be set by rating service
    exchangeRate,
    additionalInfo: raw.additionalInfo || {},
  };
}

/**
 * Normalize an array of raw products.
 */
async function normalizeProducts(rawProducts, sourceName) {
  const results = [];
  for (const raw of rawProducts) {
    try {
      const normalized = await normalizeProduct(raw, sourceName);
      results.push(normalized);
    } catch (err) {
      console.warn(`⚠️  Failed to normalize product from ${sourceName}:`, err.message);
    }
  }
  return results;
}

module.exports = { normalizeProduct, normalizeProducts };
