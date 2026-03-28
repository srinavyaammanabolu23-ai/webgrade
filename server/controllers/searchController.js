const { resolveIntent } = require('../services/intentResolver');
const { normalizeProducts } = require('../services/normalizer');
const { rateProducts } = require('../services/ratingService');
const cache = require('../services/cache');
const config = require('../config');

// Adapters
const { searchEbay } = require('../adapters/ebay');
const { searchOpenFoodFacts } = require('../adapters/openFoodFacts');
const { searchOpenFDA } = require('../adapters/openFDA');
const { searchUPCItemDB } = require('../adapters/upcItemDB');
const { searchGoogleShopping } = require('../adapters/googleShopping');

/**
 * Main search handler.
 * 1. Resolve intent → confidence + domain
 * 2. If vague → return suggestions only
 * 3. If specific → fan out to adapters → normalize → rate → respond
 */
async function handleSearch(req, res) {
  try {
    const query = (req.query.q || '').trim();

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    // Check cache
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = cache.getSearch(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for "${query}"`);
      return res.json({ ...cached, fromCache: true });
    }

    // Resolve intent (support ?force=true to bypass vague filter)
    const forceSearch = req.query.force === 'true';
    const intent = resolveIntent(query, { forceSearch });
    console.log(`🔍 Query: "${query}" → domain: ${intent.domain}, confidence: ${intent.confidence}%, vague: ${intent.isVague}${forceSearch ? ' [FORCED]' : ''}`);

    // If vague → suggestions mode
    if (intent.isVague) {
      const response = {
        success: true,
        mode: 'suggestions',
        query,
        intent,
        suggestions: intent.suggestions,
        products: [],
        message: 'Your search is too broad. Please try a more specific query.',
      };
      return res.json(response);
    }

    // Fan out to relevant adapters based on domain
    const adapterPromises = [];
    const adapterNames = [];

    // 🇮🇳 Google Shopping India — ALWAYS first priority (Flipkart, Amazon, BigBasket, etc.)
    if (config.serpapi.enabled) {
      adapterPromises.push(
        searchGoogleShopping(query, 8).catch(err => {
          console.warn('Google Shopping adapter error:', err.message);
          return [];
        })
      );
      adapterNames.push('Google Shopping');
    }

    // eBay (broad international catalog)
    if (config.ebay.enabled) {
      adapterPromises.push(
        searchEbay(query, 5).catch(err => {
          console.warn('eBay adapter error:', err.message);
          return [];
        })
      );
      adapterNames.push('eBay');
    }

    // Domain-specific adapters
    if (intent.domain === 'medicine') {
      adapterPromises.push(
        searchOpenFDA(query, 5).catch(err => {
          console.warn('openFDA adapter error:', err.message);
          return [];
        })
      );
      adapterNames.push('openFDA');
    }

    if (intent.domain === 'food') {
      adapterPromises.push(
        searchOpenFoodFacts(query, 5).catch(err => {
          console.warn('OpenFoodFacts adapter error:', err.message);
          return [];
        })
      );
      adapterNames.push('OpenFoodFacts');
    }

    // UPCItemDB for pricing fallback
    adapterPromises.push(
      searchUPCItemDB(query, 5).catch(err => {
        console.warn('UPCItemDB adapter error:', err.message);
        return [];
      })
    );
    adapterNames.push('UPCItemDB');

    // For general queries, try all remaining sources too
    if (intent.domain === 'general') {
      adapterPromises.push(
        searchOpenFDA(query, 3).catch(() => []),
        searchOpenFoodFacts(query, 3).catch(() => [])
      );
      adapterNames.push('openFDA', 'OpenFoodFacts');
    }

    // Parallel fetch
    const startTime = Date.now();
    const rawResults = await Promise.all(adapterPromises);
    const fetchTime = Date.now() - startTime;
    console.log(`⏱️  Adapters responded in ${fetchTime}ms`);

    // Normalize all results — for Google Shopping, use retailer name as source
    let allProducts = [];
    for (let i = 0; i < rawResults.length; i++) {
      if (rawResults[i].length > 0) {
        // For Google Shopping results, use the retailer name as source
        if (adapterNames[i] === 'Google Shopping') {
          for (const item of rawResults[i]) {
            const sourceName = item.additionalInfo?.retailer || 'Google Shopping';
            const normalized = await normalizeProducts([item], sourceName);
            allProducts.push(...normalized);
          }
        } else {
          const normalized = await normalizeProducts(rawResults[i], adapterNames[i]);
          allProducts.push(...normalized);
        }
      }
    }

    // Rate all products
    allProducts = rateProducts(allProducts);

    // Sort: price available first, then by rating, then by confidence
    allProducts.sort((a, b) => {
      // Products with prices first
      if (a.convertedPriceINR !== null && b.convertedPriceINR === null) return -1;
      if (a.convertedPriceINR === null && b.convertedPriceINR !== null) return 1;
      // Then by rating
      if (b.ratingStars !== a.ratingStars) return b.ratingStars - a.ratingStars;
      // Then by confidence
      return (b.confidence || 0) - (a.confidence || 0);
    });

    // Deduplicate by title similarity
    allProducts = deduplicateProducts(allProducts);

    const response = {
      success: true,
      mode: 'results',
      query,
      intent,
      totalResults: allProducts.length,
      products: allProducts,
      sources: adapterNames,
      fetchTimeMs: fetchTime,
      message: allProducts.length === 0
        ? 'No verified results found. Try a more specific search.'
        : `Found ${allProducts.length} verified result(s) from ${adapterNames.length} source(s).`,
    };

    // Cache the response
    cache.setSearch(cacheKey, response);

    return res.json(response);
  } catch (err) {
    console.error('❌ Search handler error:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while searching. Please try again.',
    });
  }
}

/**
 * Deduplicate products based on title similarity.
 */
function deduplicateProducts(products) {
  const seen = new Map();
  const unique = [];

  for (const p of products) {
    const key = p.productTitle.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(p);
    }
  }

  return unique;
}

/**
 * Get source adapter status.
 */
function handleSourceStatus(req, res) {
  res.json({
    success: true,
    sources: {
      'Google Shopping India': {
        enabled: config.serpapi.enabled,
        status: config.serpapi.enabled ? 'active' : 'disabled',
        note: config.serpapi.enabled
          ? 'SerpAPI — Flipkart, Amazon, BigBasket, Zepto, Blinkit & more'
          : 'No SerpAPI key configured',
        covers: ['Flipkart', 'Amazon India', 'BigBasket', 'Zepto', 'Blinkit', 'Swiggy Instamart', 'JioMart'],
      },
      eBay: {
        enabled: config.ebay.enabled,
        status: config.ebay.enabled ? 'active' : 'disabled',
        note: config.ebay.enabled
          ? (config.ebay.clientId.includes('SBX') ? 'Sandbox mode' : 'Production mode')
          : 'No credentials configured',
      },
      openFDA: {
        enabled: true,
        status: 'active',
        note: config.openFDA.apiKey ? 'API key configured' : 'Using free tier (lower rate limits)',
      },
      OpenFoodFacts: {
        enabled: true,
        status: 'active',
        note: 'No authentication required',
      },
      UPCItemDB: {
        enabled: true,
        status: 'active',
        note: 'Free trial (100 requests/day)',
      },
    },
    cache: cache.getStats(),
  });
}

module.exports = { handleSearch, handleSourceStatus };
