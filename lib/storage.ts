import AsyncStorage from '@react-native-async-storage/async-storage';



const STORAGE_KEYS = {
  THEME: '@stockvue:theme',
  WATCHLISTS: '@stockvue:watchlists',
  CACHE_PREFIX: '@stockvue:cache:',
  DATA_PREFIX: '@stockvue:data:',
} as const;

export const storage = {

  // Generic data storage
  async getData<T>(key: string): Promise<T | null> {

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DATA_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setData<T>(key: string, data: T): Promise<void> {
    try {

      await AsyncStorage.setItem(STORAGE_KEYS.DATA_PREFIX + key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  },


  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DATA_PREFIX + key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  },



  // Theme
  async getTheme(): Promise<string | null> {
    try {

      return await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    } catch {
      return null;
    }
  },


  async setTheme(theme: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);

    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },


  // Watchlists
  async getWatchlists<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLISTS);
      
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setWatchlists<T>(watchlists: T): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLISTS, JSON.stringify(watchlists));
    } catch (error) {
      console.error('Failed to save watchlists:', error);
    }
  },

  // Cache
  async getCache<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_PREFIX + key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  },

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(STORAGE_KEYS.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  },
};

export default storage;