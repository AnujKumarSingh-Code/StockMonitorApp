import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';


import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { formatPrice, getChangeColor } from '@/utils/dummy';

interface AnimatedStockCardProps {
  symbol: string;
  name?: string;
  price: string | number;
  change: string | number;
  changePercent: string;
  avatarColor: string;
  onPress: () => void;
  width: number;
}


const AnimatedTouchable = Animated.createAnimatedComponent(View);

export default function AnimatedStockCard({
  symbol,
  price,
  change,
  changePercent,
  avatarColor,
  onPress,
  width,
}: AnimatedStockCardProps) {
  const { colors } = useThemeStore();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(false);


  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 15 });
      pressed.value = true;
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
      pressed.value = false;
    })
    .onEnd(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    });


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: interpolate(
        scale.value,
        [0.95, 1],
        [0.1, 0.2],
        Extrapolation.CLAMP
      ),
    };
  });

  const changeColor = getChangeColor(changePercent, colors);
  const changeAmount = parseFloat(change.toString()) || 0;
  const changePercentValue = changePercent.replace('%', '');

  

  return (
    <GestureDetector gesture={tap}>
      <AnimatedTouchable
        style={[
          styles.card,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
            width,
          },
          animatedStyle,
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{symbol.charAt(0)}</Text>
        </View>
        <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
        <Text style={[styles.price, { color: colors.text }]}>{formatPrice(price)}</Text>
        <Text style={[styles.change, { color: changeColor }]}>
          {Math.abs(changeAmount).toFixed(2)} ({changePercentValue}%)
        </Text>
      </AnimatedTouchable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  symbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  change: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});