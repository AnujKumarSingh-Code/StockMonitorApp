import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';


import { useThemeStore } from '@/store/themeStore';
import { fontSize } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const { colors } = useThemeStore();
  const [isComplete, setIsComplete] = useState(false);
  
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-180);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo entrance animation
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoRotate.value = withSpring(0, { damping: 15, stiffness: 80 });

    // Text fade in
    textOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));

    // Exit animation
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setIsComplete)(true);
          runOnJS(onAnimationComplete)();
        }
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  if (isComplete) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, containerAnimatedStyle]}>
      <View style={styles.content}>
        <Animated.View style={logoAnimatedStyle}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={textAnimatedStyle}>
          <Text style={[styles.title, { color: colors.text }]}>StockBroking By Anuj</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Track. Analyze. Invest.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom pulse animation */}
      <View style={styles.loadingContainer}>
        <LoadingDots color={colors.primary} />
      </View>
    </Animated.View>
  );
}

// Loading dots component
function LoadingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animate = () => {
      dot1.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      );
      dot2.value = withDelay(150, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      ));
      dot3.value = withDelay(300, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      ));
    };

    animate();
    const interval = setInterval(animate, 900);
    return () => clearInterval(interval);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: interpolate(dot1.value, [0.3, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: interpolate(dot2.value, [0.3, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: interpolate(dot3.value, [0.3, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});