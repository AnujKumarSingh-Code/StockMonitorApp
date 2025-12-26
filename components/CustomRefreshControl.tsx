import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';


import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSize } from '@/constants/theme';

interface CustomRefreshControlProps {
  refreshing: boolean;
  pullProgress?: number;
}

export default function CustomRefreshControl({ refreshing, pullProgress = 0 }: CustomRefreshControlProps) {
  const { colors } = useThemeStore();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    if (refreshing) {
      // Start spinning animation
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
      scale.value = withSpring(1);
      translateY.value = withSpring(0);
    } else {
      // Stop and reset
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8);
      translateY.value = withTiming(-50);
    }
  }, [refreshing]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: interpolate(scale.value, [0.8, 1], [0, 1]),
  }));

  if (!refreshing && pullProgress === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, spinnerStyle]}>
        <Ionicons name="refresh" size={28} color={colors.primary} />
      </Animated.View>
      {refreshing && (
        <Animated.Text style={[styles.text, { color: colors.textMuted }]}>
          Updating...
        </Animated.Text>
      )}
    </View>
  );
}

// Ticker animation for loading states
export function TickerAnimation() {
  const { colors } = useThemeStore();
  const translate = useSharedValue(0);

  useEffect(() => {
    translate.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 2000, easing: Easing.linear }),
        withTiming(100, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const tickerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value }],
  }));



  const stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA'];

  return (
    <View style={styles.tickerContainer}>
      <Animated.View style={[styles.tickerContent, tickerStyle]}>
        {stocks.map((symbol, index) => (
          <View key={index} style={styles.tickerItem}>
            <Text style={[styles.tickerSymbol, { color: colors.primary }]}>{symbol}</Text>
            <Text style={[styles.tickerPrice, { color: colors.textMuted }]}>Loading...</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}



// Pulse animation for loading cards
export function PulseLoader({ width, height }: { width: number; height: number }) {
  const { colors } = useThemeStore();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulseLoader,
        { width, height, backgroundColor: colors.surfaceSecondary },
        pulseStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  spinner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  tickerContainer: {
    overflow: 'hidden',
    height: 40,
  },
  tickerContent: {
    flexDirection: 'row',
    position: 'absolute',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  tickerSymbol: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  tickerPrice: {
    fontSize: fontSize.sm,
  },
  pulseLoader: {
    borderRadius: 8,
  },
});