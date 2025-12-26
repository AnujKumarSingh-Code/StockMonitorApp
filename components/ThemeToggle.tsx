import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useThemeStore } from '@/store/themeStore';
import { borderRadius, spacing } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 40 }: ThemeToggleProps) {
  const { isDark, colors, toggleTheme } = useThemeStore();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(colors.surfaceSecondary),
    transform: [{ rotate: withSpring(isDark ? '180deg' : '0deg') }],
  }));

  return (
    <AnimatedTouchable
      style={[styles.container, { width: size, height: size }, animatedStyle]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={size * 0.5}
        color={colors.text}
      />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
