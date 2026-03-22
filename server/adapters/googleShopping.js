const axios = require('axios');
const config = require('../config');

/**
 * Known Indian retailer domains → friendly source names and config.
 */
const INDIAN_RETAILERS = {
  'flipkart.com': { name: 'Flipkart', icon: '🛒' },
  'amazon.in': { name: 'Amazon India', icon: '📦' },
  'amazon.com': { name: 'Amazon', icon: '📦' },
  'bigbasket.com': { name: 'BigBasket', icon: '🥬' },
  'blinkit.com': { name: 'Blinkit', icon: '⚡' },
  'swiggy.com': { name: 'Swiggy Instamart', icon: '🏪' },
  'zepto.co.in': { name: 'Zepto', icon: '🚀' },
  'jiomart.com': { name: 'JioMart', icon: '🏬' },
  'myntra.com': { name: 'Myntra', icon: '👗' },
  'nykaa.com': { name: 'Nykaa', icon: '💄' },
  'meesho.com': { name: 'Meesho', icon: '🛍️' },
  'snapdeal.com': { name: 'Snapdeal', icon: '🎯' },
  'tatacliq.com': { name: 'Tata CLiQ', icon: '🔷' },
  'croma.com': { name: 'Croma', icon: '📱' },
  'reliancedigital.in': { name: 'Reliance Digital', icon: '🔌' },
  'pharmeasy.in': { name: 'PharmEasy', icon: '💊' },
  'netmeds.com': { name: 'Netmeds', icon: '💊' },
  '1mg.com': { name: '1mg', icon: '💊' },
  'apollopharmacy.in': { name: 'Apollo Pharmacy', icon: '💊' },
};

/**
 * Extract retailer name from a URL.
 */
function identifyRetailer(url) {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    for (const [domain, info] of Object.entries(INDIAN_RETAILERS)) {
      if (hostname.includes(domain)) return info;
    }
  } catch {
    // Invalid URL
  }
  return null;
}

/**
 * Search Google Shopping India via SerpAPI.
 * Returns results from Flipkart, Amazon, BigBasket, Zepto, etc.
 *
 * @param {string} query - search term
 * @param {number} limit - max results
 * @returns {Array} raw product objects
 */
async function searchGoogleShopping(query, limit = 10) {
  if (!config.serpapi.enabled) {
    console.log('⏭️  Google Shopping adapter disabled (no SerpAPI key)');
    return [];
  }

  try {
    const { data } = await axios.get(config.serpapi.baseUrl, {
      params: {
        engine: 'google_shopping',
        q: query,
        location: 'India',
        gl: 'in',           // Google country: India
        hl: 'en',           // Language: English
        google_domain: 'google.co.in',
        num: limit,
        api_key: config.serpapi.apiKey,
      },
      timeout: 15000,
    });

    const results = [];

    // Process shopping results
    if (data.shopping_results && data.shopping_results.length > 0) {
      for (const item of data.shopping_results.slice(0, limit)) {
        const retailer = identifyRetailer(item.link);

        // Extract price — SerpAPI returns it as string like "₹299" or "₹1,299.00"
        let price = null;
        let currency = 'INR';

        if (item.extracted_price !== undefined && item.extracted_price !== null) {
          price = parseFloat(item.extracted_price);
          if (isNaN(price)) price = null;
        } else if (item.price) {
          // Parse price string like "₹1,299.00"
          const priceStr = item.price.replace(/[₹,\s]/g, '');
          price = parseFloat(priceStr);
          if (isNaN(price)) price = null;

          // Detect currency from symbol
          if (item.price.includes('$')) currency = 'USD';
          else if (item.price.includes('€')) currency = 'EUR';
          else if (item.price.includes('£')) currency = 'GBP';
          else currency = 'INR'; // Default for Indian results
        }

        results.push({
          title: item.title || 'Unknown Product',
          brand: item.source || retailer?.name || 'Unknown Seller',
          price,
          currency,
          image: item.thumbnail || '',
          url: item.link || item.product_link || '',
          category: item.snippet || '',
          availability: item.delivery ? `Delivery: ${item.delivery}` : 'Check availability',
          description: item.snippet || '',
          confidence: price !== null ? 85 : 55,
          additionalInfo: {
            seller: item.source || '',
            retailer: retailer?.name || item.source || 'Google Shopping',
            retailerIcon: retailer?.icon || '🛒',
            rating: item.rating || null,
            reviews: item.reviews || null,
            oldPrice: item.old_price || null,
            delivery: item.delivery || '',
            badge: item.badge || '',
          },
        });
      }
    }

    // Also check inline shopping results (sometimes Google uses these)
    if (data.inline_shopping_results && data.inline_shopping_results.length > 0) {
      for (const item of data.inline_shopping_results.slice(0, 5)) {
        const retailer = identifyRetailer(item.link);
        let price = null;

        if (item.extracted_price !== undefined) {
          price = parseFloat(item.extracted_price);
          if (isNaN(price)) price = null;
        } else if (item.price) {
          const priceStr = item.price.replace(/[₹,\s]/g, '');
          price = parseFloat(priceStr);
          if (isNaN(price)) price = null;
        }

        // Avoid duplicates
        const isDuplicate = results.some(r =>
          r.productTitle === item.title ||
          r.url === item.link
        );

        if (!isDuplicate) {
          results.push({
            title: item.title || 'Unknown Product',
            brand: item.source || retailer?.name || 'Unknown Seller',
            price,
            currency: 'INR',
            image: item.thumbnail || '',
            url: item.link || '',
            category: '',
            availability: 'Check availability',
            description: '',
            confidence: price !== null ? 80 : 50,
            additionalInfo: {
              seller: item.source || '',
              retailer: retailer?.name || item.source || 'Google Shopping',
              retailerIcon: retailer?.icon || '🛒',
              rating: item.rating || null,
              reviews: item.reviews || null,
            },
          });
        }
      }
    }

    console.log(`🛍️  Google Shopping: ${results.length} results for "${query}"`);
    return results.slice(0, limit);
  } catch (err) {
    if (err.response?.status === 401) {
      console.error('❌ SerpAPI authentication failed — check your API key');
    } else if (err.response?.status === 429) {
      console.warn('⚠️  SerpAPI rate limit reached');
    } else {
      console.error('❌ Google Shopping search failed:', err.message);
    }
    return [];
  }
}

module.exports = { searchGoogleShopping, identifyRetailer, INDIAN_RETAILERS };
