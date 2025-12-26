import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '@/store/themeStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import AnimatedSplash from '@/components/AnimatedSplash';

// Preventing   splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadTheme, isDark, colors, isLoading: isThemeLoading } = useThemeStore();
  const { loadWatchlists } = useWatchlistStore();
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  useEffect(() => {
    const init = async () => {
      await Promise.all([loadTheme(), loadWatchlists()]);
      setAppReady(true);
    };

    init();
  }, [loadTheme , loadWatchlists]);

  useEffect(() => {
    if (fontsLoaded && appReady) {
      SplashScreen.hideAsync();
    }

  }, [fontsLoaded, appReady]);

  if (!fontsLoaded || !appReady) {

    return null;
  }

  return (
    <GestureHandlerRootView  style={{ flex: 1 , backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showAnimatedSplash && (
        <AnimatedSplash onAnimationComplete={() => setShowAnimatedSplash(false)} />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="explore/explore" />
        <Stack.Screen name="product/[symbol]" />
        <Stack.Screen name="viewAll/[section]" />
        <Stack.Screen name="watchlist/[id]" />
        <Stack.Screen name="compare/index" />
      </Stack>
    </GestureHandlerRootView>
  );
}