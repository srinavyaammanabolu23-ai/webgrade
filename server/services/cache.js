const NodeCache = require('node-cache');

// Search results cache: 5 minute TTL
const searchCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Exchange rate cache: 1 hour TTL
const rateCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

const cache = {
  // Search results
  getSearch(key) {
    return searchCache.get(key);
  },
  setSearch(key, value) {
    searchCache.set(key, value);
  },

  // Exchange rates
  getRate(key) {
    return rateCache.get(key);
  },
  setRate(key, value) {
    rateCache.set(key, value);
  },

  // Stats
  getStats() {
    return {
      search: searchCache.getStats(),
      rate: rateCache.getStats(),
    };
  },

  // Flush
  flushAll() {
    searchCache.flushAll();
    rateCache.flushAll();
  },
};

module.exports = cache;
