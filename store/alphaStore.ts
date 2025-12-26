import { create } from 'zustand';
import alphaApi from '@/services/alphaApi';
import type {
  TopMoverStock,
  StockOverview,
  StockQuote,
  ChartDataPoint,
  SearchResult,
  TimeRange,
} from '@/types/database';


interface AlphaState {
  // Top Movers
  topGainers: TopMoverStock[];
  topLosers: TopMoverStock[];
  mostActive: TopMoverStock[];
  lastUpdated: string | null;
  isLoadingMovers: boolean;
  moversError: string | null;

  // Stock Details
  currentOverview: StockOverview | null;
  currentQuote: StockQuote | null;
  isLoadingDetails: boolean;
  detailsError: string | null;

  // Chart Data
  chartData: ChartDataPoint[];
  isLoadingChart: boolean;
  chartError: string | null;



  // Search
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
}


interface AlphaActions {
  fetchTopMovers: () => Promise<void>;
  fetchStockDetails: (symbol: string) => Promise<void>;
  fetchChartData: (symbol: string, range: TimeRange) => Promise<void>;
  searchStocks: (query: string) => Promise<void>;
  clearSearch: () => void;
  clearDetails: () => void;
}

type AlphaStore = AlphaState & AlphaActions;

export const useAlphaStore = create<AlphaStore>((set) => ({

  // Initial State
  topGainers: [],
  topLosers: [],
  mostActive: [],
  lastUpdated: null,
  isLoadingMovers: false,
  moversError: null,

  currentOverview: null,
  currentQuote: null,
  isLoadingDetails: false,
  detailsError: null,

  chartData: [],
  isLoadingChart: false,
  chartError: null,

  searchResults: [],
  isSearching: false,
  searchError: null,


  // Actions
  fetchTopMovers: async () => {
    set({ isLoadingMovers: true, moversError: null });
    try {
      const data = await alphaApi.getTopMovers();
      set({
        topGainers: data.top_gainers || [],
        topLosers: data.top_losers || [],
        mostActive: data.most_actively_traded || [],
        lastUpdated: data.last_updated || new Date().toISOString(),
        isLoadingMovers: false,
      });
    } catch (error) {
      set({
        moversError: error instanceof Error ? error.message : 'Failed to fetch data',
        isLoadingMovers: false,
      });
    }
  },

  fetchStockDetails: async (symbol: string) => {
    set({ isLoadingDetails: true, detailsError: null });
    try {

      const [quoteData, overviewData] = await Promise.all([
        alphaApi.getQuote(symbol),
        alphaApi.getOverview(symbol),
      ]);

      const quote = quoteData['Global Quote'];
      const parsedQuote: StockQuote | null = quote
        ? {
            symbol: quote['01. symbol'],
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            price: parseFloat(quote['05. price']),
            volume: parseInt(quote['06. volume']),
            latestTradingDay: quote['07. latest trading day'],
            previousClose: parseFloat(quote['08. previous close']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent']?.replace('%', '') || '0',
          }
        : null;

      set({
        currentQuote: parsedQuote,
        currentOverview: overviewData.Symbol ? overviewData : null,
        isLoadingDetails: false,
      });
    } catch (error) {
      set({
        detailsError: error instanceof Error ? error.message : 'Failed to fetch details',
        isLoadingDetails: false,
      });
    }
  },



  fetchChartData: async (symbol: string, range: TimeRange) => {
    set({ isLoadingChart: true, chartError: null });
    try {
      const data = await alphaApi.getChartData(symbol, range);

      set({ chartData: data, isLoadingChart: false });
    } catch (error) {
      set({
        chartError: error instanceof Error ? error.message : 'Failed to fetch chart',
        isLoadingChart: false,
      });
    }
  },


  searchStocks: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true, searchError: null });
    try {
      const data = await alphaApi.searchSymbols(query);
      
      set({ searchResults: data.bestMatches || [], isSearching: false });
    } catch (error) {
      set({
        searchError: error instanceof Error ? error.message : 'Search failed',
        isSearching: false,
      });
    }
  },

  clearSearch: () => {
    set({ searchResults: [], searchError: null });
  },

  clearDetails: () => {
    set({
      currentOverview: null,
      currentQuote: null,
      chartData: [],
      detailsError: null,
      chartError: null,
    });
  },
}));

export default useAlphaStore;
