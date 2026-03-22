const axios = require('axios');
const config = require('../config');
const cache = require('../services/cache');

let accessToken = null;
let tokenExpiry = 0;

/**
 * Get eBay OAuth2 access token (client credentials grant).
 */
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const credentials = Buffer.from(
      `${config.ebay.clientId}:${config.ebay.clientSecret}`
    ).toString('base64');

    const { data } = await axios.post(
      config.ebay.authBase,
      'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${credentials}`,
        },
        timeout: 10000,
      }
    );

    accessToken = data.access_token;
    // Expire 5 minutes early to be safe
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
    console.log('🔑 eBay access token obtained');
    return accessToken;
  } catch (err) {
    console.error('❌ eBay auth failed:', err.response?.data || err.message);
    throw new Error('eBay authentication failed');
  }
}

/**
 * Search eBay Browse API for products.
 * Prioritizes items available in India / with INR prices.
 *
 * @param {string} query - search term
 * @param {number} limit - max results
 * @returns {Array} raw product objects
 */
async function searchEbay(query, limit = 5) {
  if (!config.ebay.enabled) {
    console.log('⏭️  eBay adapter disabled');
    return [];
  }

  try {
    const token = await getAccessToken();

    const { data } = await axios.get(`${config.ebay.apiBase}/buy/browse/v1/item_summary/search`, {
      params: {
        q: query,
        limit,
        // Try to get items that ship to India
        filter: 'deliveryCountry:IN',
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country%3DIN',
      },
      timeout: 15000,
    });

    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      // Retry without India filter
      const retryData = await axios.get(`${config.ebay.apiBase}/buy/browse/v1/item_summary/search`, {
        params: { q: query, limit },
        headers: {
          Authorization: `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        timeout: 15000,
      });

      if (!retryData.data.itemSummaries) return [];
      return mapEbayResults(retryData.data.itemSummaries);
    }

    return mapEbayResults(data.itemSummaries);
  } catch (err) {
    console.error('❌ eBay search failed:', err.response?.data?.errors?.[0]?.message || err.message);
    return [];
  }
}

function mapEbayResults(items) {
  return items.map(item => ({
    title: item.title,
    price: item.price?.value || null,
    currency: item.price?.currency || 'USD',
    image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '',
    url: item.itemWebUrl || '',
    brand: item.brand || extractBrand(item.title),
    availability: item.itemLocation?.country === 'IN' ? 'Ships to India' : 'International',
    category: item.categories?.[0]?.categoryName || '',
    confidence: 75,
    additionalInfo: {
      condition: item.condition || '',
      seller: item.seller?.username || '',
      location: item.itemLocation?.country || '',
      shipping: item.shippingOptions?.[0]?.shippingCost?.value || 'N/A',
    },
  }));
}

function extractBrand(title) {
  if (!title) return 'Unknown Brand';
  // Try to extract first capitalized word as brand
  const match = title.match(/^([A-Z][a-zA-Z]+)/);
  return match ? match[1] : 'Unknown Brand';
}

module.exports = { searchEbay };
