import { create } from 'zustand';
import storage from '@/lib/storage';
import type { SearchResult } from '@/types/database';

interface SearchHistoryItem {
  symbol: string;
  name: string;
  timestamp: number;
}

interface SearchHistoryState {
  history: SearchHistoryItem[];
  isLoading: boolean;
}

interface SearchHistoryActions {
  loadHistory: () => Promise<void>;
  addToHistory: (item: SearchResult) => Promise<void>;
  removeFromHistory: (symbol: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

type SearchHistoryStore = SearchHistoryState & SearchHistoryActions;

const MAX_HISTORY_ITEMS = 15;
const STORAGE_KEY = 'searchHistory';

export const useSearchHistoryStore = create<SearchHistoryStore>((set, get) => ({
  history: [],
  isLoading: true,

  loadHistory: async () => {
    try {
      const saved = await storage.getData<SearchHistoryItem[]>(STORAGE_KEY);
      set({ history: saved || [], isLoading: false });
    } catch (error) {
      console.error('Error loading search history:', error);
      set({ isLoading: false });
    }
  },

  addToHistory: async (item: SearchResult) => {
    const { history } = get();
    const symbol = item['1. symbol'];
    const name = item['2. name'];

    // Remove if already exists
    const filtered = history.filter((h) => h.symbol !== symbol);

    // Add to beginning
    const newHistory = [
      { symbol, name, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS);

    set({ history: newHistory });
    await storage.setData(STORAGE_KEY, newHistory);
  },

  removeFromHistory: async (symbol: string) => {
    const { history } = get();
    const newHistory = history.filter((h) => h.symbol !== symbol);
    set({ history: newHistory });
    await storage.setData(STORAGE_KEY, newHistory);
  },

  clearHistory: async () => {
    set({ history: [] });
    await storage.removeData(STORAGE_KEY);
  },
}));

export default useSearchHistoryStore;