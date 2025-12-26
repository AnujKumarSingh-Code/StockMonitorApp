import { create } from 'zustand';
import storage from '@/lib/storage';

import type { Watchlist, WatchlistStock } from '@/types/database';

interface WatchlistState {
  watchlists: Watchlist[];
  isLoading: boolean;

}

interface WatchlistActions {
  loadWatchlists: () => Promise<void>;
  createWatchlist: (name: string) => Promise<Watchlist>;
  deleteWatchlist: (id: string) => Promise<void>;
  renameWatchlist: (id: string, newName: string) => Promise<void>;

  addStock: (watchlistId: string, stock: WatchlistStock) => Promise<void>;
  removeStock: (watchlistId: string, symbol: string) => Promise<void>;

  isStockInWatchlist: (watchlistId: string, symbol: string) => boolean;
  isStockInAnyWatchlist: (symbol: string) => boolean;
  getWatchlistsWithStock: (symbol: string) => Watchlist[];
}

type WatchlistStore = WatchlistState & WatchlistActions;

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useWatchlistStore = create<WatchlistStore>((set, get) => ({
  watchlists: [],
  isLoading: true,

  loadWatchlists: async () => {
    const saved = await storage.getWatchlists<Watchlist[]>();
    set({ watchlists: saved || [], isLoading: false });
  },

  createWatchlist: async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Name cannot be empty');

    const { watchlists } = get();
    if (watchlists.some((w) => w.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error('Watchlist already exists');
    }

    const newWatchlist: Watchlist = {
      id: generateId(),
      name: trimmedName,
      
      stocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...watchlists, newWatchlist];
    set({ watchlists: updated });
    await storage.setWatchlists(updated);
    return newWatchlist;
  },

  deleteWatchlist: async (id: string) => {
    const { watchlists } = get();
    const updated = watchlists.filter((w) => w.id !== id);
    set({ watchlists: updated });
    await storage.setWatchlists(updated);
  },

  renameWatchlist: async (id: string, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) throw new Error('Name cannot be empty');

    const { watchlists } = get();
    if (watchlists.some((w) => w.id !== id && w.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error('Watchlist already exists');
    }

    const updated = watchlists.map((w) =>
      w.id === id ? { ...w, name: trimmedName, updatedAt: new Date().toISOString() } : w
    );
    set({ watchlists: updated });
    await storage.setWatchlists(updated);
  },

  addStock: async (watchlistId: string, stock: WatchlistStock) => {
    const { watchlists } = get();
    const updated = watchlists.map((w) => {
      if (w.id === watchlistId) {
        if (w.stocks.some((s) => s.symbol === stock.symbol)) {
          return w;
        }
        return {
          ...w,
          stocks: [...w.stocks, { ...stock, addedAt: new Date().toISOString() }],
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });
    set({ watchlists: updated });
    await storage.setWatchlists(updated);
  },

  removeStock: async (watchlistId: string, symbol: string) => {
    const { watchlists } = get();
    const updated = watchlists.map((w) => {
      if (w.id === watchlistId) {
        return {
          ...w,
          stocks: w.stocks.filter((s) => s.symbol !== symbol),
          updatedAt: new Date().toISOString(),
        };
      }
      return w;
    });
    set({ watchlists: updated });
    await storage.setWatchlists(updated);
  },

  isStockInWatchlist: (watchlistId: string, symbol: string) => {
    const { watchlists } = get();
    const watchlist = watchlists.find((w) => w.id === watchlistId);
    return watchlist ? watchlist.stocks.some((s) => s.symbol === symbol) : false;
  },

  isStockInAnyWatchlist: (symbol: string) => {
    const { watchlists } = get();
    return watchlists.some((w) => w.stocks.some((s) => s.symbol === symbol));
  },

  getWatchlistsWithStock: (symbol: string) => {
    const { watchlists } = get();
    return watchlists.filter((w) => w.stocks.some((s) => s.symbol === symbol));
  },
}));

export default useWatchlistStore;
