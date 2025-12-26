import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSize } from '@/constants/theme';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const { colors } = useThemeStore();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
  },
});
