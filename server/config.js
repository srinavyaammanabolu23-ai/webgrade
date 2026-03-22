require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  ebay: {
    clientId: process.env.EBAY_CLIENT_ID || '',
    clientSecret: process.env.EBAY_CLIENT_SECRET || '',
    enabled: process.env.EBAY_ENABLED === 'true',
    // Use sandbox for SBX keys, production for PRD keys
    get apiBase() {
      return this.clientId.includes('SBX')
        ? 'https://api.sandbox.ebay.com'
        : 'https://api.ebay.com';
    },
    get authBase() {
      return this.clientId.includes('SBX')
        ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
        : 'https://api.ebay.com/identity/v1/oauth2/token';
    },
  },

  openFDA: {
    apiKey: process.env.OPENFDA_API_KEY || '',
    baseUrl: 'https://api.fda.gov/drug/label.json',
  },

  openFoodFacts: {
    baseUrl: 'https://world.openfoodfacts.org/cgi/search.pl',
  },

  upcItemDB: {
    baseUrl: 'https://api.upcitemdb.com/prod/trial/search',
  },

  serpapi: {
    apiKey: process.env.SERPAPI_KEY || '',
    enabled: !!(process.env.SERPAPI_KEY),
    baseUrl: 'https://serpapi.com/search.json',
  },

  currency: {
    apiKey: process.env.CURRENCY_API_KEY || '',
    // Free fallback that doesn't require a key
    freeApiUrl: 'https://open.er-api.com/v6/latest/USD',
  },
};

// Validate critical config
function validateConfig() {
  const warnings = [];

  if (config.ebay.enabled && (!config.ebay.clientId || !config.ebay.clientSecret)) {
    warnings.push('eBay is enabled but credentials are missing. Disabling eBay adapter.');
    config.ebay.enabled = false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Config warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  console.log('✅ Config loaded:');
  console.log(`   - eBay: ${config.ebay.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   - Google Shopping: ${config.serpapi.enabled ? 'ENABLED (SerpAPI)' : 'DISABLED'}`);
  console.log(`   - openFDA: ENABLED (no key required)`);
  console.log(`   - OpenFoodFacts: ENABLED (no key required)`);
  console.log(`   - Currency: ${config.currency.apiKey ? 'API Key' : 'Free fallback'}`);
}

validateConfig();

module.exports = config;
