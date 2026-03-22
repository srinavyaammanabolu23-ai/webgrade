import axios from 'axios';

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || '')
  : '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

/**
 * Search for products.
 * @param {string} query - search term
 * @returns {Promise<object>} search response
 */
export async function searchProducts(query) {
  try {
    const { data } = await api.get('/api/search', {
      params: { q: query },
    });
    return data;
  } catch (err) {
    if (err.response) {
      return {
        success: false,
        error: err.response.data?.error || 'Server error occurred',
      };
    }
    if (err.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timed out. The servers might be busy — please try again.',
      };
    }
    return {
      success: false,
      error: 'Unable to connect to the server. Please check your connection.',
    };
  }
}

/**
 * Get source adapter status.
 */
export async function getSourceStatus() {
  try {
    const { data } = await api.get('/api/sources');
    return data;
  } catch {
    return { success: false, sources: {} };
  }
}
