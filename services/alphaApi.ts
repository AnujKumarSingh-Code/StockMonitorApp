import axios from 'axios';
import storage from '@/lib/storage';

import {
  MOCK_TOP_GAINERS,
  MOCK_TOP_LOSERS,
  MOCK_MOST_ACTIVE,
  MOCK_NEWS,
  generateMockChartData,
  getMockOverview,
} from '@/data/mockData';

import type {
  TopMoversResponse,
  GlobalQuoteResponse,
  StockOverview,
  TimeSeriesResponse,
  SearchResponse,
  ChartDataPoint,
  TimeRange,
} from '@/types/database';

const BASE_URL = 'https://www.alphavantage.co/query';


const API_KEYS = [
  process.env.API_KEY || '',
  'IRZWORWU7REYJQ8Q',
  'YYYCKX0G5GVJ59F9',
  'FY6JXTBCZKI4CBRJ',
].filter(key => key.length > 0);


let currentKeyIndex = 0;

// Get next API key - rotates through available keys
const getNextApiKey = (): string => {
  if (API_KEYS.length === 0) {
    console.warn('No API keys configured!');
    return '';
  }
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
};


// Cache config

const CACHE_DURATION = {
  TOP_MOVERS: 10 * 60 * 1000, // 10 min
  QUOTE: 10 * 60 * 1000,
  OVERVIEW: 60 * 60 * 1000, // 1 hour
  SEARCH: 30 * 60 * 1000,   // 30 min
  CHART: 15 * 60 * 1000,    // 15 min
  NEWS: 30 * 60 * 1000,     // 30 min
  INDICATORS: 30 * 60 * 1000,
};


const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});



const isCacheValid = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp < duration;
};


// Check if response indicates rate limit
const isRateLimited = (data: any): boolean => {
  if (data?.Note?.includes('API call frequency')) return true;
  if (data?.Information?.includes('API call frequency')) return true;
  if (data?.['Error Message']) return true;

  return false;
};


//news types
export interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string | null;
  source: string;
  category_within_source: string;
  source_domain: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment?: {
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }[];
}


export interface NewsResponse {
  feed: NewsArticle[];
  sentiment_score_definition?: string;
}


// Candlestick data type
export interface CandlestickDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}


// Technical indicator types
export interface IndicatorDataPoint {
  timestamp: string;
  value: number;
}



export const alphaApi = {

  // Get Top Gainers/Losers/Most Active
  async getTopMovers(): Promise<TopMoversResponse> {
    const cacheKey = 'topMovers';
    const cached = await storage.getCache<TopMoversResponse>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.TOP_MOVERS)) {
      console.log('Using cached top movers');
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      console.log('Fetching top movers from API...');
      
      const { data } = await api.get('', {
        params: {
          function: 'TOP_GAINERS_LOSERS',
          apikey: apiKey,
        },
      });

      if (isRateLimited(data)) {
        console.warn('API rate limited, using mock data');
        return {
          top_gainers: MOCK_TOP_GAINERS,
          top_losers: MOCK_TOP_LOSERS,
          most_actively_traded: MOCK_MOST_ACTIVE,
          last_updated: new Date().toISOString(),
        };
      }

      if (data.top_gainers) {
        await storage.setCache(cacheKey, data);
        return data;
      }

      // No valid data, use mock
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn('API error, using mock data:', error);
      return {
        top_gainers: MOCK_TOP_GAINERS,
        top_losers: MOCK_TOP_LOSERS,
        most_actively_traded: MOCK_MOST_ACTIVE,
        last_updated: new Date().toISOString(),
      };
    }
  },

  // Get Global Quote
  async getQuote(symbol: string): Promise<GlobalQuoteResponse> {
    const cacheKey = `quote_${symbol}`;
    const cached = await storage.getCache<GlobalQuoteResponse>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.QUOTE)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get('', {
        params: {

          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: apiKey,
        },
      });

      if (isRateLimited(data) || !data['Global Quote']) {
        

        // Return mock quote
        const mockOverview = getMockOverview(symbol);
        return {
          'Global Quote': {
            '01. symbol': symbol,
            '02. open': '150.00',
            '03. high': '155.00',
            '04. low': '148.00',
            '05. price': '152.50',
            '06. volume': '10000000',
            '07. latest trading day': new Date().toISOString().split('T')[0],
            '08. previous close': '150.00',
            '09. change': '2.50',
            '10. change percent': '1.67%',
          },
        };
      }

      await storage.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Quote API error, using mock:', error);
      return {
        'Global Quote': {
          '01. symbol': symbol,
          '02. open': '150.00',
          '03. high': '155.00',
          '04. low': '148.00',
          '05. price': '152.50',
          '06. volume': '10000000',
          '07. latest trading day': new Date().toISOString().split('T')[0],
          '08. previous close': '150.00',
          '09. change': '2.50',
          '10. change percent': '1.67%',
        },
      };
    }
  },



  // Get Company Overview
  async getOverview(symbol: string): Promise<StockOverview> {
    const cacheKey = `overview_${symbol}`;
    const cached = await storage.getCache<StockOverview>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.OVERVIEW)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get('', {
        params: {
          function: 'OVERVIEW',
          symbol,
          apikey: apiKey,
        },
      });

      if (isRateLimited(data) || !data.Symbol) {
        console.warn('Overview API limited, using mock');
        return getMockOverview(symbol) as StockOverview;
      }

      await storage.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.warn('Overview API error, using mock:', error);
      return getMockOverview(symbol) as StockOverview;
    }
  },



  // Get Intraday Data
  async getIntradayData(symbol: string, interval: string = '5min'): Promise<ChartDataPoint[]> {
    const cacheKey = `intraday_${symbol}_${interval}`;
    const cached = await storage.getCache<ChartDataPoint[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.CHART)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get<TimeSeriesResponse>('', {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol,
          interval,
          outputsize: 'compact',
          apikey: apiKey,
        },
      });

      if (isRateLimited(data)) {
        console.warn('Intraday API limited, using mock');
        return generateMockChartData(1, 150);
      }

      const timeSeriesKey = `Time Series (${interval})`;
      const timeSeries = data[timeSeriesKey] || {};

      const chartData: ChartDataPoint[] = Object.entries(timeSeries)
        .map(([timestamp, values]) => ({
          timestamp,
          value: parseFloat(values['4. close']),
        }))
        .reverse();

      if (chartData.length > 0) {
        await storage.setCache(cacheKey, chartData);
        return chartData;
      }

      return generateMockChartData(1, 150);
    } catch (error) {
      console.warn('Intraday API error, using mock:', error);
      return generateMockChartData(1, 150);
    }
  },

  // Get Daily Data
  async getDailyData(symbol: string, outputsize: string = 'compact'): Promise<ChartDataPoint[]> {
    const cacheKey = `daily_${symbol}_${outputsize}`;
    const cached = await storage.getCache<ChartDataPoint[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.CHART)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get<TimeSeriesResponse>('', {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol,
          outputsize,

          apikey: apiKey,
        },
      });


      if (isRateLimited(data)) {
        console.warn('Daily API limited, using mock');
        return generateMockChartData(outputsize === 'full' ? 365 : 100, 150);
      }

      const timeSeries = data['Time Series (Daily)'] || {};

      const chartData: ChartDataPoint[] = Object.entries(timeSeries)
        .map(([timestamp, values]) => ({
          timestamp,
          value: parseFloat(values['4. close']),
        }))
        .reverse();

      if (chartData.length > 0) {
        await storage.setCache(cacheKey, chartData);
        return chartData;
      }

      return generateMockChartData(outputsize === 'full' ? 365 : 100, 150);

    } catch (error) {
      console.warn('Daily API error, using mock:', error);
      return generateMockChartData(outputsize === 'full' ? 365 : 100, 150);
    }
  },


  

  // Get Chart Data based on range
  async getChartData(symbol: string, range: TimeRange): Promise<ChartDataPoint[]> {
    switch (range) {
      case '1D':
        return this.getIntradayData(symbol, '5min');
      case '1W':
        const weekData = await this.getIntradayData(symbol, '60min');
        return weekData.slice(-40);
      case '1M':
        const monthData = await this.getDailyData(symbol, 'compact');
        return monthData.slice(-22);
      case '3M':
        const threeMonthData = await this.getDailyData(symbol, 'compact');
        return threeMonthData.slice(-66);
      case '1Y':
        const yearData = await this.getDailyData(symbol, 'full');
        return yearData.slice(-252);
      case 'ALL':
        return this.getDailyData(symbol, 'full');
      default:
        return this.getIntradayData(symbol, '5min');
    }
  },


  // Search Symbols
  async searchSymbols(keywords: string): Promise<SearchResponse> {
    if (!keywords || keywords.trim().length < 1) {
      return { bestMatches: [] };
    }

    const cacheKey = `search_${keywords}`;
    const cached = await storage.getCache<SearchResponse>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.SEARCH)) {
      return cached.data;
    }


    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get('', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords,
          apikey: apiKey,
        },

      });

      if (isRateLimited(data)) {

        // Return mock search results
        const mockResults = [...MOCK_TOP_GAINERS, ...MOCK_TOP_LOSERS]
          .filter(s => s.ticker.toLowerCase().includes(keywords.toLowerCase()))
          .map(s => ({
            '1. symbol': s.ticker,
            '2. name': `${s.ticker} Inc.`,
            '3. type': 'Equity',
            '4. region': 'United States',
            '5. marketOpen': '09:30',
            '6. marketClose': '16:00',
            '7. timezone': 'UTC-04',
            '8. currency': 'USD',
            '9. matchScore': '1.0000',
          }));
        return { bestMatches: mockResults };
      }

      if (data.bestMatches) {
        await storage.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.warn('Search API error:', error);
      return { bestMatches: [] };
    }
  },



  // Get Stock News
  async getNews(symbol: string, limit: number = 10): Promise<NewsArticle[]> {
    const cacheKey = `news_${symbol}`;
    const cached = await storage.getCache<NewsArticle[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.NEWS)) {
      return cached.data;
    }


    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get<NewsResponse>('', {
        params: {
          function: 'NEWS_SENTIMENT',
          tickers: symbol,
          limit,
          apikey: apiKey,

        },
      });

      if (isRateLimited(data) || !data.feed) {
        console.warn('News API limited, using mock');
        return MOCK_NEWS as NewsArticle[];
      }

      const articles = data.feed || [];
      
      if (articles.length > 0) {
        await storage.setCache(cacheKey, articles);
      }

      return articles;
    } catch (error) {
      console.warn('News API error, using mock:', error);
      return MOCK_NEWS as NewsArticle[];
    }
  },



  // Get Candlestick Data (OHLCV)
  async getCandlestickData(symbol: string, interval: string = 'daily'): Promise<CandlestickDataPoint[]> {
    const cacheKey = `candle_${symbol}_${interval}`;
    const cached = await storage.getCache<CandlestickDataPoint[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.CHART)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const isIntraday = interval !== 'daily' && interval !== 'weekly';
      const func = isIntraday ? 'TIME_SERIES_INTRADAY' : 
                   interval === 'weekly' ? 'TIME_SERIES_WEEKLY' : 'TIME_SERIES_DAILY';
      
      const params: Record<string, string> = {
        function: func,
        symbol,
        apikey: apiKey,
      };

      if (isIntraday) {
        params.interval = interval;
        params.outputsize = 'compact';
      }

      const { data } = await api.get('', { params });


      if (isRateLimited(data)) {
        // Generate mock candlestick data
        return generateMockChartData(90, 150).map((point, i, arr) => ({
          timestamp: point.timestamp,
          open: i > 0 ? arr[i - 1].value : point.value * 0.99,
          high: point.value * (1 + Math.random() * 0.02),
          low: point.value * (1 - Math.random() * 0.02),
          close: point.value,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
        }));
      }


      const timeSeriesKey = isIntraday ? `Time Series (${interval})` :
                           interval === 'weekly' ? 'Weekly Time Series' : 'Time Series (Daily)';
      const timeSeries = data[timeSeriesKey] || {};

      const candlestickData: CandlestickDataPoint[] = Object.entries(timeSeries)
        .slice(0, 90)
        .map(([timestamp, values]: [string, any]) => ({
          timestamp,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .reverse();

      if (candlestickData.length > 0) {
        await storage.setCache(cacheKey, candlestickData);
      }

      return candlestickData;
    } catch (error) {

      console.warn('Candlestick API error, using mock:', error);

      return generateMockChartData(90, 150).map((point, i, arr) => ({
        timestamp: point.timestamp,
        open: i > 0 ? arr[i - 1].value : point.value * 0.99,
        high: point.value * (1 + Math.random() * 0.02),
        low: point.value * (1 - Math.random() * 0.02),
        close: point.value,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      }));
    }
  },


  // Get SMA (Simple Moving Average)
  async getSMA(symbol: string, timePeriod: number = 20, interval: string = 'daily'): Promise<IndicatorDataPoint[]> {
    const cacheKey = `sma_${symbol}_${timePeriod}_${interval}`;
    const cached = await storage.getCache<IndicatorDataPoint[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.INDICATORS)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get('', {
        params: {
          function: 'SMA',
          symbol,
          interval,
          time_period: timePeriod,
          series_type: 'close',
          apikey: apiKey,
        },
      });

      if (isRateLimited(data)) {

        // Generate mock SMA
        const chartData = generateMockChartData(90, 150);

        return chartData.map(p => ({ timestamp: p.timestamp, value: p.value * 0.98 }));
      }

      const technicalAnalysis = data['Technical Analysis: SMA'] || {};

      const indicatorData: IndicatorDataPoint[] = Object.entries(technicalAnalysis)
        .slice(0, 90)
        .map(([timestamp, values]: [string, any]) => ({
          timestamp,
          value: parseFloat(values['SMA']),
        }))
        .reverse();

      if (indicatorData.length > 0) {
        await storage.setCache(cacheKey, indicatorData);
      }

      return indicatorData;

    } catch (error) {
      console.warn('SMA API error:', error);

      const chartData = generateMockChartData(90, 150);

      return chartData.map(p => ({ timestamp: p.timestamp, value: p.value * 0.98 }));
    }
  },



  // Get EMA (Exponential Moving Average)
  async getEMA(symbol: string, timePeriod: number = 20, interval: string = 'daily'): Promise<IndicatorDataPoint[]> {
    const cacheKey = `ema_${symbol}_${timePeriod}_${interval}`;

    const cached = await storage.getCache<IndicatorDataPoint[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.INDICATORS)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get('', {
        params: {
          function: 'EMA',
          symbol,
          interval,
          time_period: timePeriod,
          series_type: 'close',
          apikey: apiKey,
        },
      });

      if (isRateLimited(data)) {
        const chartData = generateMockChartData(90, 150);
        return chartData.map(p => ({ timestamp: p.timestamp, value: p.value * 0.99 }));
      }

      const technicalAnalysis = data['Technical Analysis: EMA'] || {};

      const indicatorData: IndicatorDataPoint[] = Object.entries(technicalAnalysis)
        .slice(0, 90)
        .map(([timestamp, values]: [string, any]) => ({
          timestamp,
          value: parseFloat(values['EMA']),
        }))
        .reverse();

      if (indicatorData.length > 0) {

        await storage.setCache(cacheKey, indicatorData);
      }

      return indicatorData;
    } catch (error) {
      console.warn('EMA API error:', error);

      const chartData = generateMockChartData(90, 150);
      return chartData.map(p => ({ timestamp: p.timestamp, value: p.value * 0.99 }));
    }
  },



  // Get RSI (Relative Strength Index)
  async getRSI(symbol: string, timePeriod: number = 14, interval: string = 'daily'): Promise<IndicatorDataPoint[]> {
    const cacheKey = `rsi_${symbol}_${timePeriod}_${interval}`;

    const cached = await storage.getCache<IndicatorDataPoint[]>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.INDICATORS)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();

      const { data } = await api.get('', {
        params: {
          function: 'RSI',
          symbol,
          interval,
          time_period: timePeriod,
          series_type: 'close',
          apikey: apiKey,
        },
      });

      if (isRateLimited(data)) {
        const chartData = generateMockChartData(90, 50);
        return chartData.map(p => ({ 
          timestamp: p.timestamp, 
          value: 30 + Math.random() * 40 // RSI between 30-70
        }));
      }



      const technicalAnalysis = data['Technical Analysis: RSI'] || {};
      const indicatorData: IndicatorDataPoint[] = Object.entries(technicalAnalysis)
        .slice(0, 90)
        .map(([timestamp, values]: [string, any]) => ({
          timestamp,
          value: parseFloat(values['RSI']),
        }))
        .reverse();

      if (indicatorData.length > 0) {

        await storage.setCache(cacheKey, indicatorData);
      }


      return indicatorData;

    } catch (error) {
      console.warn('RSI API error:', error);
      const chartData = generateMockChartData(90, 50);
      return chartData.map(p => ({ 
        timestamp: p.timestamp, 
        value: 30 + Math.random() * 40
      }));
    }
  },


  // Get MACD
  async getMACD(symbol: string, interval: string = 'daily'): Promise<{ macd: IndicatorDataPoint[], signal: IndicatorDataPoint[], histogram: IndicatorDataPoint[] }> {
    const cacheKey = `macd_${symbol}_${interval}`;
    const cached = await storage.getCache<{ macd: IndicatorDataPoint[], signal: IndicatorDataPoint[], histogram: IndicatorDataPoint[] }>(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp, CACHE_DURATION.INDICATORS)) {
      return cached.data;
    }

    try {
      const apiKey = getNextApiKey();
      const { data } = await api.get('', {
        params: {
          function: 'MACD',
          symbol,
          interval,
          series_type: 'close',
          apikey: apiKey,
        },
      });

      if (isRateLimited(data)) {

        // Generate mock MACD
        const chartData = generateMockChartData(90, 0);
        return {

          macd: chartData.map(p => ({ timestamp: p.timestamp, value: (Math.random() - 0.5) * 5 })),
          signal: chartData.map(p => ({ timestamp: p.timestamp, value: (Math.random() - 0.5) * 4 })),
          histogram: chartData.map(p => ({ timestamp: p.timestamp, value: (Math.random() - 0.5) * 2 })),
        };
      }

      const technicalAnalysis = data['Technical Analysis: MACD'] || {};

      const entries = Object.entries(technicalAnalysis).slice(0, 90).reverse();
      

      const result = {
        macd: entries.map(([timestamp, values]: [string, any]) => ({
          timestamp,
          value: parseFloat(values['MACD']),
        })),
        signal: entries.map(([timestamp, values]: [string, any]) => ({
          timestamp,
          value: parseFloat(values['MACD_Signal']),
        })),
        histogram: entries.map(([timestamp, values]: [string, any]) => ({
          timestamp,
          value: parseFloat(values['MACD_Hist']),
        })),
      };
      

      if (result.macd.length > 0) {
        await storage.setCache(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.warn('MACD API error:', error);
      const chartData = generateMockChartData(90, 0);
      return {
        macd: chartData.map(p => ({ timestamp: p.timestamp, value: (Math.random() - 0.5) * 5 })),
        signal: chartData.map(p => ({ timestamp: p.timestamp, value: (Math.random() - 0.5) * 4 })),
        histogram: chartData.map(p => ({ timestamp: p.timestamp, value: (Math.random() - 0.5) * 2 })),
      };
    }
  },
};

export default alphaApi;