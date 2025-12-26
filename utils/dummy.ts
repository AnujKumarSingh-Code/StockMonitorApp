import type { ThemeColors } from '@/types/database';

export const formatPrice = (price: number | string | undefined, currency: string = '$'): string => {
  if (price === undefined || price === null) return 'N/A';

  const num = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(num)) return 'N/A';
  return `${currency}${num.toFixed(2)}`;
};

export const formatPercent = (value: number | string | undefined, showSign: boolean = true): string => {
  if (value === undefined || value === null) return 'N/A';

  const num = parseFloat(value.toString().replace('%', ''));
  if (isNaN(num)) return 'N/A';

  const sign = showSign && num >= 0 ? '+' : '';

  return `${sign}${num.toFixed(2)}%`;
};

export const formatLargeNumber = (num: number | string | undefined): string => {
  if (!num || num === 'None') return 'N/A';
  const n = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(n)) return 'N/A';

  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;

  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
};

export const formatVolume = (volume: number | string | undefined): string => {
  if (!volume) return 'N/A';

  const num = typeof volume === 'string' ? parseInt(volume) : volume;

  if (isNaN(num)) return 'N/A';
  return formatLargeNumber(num);
};

export const isPositive = (value: string | number | undefined): boolean => {

  const num = parseFloat(value?.toString().replace('%', '') || '0');
  return num >= 0;
};

export const getChangeColor = (value: string | number | undefined, colors: ThemeColors): string => {
  const num = parseFloat(value?.toString().replace('%', '') || '0');
  if (num > 0) return colors.success;

  if (num < 0) return colors.danger;

  return colors.textMuted;
};

export const getChangeBg = (value: string | number | undefined, colors: ThemeColors): string => {

  const num = parseFloat(value?.toString().replace('%', '') || '0');

  if (num > 0) return colors.successBg;

  if (num < 0) return colors.dangerBg;
  return 'transparent';
};

export const formatDate = (
  date: string | Date | undefined,
  format: 'short' | 'time' | 'full' = 'short'

): string => {

  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'N/A';

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'time':
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case 'full':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    default:
      return d.toLocaleDateString();
  }
};

export const truncate = (text: string | undefined, maxLength: number = 100): string => {
  if (!text) return '';

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};


// Stock logo domain mappings
const stockDomains: Record<string, string> = {
  AAPL: 'apple.com',
  GOOGL: 'google.com',
  GOOG: 'google.com',
  MSFT: 'microsoft.com',
  AMZN: 'amazon.com',
  META: 'meta.com',
  TSLA: 'tesla.com',
  NVDA: 'nvidia.com',
  JPM: 'jpmorganchase.com',
  V: 'visa.com',
  JNJ: 'jnj.com',
  WMT: 'walmart.com',
  MA: 'mastercard.com',
  DIS: 'disney.com',
  NFLX: 'netflix.com',
  ADBE: 'adobe.com',
  CRM: 'salesforce.com',
  INTC: 'intel.com',
  AMD: 'amd.com',
  PYPL: 'paypal.com',
  UBER: 'uber.com',
  SPOT: 'spotify.com',
  SNAP: 'snapchat.com',
  ZM: 'zoom.us',
  COIN: 'coinbase.com',
  
};

export const getStockLogo = (symbol: string): string | null => {
  const domain = stockDomains[symbol.toUpperCase()];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
};
