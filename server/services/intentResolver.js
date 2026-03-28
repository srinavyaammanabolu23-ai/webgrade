/**
 * Intent Resolver — classifies search queries and assigns confidence scores.
 *
 * High confidence (≥55%) → fetch live data from adapters
 * Low confidence (<55%)  → return suggestions only
 */

// Medicine / pharma keywords
const MEDICINE_TERMS = new Set([
  'mg', 'ml', 'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment',
  'drops', 'suspension', 'gel', 'lotion', 'spray', 'inhaler', 'patch',
  'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin', 'metformin',
  'omeprazole', 'cetirizine', 'azithromycin', 'pantoprazole', 'dolo',
  'crocin', 'combiflam', 'allegra', 'montek', 'augmentin', 'ciprofloxacin',
  'diclofenac', 'ranitidine', 'losartan', 'atorvastatin', 'amlodipine',
  'drug', 'medicine', 'pharmaceutical', 'prescription', 'otc',
  'vitamin', 'supplement', 'antibiotic', 'antacid', 'painkiller',
]);

// Food / grocery keywords
const FOOD_TERMS = new Set([
  'chocolate', 'biscuit', 'cookie', 'chips', 'snack', 'cereal', 'juice',
  'milk', 'bread', 'cheese', 'butter', 'yogurt', 'noodles', 'pasta',
  'rice', 'flour', 'sugar', 'salt', 'oil', 'sauce', 'ketchup', 'jam',
  'coffee', 'tea', 'water', 'soda', 'drink', 'beverage', 'candy',
  'oreo', 'nutella', 'maggi', 'lays', 'kurkure', 'parle', 'britannia',
  'amul', 'nestle', 'cadbury', 'kitkat', 'dairy', 'organic', 'food',
  'grocery', 'snacks', 'munchies', 'pack', 'grams', 'kg', 'liter',
]);

// Electronics / technology keywords
const ELECTRONICS_TERMS = new Set([
  'phone', 'mobile', 'smartphone', 'laptop', 'tablet', 'computer', 'pc',
  'headphones', 'earbuds', 'earphones', 'speaker', 'monitor', 'keyboard',
  'mouse', 'charger', 'cable', 'adapter', 'powerbank', 'camera', 'tv',
  'television', 'smartwatch', 'watch', 'fitness', 'tracker', 'drone',
  'printer', 'router', 'wifi', 'bluetooth', 'usb', 'hdmi', 'ssd', 'hdd',
  'ram', 'processor', 'gpu', 'console', 'gaming', 'controller',
  'pro', 'max', 'ultra', 'plus', 'mini', 'lite', 'se', 'air',
  'gb', 'tb', '5g', '4g', 'oled', 'amoled', 'lcd', 'led',
]);

// Known brands — if a query contains any of these, it's likely specific enough
const KNOWN_BRANDS = new Set([
  // Electronics
  'apple', 'iphone', 'ipad', 'macbook', 'airpods', 'imac',
  'samsung', 'galaxy', 'oneplus', 'xiaomi', 'redmi', 'poco', 'realme',
  'oppo', 'vivo', 'motorola', 'moto', 'nokia', 'nothing', 'pixel', 'google',
  'sony', 'lg', 'hp', 'dell', 'lenovo', 'asus', 'acer', 'msi',
  'jbl', 'bose', 'sennheiser', 'boat', 'noise', 'fire-boltt', 'amazfit',
  'playstation', 'xbox', 'nintendo', 'gopro', 'canon', 'nikon', 'fujifilm',
  'dyson', 'philips', 'panasonic', 'whirlpool', 'haier', 'bosch',
  // Food brands
  'nestle', 'cadbury', 'britannia', 'parle', 'amul', 'haldiram',
  'pepsi', 'coca-cola', 'coke', 'sprite', 'fanta', 'tropicana',
  'maggi', 'knorr', 'heinz', 'kelloggs',
  // Fashion
  'nike', 'adidas', 'puma', 'reebok', 'levis', 'zara',
  // Delivery/Pharmacy Platforms
  'swiggy', 'instamart', 'blinkit', 'zepto', 'dunzo', 'bigbasket', 'bbnow',
  'apollo', 'pharmeasy', 'netmeds', '1mg', 'flipkart', 'amazon',
]);

/**
 * Resolve the intent of a search query.
 * @param {string} query - user's search query
 * @param {object} options - optional flags
 * @param {boolean} options.forceSearch - bypass vague filter (for "Try:" chips)
 * @returns {{ domain: string, confidence: number, suggestions: string[], isVague: boolean }}
 */
function resolveIntent(query, options = {}) {
  if (!query || typeof query !== 'string') {
    return { domain: 'unknown', confidence: 0, suggestions: [], isVague: true };
  }

  const cleaned = query.trim().toLowerCase();
  const words = cleaned.split(/\s+/);

  let medicineScore = 0;
  let foodScore = 0;
  let electronicsScore = 0;
  let brandBonus = 0;

  // Score each word
  for (const word of words) {
    if (MEDICINE_TERMS.has(word)) medicineScore += 25;
    if (FOOD_TERMS.has(word)) foodScore += 25;
    if (ELECTRONICS_TERMS.has(word)) electronicsScore += 25;
    if (KNOWN_BRANDS.has(word)) brandBonus += 30;
  }

  // Check for dosage patterns (e.g. "500mg", "200ml") → strong medicine signal
  if (/\d+\s*(mg|ml|mcg|iu)/i.test(cleaned)) {
    medicineScore += 40;
  }

  // Check for weight patterns (e.g. "500g", "1kg") → food signal
  if (/\d+\s*(g|kg|gm|liter|l|oz)\b/i.test(cleaned)) {
    foodScore += 30;
  }

  // Check for storage/model patterns (e.g. "128gb", "256gb") → electronics signal
  if (/\d+\s*(gb|tb)\b/i.test(cleaned)) {
    electronicsScore += 30;
  }

  // Check for model numbers (e.g. "15", "s24", "14 pro")
  if (/\d+/.test(cleaned) && brandBonus > 0) {
    electronicsScore += 20;
  }

  // Multi-word queries are more specific
  const specificityBonus = Math.min(words.length * 12, 36);

  // Determine domain & confidence
  const scores = {
    medicine: medicineScore,
    food: foodScore,
    electronics: electronicsScore,
  };

  const topDomain = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  let domain = 'general';
  let baseConfidence = 30;

  if (topDomain[1] > 0) {
    domain = topDomain[0];
    baseConfidence = Math.min(topDomain[1] + specificityBonus + brandBonus, 95);
  } else if (brandBonus > 0) {
    domain = 'general';
    baseConfidence = Math.min(brandBonus + specificityBonus, 95);
  } else if (words.length >= 2) {
    domain = 'general';
    baseConfidence = 45 + specificityBonus;
  } else {
    domain = 'general';
    baseConfidence = 25 + specificityBonus;
  }

  // Force search bypasses vagueness (used by "Try:" chips and "search anyway")
  const isVague = options.forceSearch ? false : baseConfidence < 55;

  // Generate context-aware suggestions for vague queries
  const suggestions = [];
  if (isVague) {
    if (domain === 'medicine') {
      suggestions.push(
        `Try: "${cleaned} 500mg"`,
        `Try: "${cleaned} tablet"`,
      );
    } else if (domain === 'food') {
      suggestions.push(
        `Try: "${cleaned} 500g"`,
        `Try: "${cleaned} pack"`,
      );
    } else if (domain === 'electronics') {
      suggestions.push(
        `Try: "${cleaned} price"`,
        `Try: "${cleaned} latest"`,
      );
    } else {
      // General — provide helpful, non-generic suggestions
      suggestions.push(
        `Try: "${cleaned} price in india"`,
        `Try adding a specific size, variant, or model number`,
      );
    }
  }

  return {
    domain: domain === 'electronics' ? 'general' : domain,
    confidence: baseConfidence,
    suggestions,
    isVague,
  };
}

module.exports = { resolveIntent };
