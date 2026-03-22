const axios = require('axios');
const config = require('../config');

/**
 * Search UPCItemDB for product pricing data.
 * Free trial API — no authentication required.
 * Rate limited to 100 requests/day.
 *
 * @param {string} query - search term
 * @param {number} limit - max results
 * @returns {Array} raw product objects
 */
async function searchUPCItemDB(query, limit = 5) {
  try {
    const { data } = await axios.get(config.upcItemDB.baseUrl, {
      params: {
        s: query,
        match: 'contains',
        type: 'product',
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'WebGrade/1.0',
      },
      timeout: 10000,
    });

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.slice(0, limit).map(item => {
      // Find lowest offer price
      let price = null;
      let currency = 'USD';

      if (item.offers && item.offers.length > 0) {
        const pricesAvailable = item.offers
          .map(o => parseFloat(o.price))
          .filter(p => !isNaN(p) && p > 0);

        if (pricesAvailable.length > 0) {
          price = Math.min(...pricesAvailable);
          currency = item.offers[0].currency || 'USD';
        }
      }

      // Check for highest_recorded_price / lowest_recorded_price
      if (price === null && item.highest_recorded_price) {
        price = parseFloat(item.highest_recorded_price);
        if (isNaN(price)) price = null;
      }

      return {
        title: item.title || 'Unknown Product',
        brand: item.brand || 'Unknown Brand',
        price,
        currency,
        image: (item.images && item.images.length > 0) ? item.images[0] : '',
        url: (item.offers && item.offers.length > 0) ? item.offers[0].link : '',
        category: item.category || '',
        availability: (item.offers && item.offers.length > 0) ? 'Available' : 'Check availability',
        description: item.description || '',
        confidence: price !== null ? 75 : 50,
        additionalInfo: {
          upc: item.upc || item.ean || '',
          numOffers: item.offers?.length || 0,
          lowestPrice: item.lowest_recorded_price || null,
          highestPrice: item.highest_recorded_price || null,
        },
      };
    });
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn('⚠️  UPCItemDB rate limit reached (100/day)');
    } else {
      console.error('❌ UPCItemDB search failed:', err.message);
    }
    return [];
  }
}

module.exports = { searchUPCItemDB };
