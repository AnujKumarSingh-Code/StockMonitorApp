import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { formatPrice, formatPercent, isPositive, getChangeColor, getChangeBg, getStockLogo } from '@/utils/dummy';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import type { WatchlistStock, StockQuote } from '@/types/database';


interface WatchListStockCardProps {
  stock: WatchlistStock;
  quote?: StockQuote | null;
  watchlistId: string;
  onPress?: () => void;
}

export default function WatchListStockCard({
  stock,
  quote,
  watchlistId,
  onPress,
}: WatchListStockCardProps) {
  const { colors } = useThemeStore();
  const { removeStock } = useWatchlistStore();

  const price = quote?.price || 0;
  const changePercent = quote?.changePercent || '0';
  const positive = isPositive(changePercent);
  const changeColor = getChangeColor(changePercent, colors);
  const changeBg = getChangeBg(changePercent, colors);
  const logoUrl = getStockLogo(stock.symbol);

  const handleRemove = () => {
    Alert.alert(
      'Remove Stock',
      `Remove ${stock.name} (${stock.symbol}) from this watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeStock(watchlistId, stock.symbol),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>
              {stock.symbol.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.symbol, { color: colors.text }]}>{stock.symbol}</Text>
          <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.text }]}>
            {quote ? formatPrice(price) : '...'}
          </Text>
          {quote && (
            <View style={[styles.changeTag, { backgroundColor: changeBg }]}>
              <Ionicons
                name={positive ? 'trending-up' : 'trending-down'}
                size={10}
                color={changeColor}
              />
              <Text style={[styles.changeText, { color: changeColor }]}>
                {formatPercent(changePercent)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  info: {
    marginLeft: spacing.md,
    flex: 1,
  },
  symbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  name: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  changeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  changeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.xs,
  },
});
