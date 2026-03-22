/**
 * Intent Resolver — classifies search queries and assigns confidence scores.
 *
 * High confidence (≥60%) → fetch live data from adapters
 * Low confidence (<60%)  → return suggestions only
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

/**
 * Resolve the intent of a search query.
 * @param {string} query - user's search query
 * @returns {{ domain: string, confidence: number, suggestions: string[], isVague: boolean }}
 */
function resolveIntent(query) {
  if (!query || typeof query !== 'string') {
    return { domain: 'unknown', confidence: 0, suggestions: [], isVague: true };
  }

  const cleaned = query.trim().toLowerCase();
  const words = cleaned.split(/\s+/);

  let medicineScore = 0;
  let foodScore = 0;
  let generalScore = 0;

  // Score each word
  for (const word of words) {
    if (MEDICINE_TERMS.has(word)) medicineScore += 25;
    if (FOOD_TERMS.has(word)) foodScore += 25;
  }

  // Check if multi-word (more specific = higher confidence)
  const specificityBonus = Math.min(words.length * 10, 30);

  // Check for dosage patterns (e.g. "500mg", "200ml") → strong medicine signal
  if (/\d+\s*(mg|ml|mcg|iu)/i.test(cleaned)) {
    medicineScore += 40;
  }

  // Check for weight patterns (e.g. "500g", "1kg") → food signal
  if (/\d+\s*(g|kg|gm|liter|l|oz)\b/i.test(cleaned)) {
    foodScore += 30;
  }

  // Determine domain
  let domain = 'general';
  let baseConfidence = 30;

  if (medicineScore > foodScore && medicineScore > 0) {
    domain = 'medicine';
    baseConfidence = Math.min(medicineScore + specificityBonus, 95);
  } else if (foodScore > medicineScore && foodScore > 0) {
    domain = 'food';
    baseConfidence = Math.min(foodScore + specificityBonus, 95);
  } else if (words.length >= 3) {
    domain = 'general';
    baseConfidence = 50 + specificityBonus;
  } else {
    domain = 'general';
    baseConfidence = 30 + specificityBonus;
  }

  const isVague = baseConfidence < 60;

  // Generate suggestions for vague queries
  const suggestions = [];
  if (isVague) {
    if (domain === 'medicine' || domain === 'unknown') {
      suggestions.push(`Try: "${cleaned} 500mg"`, `Try: "${cleaned} tablet"`, `Try: "${cleaned} brand name"`);
    }
    if (domain === 'food' || domain === 'unknown') {
      suggestions.push(`Try: "${cleaned} 100g pack"`, `Try: "${cleaned} brand"`, `Try: "brand ${cleaned}"`);
    }
    if (domain === 'general') {
      suggestions.push(`Try: "${cleaned} brand model"`, `Try a more specific search term`);
    }
  }

  return {
    domain,
    confidence: baseConfidence,
    suggestions,
    isVague,
  };
}

module.exports = { resolveIntent };
