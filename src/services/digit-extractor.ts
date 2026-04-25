/**
 * Market-Aware Digit Extraction for Deriv Trading
 * Handles different decimal places based on market type
 */

export type MarketCategory = 'volatility_3decimal' | 'volatility_4decimal' | 'jump' | 'standard';

/**
 * Determine market category based on symbol
 */
export function getMarketCategory(symbol: string): MarketCategory {
  // 3rd decimal markets (Volatility 90, 25, 15, 30, 10)
  const thirdDecimalMarkets = [
    '1HZ90V',   // Volatility 90 (1s)
    'R_25',     // Volatility 25 Index
    '1HZ15V',   // Volatility 15 (1s)
    '1HZ30V',   // Volatility 30 (1s)
    'R_10',     // Volatility 10 Index
    '1HZ10V',   // Volatility 10 (1s) - included for completeness
    '1HZ25V',   // Volatility 25 (1s)
    '1HZ50V',   // Volatility 50 (1s) - wait, this is 4th decimal
    '1HZ75V',   // Volatility 75 (1s) - wait, this is 4th decimal
    '1HZ100V'   // Volatility 100 (1s)
  ];

  // 4th decimal markets
  const fourthDecimalMarkets = [
    '1HZ50V',   // Volatility 50 (1s)
    '1HZ75V',   // Volatility 75 (1s)
    'R_50',     // Volatility 50 Index
    'R_75',     // Volatility 75 Index
    'RDBULL',   // Bull Market
    'RDBEAR'    // Bear Market
  ];

  // Jump indices
  const jumpMarkets = [
    'JD10', 'JD25', 'JD50', 'JD75', 'JD100'
  ];

  if (thirdDecimalMarkets.includes(symbol)) {
    return 'volatility_3decimal';
  }
  
  if (fourthDecimalMarkets.includes(symbol)) {
    return 'volatility_4decimal';
  }
  
  if (jumpMarkets.includes(symbol)) {
    return 'jump';
  }
  
  return 'standard';
}

/**
 * Extract 3rd digit after decimal point (thousandths place)
 * For markets: Volatility 90, 25, 15, 30, 10
 * 
 * Example: 123.45678 → 6 (3rd decimal place)
 */
export function getThirdDecimalDigit(price: number): number {
  if (price === null || price === undefined || Number.isNaN(price)) {
    console.error('[getThirdDecimalDigit] Invalid price:', price);
    return 0;
  }

  try {
    // Convert to string with sufficient precision
    const priceStr = price.toString();
    
    // Handle scientific notation
    let normalizedStr = priceStr;
    if (priceStr.includes('e')) {
      normalizedStr = price.toFixed(10);
    }
    
    // Find decimal point position
    const decimalIndex = normalizedStr.indexOf('.');
    
    if (decimalIndex === -1) {
      // No decimal point - return 0
      return 0;
    }
    
    // Get digits after decimal
    const decimalPart = normalizedStr.substring(decimalIndex + 1);
    
    // Need at least 3 digits after decimal
    if (decimalPart.length < 3) {
      // Pad with zeros if needed
      const padded = decimalPart.padEnd(3, '0');
      const digitStr = padded.charAt(2); // 3rd digit (0-indexed)
      const digit = parseInt(digitStr, 10);
      return Number.isNaN(digit) ? 0 : digit;
    }
    
    // Get the 3rd digit (index 2)
    const digitStr = decimalPart.charAt(2);
    const digit = parseInt(digitStr, 10);
    return Number.isNaN(digit) ? 0 : digit;
    
  } catch (error) {
    console.error('[getThirdDecimalDigit] Error extracting digit from price:', price, error);
    return 0;
  }
}

/**
 * Extract 4th digit after decimal point (ten-thousandths place)
 * For markets: Volatility 50, 75, Bull, Bear
 * 
 * Example: 123.45678 → 7 (4th decimal place)
 */
export function getFourthDecimalDigit(price: number): number {
  if (price === null || price === undefined || Number.isNaN(price)) {
    console.error('[getFourthDecimalDigit] Invalid price:', price);
    return 0;
  }

  try {
    // Convert to string with sufficient precision
    const priceStr = price.toString();
    
    // Handle scientific notation
    let normalizedStr = priceStr;
    if (priceStr.includes('e')) {
      normalizedStr = price.toFixed(12);
    }
    
    // Find decimal point position
    const decimalIndex = normalizedStr.indexOf('.');
    
    if (decimalIndex === -1) {
      // No decimal point - return 0
      return 0;
    }
    
    // Get digits after decimal
    const decimalPart = normalizedStr.substring(decimalIndex + 1);
    
    // Need at least 4 digits after decimal
    if (decimalPart.length < 4) {
      // Pad with zeros if needed
      const padded = decimalPart.padEnd(4, '0');
      const digitStr = padded.charAt(3); // 4th digit (0-indexed)
      const digit = parseInt(digitStr, 10);
      return Number.isNaN(digit) ? 0 : digit;
    }
    
    // Get the 4th digit (index 3)
    const digitStr = decimalPart.charAt(3);
    const digit = parseInt(digitStr, 10);
    return Number.isNaN(digit) ? 0 : digit;
    
  } catch (error) {
    console.error('[getFourthDecimalDigit] Error extracting digit from price:', price, error);
    return 0;
  }
}

/**
 * Extract last digit for Jump Indices
 * Uses exact price value, always from latest tick
 * 
 * Example: 12345.67 → 7 (last digit after decimal)
 * Example: 12345 → 5 (last digit of integer)
 */
export function getJumpIndexDigit(price: number): number {
  if (price === null || price === undefined || Number.isNaN(price)) {
    console.error('[getJumpIndexDigit] Invalid price:', price);
    return 0;
  }

  try {
    // Convert to string with precise representation
    let priceStr = price.toString();
    
    // Handle scientific notation
    if (priceStr.includes('e')) {
      priceStr = price.toFixed(10);
    }
    
    // Remove decimal point and get the last character
    const cleaned = priceStr.replace('.', '');
    
    if (cleaned.length === 0) {
      return 0;
    }
    
    // Get last character
    const lastChar = cleaned.charAt(cleaned.length - 1);
    const digit = parseInt(lastChar, 10);
    
    return Number.isNaN(digit) ? 0 : digit;
    
  } catch (error) {
    console.error('[getJumpIndexDigit] Error extracting digit from price:', price, error);
    return 0;
  }
}

/**
 * Standard last digit extraction (original behavior)
 * Gets last digit of price after decimal point
 * 
 * Example: 123.45 → 5
 * Example: 123 → 3 (no decimal, uses integer)
 */
export function getStandardLastDigit(price: number): number {
  if (price === null || price === undefined || Number.isNaN(price)) {
    console.error('[getStandardLastDigit] Invalid price:', price);
    return 0;
  }

  try {
    // Convert to fixed 2 decimal places (Deriv standard)
    const fixedStr = price.toFixed(2);
    const lastChar = fixedStr.slice(-1);
    const digit = parseInt(lastChar, 10);
    
    if (Number.isNaN(digit) || digit < 0 || digit > 9) {
      console.error('[getStandardLastDigit] Failed extraction from price:', price, '→ raw:', lastChar);
      return 0;
    }
    
    return digit;
    
  } catch (error) {
    console.error('[getStandardLastDigit] Error extracting digit from price:', price, error);
    return 0;
  }
}

/**
 * Main entry point - Get market-aware last digit based on symbol
 * This is the function to call from tick handlers
 */
export function getMarketAwareLastDigit(price: number, symbol: string): number {
  if (price === null || price === undefined || Number.isNaN(price)) {
    console.error('[getMarketAwareLastDigit] Invalid price for symbol:', symbol, price);
    return 0;
  }

  const category = getMarketCategory(symbol);
  
  switch (category) {
    case 'volatility_3decimal':
      return getThirdDecimalDigit(price);
      
    case 'volatility_4decimal':
      return getFourthDecimalDigit(price);
      
    case 'jump':
      return getJumpIndexDigit(price);
      
    case 'standard':
    default:
      return getStandardLastDigit(price);
  }
}

/**
 * Debug helper - Get detailed extraction info
 */
export function debugDigitExtraction(price: number, symbol: string): {
  symbol: string;
  price: number;
  category: MarketCategory;
  digit: number;
  method: string;
  rawPrice: string;
} {
  const category = getMarketCategory(symbol);
  let digit: number;
  let method: string;
  
  switch (category) {
    case 'volatility_3decimal':
      digit = getThirdDecimalDigit(price);
      method = '3rd decimal place (thousandths)';
      break;
    case 'volatility_4decimal':
      digit = getFourthDecimalDigit(price);
      method = '4th decimal place (ten-thousandths)';
      break;
    case 'jump':
      digit = getJumpIndexDigit(price);
      method = 'Jump index (exact price)';
      break;
    default:
      digit = getStandardLastDigit(price);
      method = 'Standard (2 decimal places)';
      break;
  }
  
  return {
    symbol,
    price,
    category,
    digit,
    method,
    rawPrice: price.toString()
  };
}
