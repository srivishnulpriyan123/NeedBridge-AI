// Supported Global Currencies with Live/Reference Exchange Rates relative to 1 USD
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, flag: '🇺🇸', locale: 'en-US' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 86.0, flag: '🇮🇳', locale: 'en-IN' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, flag: '🇪🇺', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, flag: '🇬🇧', locale: 'en-GB' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.38, flag: '🇨🇦', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.55, flag: '🇦🇺', locale: 'en-AU' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 154.0, flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', rate: 3.67, flag: '🇦🇪', locale: 'ar-AE' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34, flag: '🇸🇬', locale: 'en-SG' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.88, flag: '🇨🇭', locale: 'de-CH' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.45, flag: '🇲🇾', locale: 'ms-MY' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.75, flag: '🇧🇷', locale: 'pt-BR' }
];

// Find currency info by code
export const getCurrencyInfo = (code = 'USD') => {
  const upper = (code || 'USD').toUpperCase();
  return SUPPORTED_CURRENCIES.find((c) => c.code === upper) || SUPPORTED_CURRENCIES[0];
};

// Convert USD to another currency
export const convertFromUSD = (usdAmount, targetCurrency = 'USD') => {
  const curr = getCurrencyInfo(targetCurrency);
  const numeric = parseFloat(usdAmount) || 0;
  return numeric * curr.rate;
};

// Convert another currency amount to USD
export const convertToUSD = (localAmount, sourceCurrency = 'USD') => {
  const curr = getCurrencyInfo(sourceCurrency);
  const numeric = parseFloat(localAmount) || 0;
  if (!curr || curr.rate <= 0) return numeric;
  return numeric / curr.rate;
};

// Multi-currency formatter
export const formatCurrency = (amount, currencyCode = 'USD', options = {}) => {
  const curr = getCurrencyInfo(currencyCode);
  const num = parseFloat(amount) || 0;
  const isNoDecimals = curr.code === 'JPY' || (options.decimals === undefined && Number.isInteger(num));

  try {
    return new Intl.NumberFormat(curr.locale || 'en-US', {
      style: 'currency',
      currency: curr.code,
      minimumFractionDigits: options.decimals !== undefined ? options.decimals : (isNoDecimals ? 0 : 0),
      maximumFractionDigits: options.decimals !== undefined ? options.decimals : (curr.code === 'JPY' ? 0 : 2),
    }).format(num);
  } catch {
    return `${curr.symbol}${num.toLocaleString()}`;
  }
};

// Date formatter
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Shorten cryptographic hash or ID
export const truncateHash = (hash, front = 8, back = 6) => {
  if (!hash) return '';
  if (hash.length <= front + back) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
};

// Calculation of funding percentage
export const calculatePercentage = (current, target) => {
  if (!target || target <= 0) return 0;
  const pct = Math.round((current / target) * 100);
  return Math.min(100, Math.max(0, pct));
};

