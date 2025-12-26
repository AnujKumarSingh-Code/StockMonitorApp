import { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';


import { useThemeStore } from '@/store/themeStore';
import { borderRadius, spacing } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export default function Shimmer({
  width = '100%',
  height = 100,
  borderRadius: radius = borderRadius.lg,
  style,

}: ShimmerProps) {
  const { colors } = useThemeStore();
  const translateX = useSharedValue(-SCREEN_WIDTH);



  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, { duration: 1500 }),
      -1,
      false
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));



  return (
    <View
      style={[
        styles.container,
        {
          width: width as number,
          height,
          borderRadius: radius,
          backgroundColor: colors.skeleton,
        },
        style,
      ]}
    >

      <Animated.View
        style={[
          styles.shimmer,
          { backgroundColor: colors.skeletonHighlight },
          animatedStyle,
        ]}
      />
    </View>
  );
}



// Grid of shimmer cards
export function ShimmerGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.gridItem}>
          <Shimmer height={160} />
        </View>
      ))}
    </View>
  );
}



// List of shimmer items
export function ShimmerList({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} height={80} style={styles.listItem} />
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    opacity: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    marginBottom: spacing.md,
  },
});
