/**
 * Parses ingredient strings into structured data
 * Handles formats like: "2 cups flour", "1/2 tsp salt", "a pinch of salt", "to taste"
 */

export interface ParsedIngredient {
  qty: number;
  unit: string;
  name: string;
  raw: string;
}

// Common units and their variations
const UNIT_MAP: Record<string, string> = {
  // Volume
  'cup': 'cup', 'cups': 'cup', 'c': 'cup', 'c.': 'cup',
  'tablespoon': 'tbsp', 'tablespoons': 'tbsp', 'tbsp': 'tbsp', 'tbsp.': 'tbsp', 'T': 'tbsp', 'T.': 'tbsp',
  'teaspoon': 'tsp', 'teaspoons': 'tsp', 'tsp': 'tsp', 'tsp.': 'tsp', 't': 'tsp', 't.': 'tsp',
  'pint': 'pint', 'pints': 'pint', 'pt': 'pint', 'pt.': 'pint',
  'quart': 'quart', 'quarts': 'quart', 'qt': 'quart', 'qt.': 'quart',
  'gallon': 'gallon', 'gallons': 'gallon', 'gal': 'gallon', 'gal.': 'gallon',
  'milliliter': 'ml', 'milliliters': 'ml', 'ml': 'ml', 'ml.': 'ml',
  'liter': 'l', 'liters': 'l', 'l': 'l', 'l.': 'l',
  
  // Weight
  'gram': 'g', 'grams': 'g', 'g': 'g', 'g.': 'g',
  'kilogram': 'kg', 'kilograms': 'kg', 'kg': 'kg', 'kg.': 'kg',
  'ounce': 'oz', 'ounces': 'oz', 'oz': 'oz', 'oz.': 'oz',
  'pound': 'lb', 'pounds': 'lb', 'lb': 'lb', 'lb.': 'lb', 'lbs': 'lb', 'lbs.': 'lb',
  
  // Count
  'piece': 'piece', 'pieces': 'piece', 'pcs': 'piece', 'pcs.': 'piece',
  'clove': 'clove', 'cloves': 'clove',
  'slice': 'slice', 'slices': 'slice',
  'pinch': 'pinch', 'pinches': 'pinch',
  'dash': 'dash', 'dashes': 'dash',
  'drop': 'drop', 'drops': 'drop',
  'splash': 'splash', 'splashes': 'splash',
  
  // Special cases
  'to taste': 'to taste',
  'as needed': 'as needed',
  'optional': 'optional'
};

// Fraction mappings
const FRACTION_MAP: Record<string, number> = {
  '½': 0.5, '1/2': 0.5, '1⁄2': 0.5,
  '⅓': 1/3, '1/3': 1/3, '1⁄3': 1/3,
  '⅔': 2/3, '2/3': 2/3, '2⁄3': 2/3,
  '¼': 0.25, '1/4': 0.25, '1⁄4': 0.25,
  '¾': 0.75, '3/4': 0.75, '3⁄4': 0.75,
  '⅕': 0.2, '1/5': 0.2, '1⁄5': 0.2,
  '⅖': 0.4, '2/5': 0.4, '2⁄5': 0.4,
  '⅗': 0.6, '3/5': 0.6, '3⁄5': 0.6,
  '⅘': 0.8, '4/5': 0.8, '4⁄5': 0.8,
  '⅙': 1/6, '1/6': 1/6, '1⁄6': 1/6,
  '⅚': 5/6, '5/6': 5/6, '5⁄6': 5/6,
  '⅛': 0.125, '1/8': 0.125, '1⁄8': 0.125,
  '⅜': 0.375, '3/8': 0.375, '3⁄8': 0.375,
  '⅝': 0.625, '5/8': 0.625, '5⁄8': 0.625,
  '⅞': 0.875, '7/8': 0.875, '7⁄8': 0.875
};

export function parseIngredient(input: string): ParsedIngredient {
  const raw = input.trim();
  if (!raw) {
    return { qty: 1, unit: 'piece', name: '', raw };
  }

  // Handle special cases first
  if (raw.toLowerCase().includes('to taste')) {
    return { qty: 0, unit: 'to taste', name: raw.replace(/\s*to\s*taste\s*/gi, '').trim(), raw };
  }
  
  if (raw.toLowerCase().includes('as needed')) {
    return { qty: 0, unit: 'as needed', name: raw.replace(/\s*as\s*needed\s*/gi, '').trim(), raw };
  }
  
  if (raw.toLowerCase().includes('optional')) {
    return { qty: 0, unit: 'optional', name: raw.replace(/\s*optional\s*/gi, '').trim(), raw };
  }

  // Split into words for processing
  const words = raw.split(/\s+/);
  
  let qty = 1;
  let unit = 'piece';
  let nameStartIndex = 0;

  // Try to extract quantity from the first word(s)
  if (words.length > 0) {
    const firstWord = words[0].toLowerCase();
    
    // Check for fractions first
    if (FRACTION_MAP[firstWord]) {
      qty = FRACTION_MAP[firstWord];
      nameStartIndex = 1;
    }
    // Check for decimal numbers
    else if (!isNaN(parseFloat(firstWord))) {
      qty = parseFloat(firstWord);
      nameStartIndex = 1;
    }
    // Check for "a" or "an"
    else if (firstWord === 'a' || firstWord === 'an') {
      qty = 1;
      nameStartIndex = 1;
    }
    
    // Check for compound quantities like "1 1/2" or "2 1/4"
    if (words.length > 2 && nameStartIndex === 1) {
      const secondWord = words[1].toLowerCase();
      if (FRACTION_MAP[secondWord]) {
        qty += FRACTION_MAP[secondWord];
        nameStartIndex = 2;
      }
    }
  }

  // Try to extract unit from the next word(s)
  if (words.length > nameStartIndex) {
    const unitWord = words[nameStartIndex].toLowerCase().replace(/[,.]/g, '');
    
    if (UNIT_MAP[unitWord]) {
      unit = UNIT_MAP[unitWord];
      nameStartIndex++;
    }
    // Check for compound units like "fluid ounce"
    else if (words.length > nameStartIndex + 1) {
      const compoundUnit = `${unitWord} ${words[nameStartIndex + 1].toLowerCase()}`;
      if (UNIT_MAP[compoundUnit]) {
        unit = UNIT_MAP[compoundUnit];
        nameStartIndex += 2;
      }
    }
  }

  // Everything else is the ingredient name
  const name = words.slice(nameStartIndex).join(' ').trim();
  
  // Handle edge cases for quantity
  if (unit === 'pinch' || unit === 'dash' || unit === 'drop' || unit === 'splash') {
    qty = Math.max(qty, 1); // Ensure at least 1 for these units
  }

  return {
    qty,
    unit,
    name,
    raw
  };
}

/**
 * Formats a parsed ingredient back to a readable string
 */
export function formatIngredient(parsed: ParsedIngredient): string {
  const { qty, unit, name } = parsed;
  
  if (qty === 0) {
    return `${name} (${unit})`;
  }
  
  if (qty === 1 && unit === 'piece') {
    return name;
  }
  
  return `${qty} ${unit} ${name}`;
}

/**
 * Validates if a parsed ingredient has the minimum required information
 */
export function isValidIngredient(parsed: ParsedIngredient): boolean {
  return parsed.name.trim().length > 0;
}
