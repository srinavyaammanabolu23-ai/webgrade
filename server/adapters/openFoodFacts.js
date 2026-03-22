const axios = require('axios');
const http = require('http');
const https = require('https');
const config = require('../config');

// Force IPv4 to avoid DNS resolution issues on some machines
const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

/**
 * Search OpenFoodFacts for food/grocery products.
 * No authentication required.
 *
 * @param {string} query - search term
 * @param {number} limit - max results
 * @returns {Array} raw product objects
 */
async function searchOpenFoodFacts(query, limit = 10) {
  try {
    const { data } = await axios.get(config.openFoodFacts.baseUrl, {
      params: {
        search_terms: query,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: limit,
        // Prioritize Indian products
        tagtype_0: 'countries',
        tag_contains_0: 'contains',
        tag_0: 'india',
      },
      headers: {
        'User-Agent': 'WebGrade/1.0 (product-comparison-tool; contact@webgrade.app)',
      },
      httpAgent,
      httpsAgent,
      timeout: 12000,
    });

    let products = data.products || [];

    // If no India-specific results, retry without country filter
    if (products.length === 0) {
      const retryResponse = await axios.get(config.openFoodFacts.baseUrl, {
        params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: limit,
        },
        headers: {
          'User-Agent': 'WebGrade/1.0 (product-comparison-tool; contact@webgrade.app)',
        },
        httpAgent,
        httpsAgent,
        timeout: 12000,
      });
      products = retryResponse.data.products || [];
    }

    return products
      .filter(p => p.product_name && p.product_name.trim().length > 0)
      .map(p => ({
        title: p.product_name || 'Unknown Product',
        brand: p.brands || 'Unknown Brand',
        price: null, // OpenFoodFacts doesn't provide prices
        currency: 'USD',
        image: p.image_front_url || p.image_url || p.image_front_small_url || '',
        url: p.url || `https://world.openfoodfacts.org/product/${p.code}`,
        category: p.categories?.split(',')[0]?.trim() || '',
        availability: p.countries_tags?.includes('en:india') ? 'Available in India' : 'International',
        description: p.generic_name || p.ingredients_text?.substring(0, 200) || '',
        confidence: 70,
        additionalInfo: {
          nutritionGrade: p.nutrition_grades || 'N/A',
          novaGroup: p.nova_group || 'N/A',
          ecoscore: p.ecoscore_grade || 'N/A',
          barcode: p.code || '',
          quantity: p.quantity || '',
          allergens: p.allergens || '',
          labels: p.labels || '',
        },
      }));
  } catch (err) {
    console.error('❌ OpenFoodFacts search failed:', err.message);
    return [];
  }
}

module.exports = { searchOpenFoodFacts };
