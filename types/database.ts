export interface Stock {
  symbol: string;
  name: string;
  price: number | string;
  changePercent: string;
  change?: number | string;
  volume?: number | string;
}



export interface TopMoverStock {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export interface StockOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  ReturnOnEquityTTM?: string;
  ProfitMargin?: string;
  OperatingMarginTTM?: string;
}


export interface StockQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}



export interface SearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}




export interface WatchlistStock {
  symbol: string;
  name: string;
  addedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  stocks: WatchlistStock[];
  createdAt: string;
  updatedAt: string;
}



// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  accent: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  card: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  skeleton: string;
  skeletonHighlight: string;
  overlay: string;
}


// API Response Types
export interface TopMoversResponse {
  top_gainers: TopMoverStock[];
  top_losers: TopMoverStock[];
  most_actively_traded: TopMoverStock[];
  last_updated: string;
}

export interface GlobalQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export interface TimeSeriesResponse {
  [key: string]: {
    [timestamp: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

export interface SearchResponse {
  bestMatches: SearchResult[];
}

// Chart Types
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

// Section Types for ViewAll
export type SectionType = 'gainers' | 'losers' | 'active';
