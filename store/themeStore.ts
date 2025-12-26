import { create } from 'zustand';
import { Appearance } from 'react-native';
import { lightColors, darkColors } from '@/constants/theme';
import storage from '@/lib/storage';
import type { ThemeMode, ThemeColors } from '@/types/database';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  isLoading: boolean;
}

interface ThemeActions {
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

type ThemeStore = ThemeState & ThemeActions;

const getSystemTheme = (): boolean => {
  return Appearance.getColorScheme() === 'dark';
};

const getColorsForMode = (mode: ThemeMode): { isDark: boolean; colors: ThemeColors } => {
  if (mode === 'system') {
    const isDark = getSystemTheme();
    return { isDark, colors: isDark ? darkColors : lightColors };
  }
  const isDark = mode === 'dark';
  return { isDark, colors: isDark ? darkColors : lightColors };
};

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  isLoading: true,

  loadTheme: async () => {
    try {
      const savedTheme = await storage.getTheme();
      const mode = (savedTheme as ThemeMode) || 'dark';
      const { isDark, colors } = getColorsForMode(mode);
      set({ mode, isDark, colors, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setTheme: (mode: ThemeMode) => {
    const { isDark, colors } = getColorsForMode(mode);
    // Update state immediately (synchronous)
    set({ mode, isDark, colors });
    // Persist in background (don't await)
    storage.setTheme(mode).catch(() => {});
  },

  toggleTheme: () => {
    const { isDark } = get();
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    get().setTheme(newMode);
  },
}));

export default useThemeStore;