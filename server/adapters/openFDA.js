const axios = require('axios');
const http = require('http');
const https = require('https');
const config = require('../config');

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

/**
 * Search openFDA for drug label information.
 * No API key required (works with lower rate limits).
 * Uses strict relevance filtering to avoid false positives.
 *
 * @param {string} query - drug/medicine search term
 * @param {number} limit - max results
 * @returns {Array} raw product objects
 */
async function searchOpenFDA(query, limit = 10) {
  try {
    const cleanQuery = query.trim().toLowerCase().replace(/[^\w\s]/g, '');

    // Search broadly in drug labels
    let url = `${config.openFDA.baseUrl}?search="${encodeURIComponent(cleanQuery)}"&limit=${limit * 2}`;

    // Add API key if available
    if (config.openFDA.apiKey) {
      url += `&api_key=${config.openFDA.apiKey}`;
    }

    const { data } = await axios.get(url, { 
      httpAgent, 
      httpsAgent, 
      timeout: 12000 
    });

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Strict relevance filtering — must contain query in key fields
    const queryLower = cleanQuery.toLowerCase();
    const relevantResults = data.results.filter(drug => {
      const brandName = (drug.openfda?.brand_name || []).join(' ').toLowerCase();
      const genericName = (drug.openfda?.generic_name || []).join(' ').toLowerCase();
      const substance = (drug.openfda?.substance_name || []).join(' ').toLowerCase();
      const activeIngredient = (drug.active_ingredient || '').toLowerCase();

      return (
        brandName.includes(queryLower) ||
        genericName.includes(queryLower) ||
        substance.includes(queryLower) ||
        activeIngredient.includes(queryLower)
      );
    });

    return relevantResults.slice(0, limit).map(drug => {
      const brandNames = drug.openfda?.brand_name || [];
      const genericNames = drug.openfda?.generic_name || [];
      const manufacturer = drug.openfda?.manufacturer_name || [];
      const route = drug.openfda?.route || [];
      const dosageForm = drug.openfda?.dosage_form || [];

      return {
        title: brandNames[0] || genericNames[0] || cleanQuery,
        brand: manufacturer[0] || 'Unknown Manufacturer',
        price: null, // FDA doesn't provide retail prices
        currency: 'USD',
        image: '', // FDA doesn't provide images
        url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(brandNames[0] || cleanQuery)}`,
        category: 'Medicine / Pharmaceutical',
        availability: 'Prescription may be required',
        description: buildDrugDescription(drug),
        confidence: 80,
        additionalInfo: {
          genericName: genericNames[0] || '',
          brandName: brandNames[0] || '',
          manufacturer: manufacturer[0] || '',
          route: route.join(', ') || '',
          dosageForm: dosageForm.join(', ') || '',
          purpose: (drug.purpose || ['']).join('; ').substring(0, 300),
          warnings: (drug.warnings || ['']).join('; ').substring(0, 300),
          activeIngredients: drug.openfda?.substance_name?.join(', ') || '',
          splId: drug.openfda?.spl_id?.[0] || '',
        },
      };
    });
  } catch (err) {
    if (err.response?.status === 404) {
      // No results found — not an error
      return [];
    }
    console.error('❌ openFDA search failed:', err.message);
    return [];
  }
}

function buildDrugDescription(drug) {
  const parts = [];
  const genericNames = drug.openfda?.generic_name || [];
  const dosageForm = drug.openfda?.dosage_form || [];

  if (genericNames.length > 0) parts.push(`Generic: ${genericNames[0]}`);
  if (dosageForm.length > 0) parts.push(`Form: ${dosageForm.join(', ')}`);

  const purpose = drug.purpose || [];
  if (purpose.length > 0) {
    parts.push(`Purpose: ${purpose[0].substring(0, 150)}`);
  }

  const indications = drug.indications_and_usage || [];
  if (indications.length > 0) {
    parts.push(`Use: ${indications[0].substring(0, 200)}`);
  }

  return parts.join(' | ') || 'No description available';
}

module.exports = { searchOpenFDA };
