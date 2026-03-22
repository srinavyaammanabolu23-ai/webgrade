const axios = require('axios');
const cache = require('./cache');
const config = require('../config');

// Fallback rate if all API calls fail
const FALLBACK_USD_TO_INR = 83.5;

/**
 * Get the current USD → INR exchange rate.
 * Priority: cached rate → free API → fallback constant
 */
async function getUSDtoINR() {
  // Check cache first
  const cached = cache.getRate('USD_INR');
  if (cached) return cached;

  try {
    // Use the free open exchange rate API (no key required)
    const { data } = await axios.get(config.currency.freeApiUrl, { timeout: 5000 });
    if (data && data.rates && data.rates.INR) {
      const rate = data.rates.INR;
      cache.setRate('USD_INR', rate);
      console.log(`💱 Exchange rate fetched: 1 USD = ₹${rate}`);
      return rate;
    }
  } catch (err) {
    console.warn('⚠️  Currency API failed, using fallback rate:', err.message);
  }

  // Fallback
  cache.setRate('USD_INR', FALLBACK_USD_TO_INR);
  return FALLBACK_USD_TO_INR;
}

/**
 * Convert a price to INR.
 * @param {number|null} price - original price
 * @param {string} currency - original currency code (e.g. 'USD', 'EUR', 'INR')
 * @returns {{ convertedPriceINR: number|null, exchangeRate: number|null }}
 */
async function convertToINR(price, currency = 'USD') {
  if (price === null || price === undefined || isNaN(price)) {
    return { convertedPriceINR: null, exchangeRate: null };
  }

  // Already INR
  if (currency === 'INR') {
    return { convertedPriceINR: price, exchangeRate: 1 };
  }

  // For USD (most common)
  if (currency === 'USD') {
    const rate = await getUSDtoINR();
    return {
      convertedPriceINR: Math.round(price * rate * 100) / 100,
      exchangeRate: rate,
    };
  }

  // For other currencies, convert via USD as intermediary
  // using the free API that has all rates
  try {
    const cachedAll = cache.getRate(`ALL_RATES`);
    let rates = cachedAll;

    if (!rates) {
      const { data } = await axios.get(config.currency.freeApiUrl, { timeout: 5000 });
      if (data && data.rates) {
        rates = data.rates;
        cache.setRate('ALL_RATES', rates);
      }
    }

    if (rates && rates[currency] && rates.INR) {
      // Convert: price in CURRENCY → USD → INR
      const priceInUSD = price / rates[currency];
      const priceInINR = priceInUSD * rates.INR;
      return {
        convertedPriceINR: Math.round(priceInINR * 100) / 100,
        exchangeRate: rates.INR / rates[currency],
      };
    }
  } catch (err) {
    console.warn(`⚠️  Currency conversion failed for ${currency}:`, err.message);
  }

  return { convertedPriceINR: null, exchangeRate: null };
}

module.exports = { convertToINR, getUSDtoINR };
