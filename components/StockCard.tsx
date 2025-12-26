import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { formatPrice, formatPercent, isPositive, getChangeColor, getChangeBg, getStockLogo } from '@/utils/dummy';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import type { TopMoverStock, Stock } from '@/types/database';


interface StockCardProps {
  stock: TopMoverStock | Stock;
  onPress?: () => void;
  compact?: boolean;
}

export default function StockCard({ stock, onPress, compact = false }: StockCardProps) {
  const { colors } = useThemeStore();

  // Normalize data from different stock types
  const symbol = 'ticker' in stock ? stock.ticker : stock.symbol;
  const price = 'ticker' in stock ? stock.price : stock.price;
  const changePercent = 'ticker' in stock ? stock.change_percentage : stock.changePercent;
  const change = 'ticker' in stock ? stock.change_amount : stock.change;


  const positive = isPositive(changePercent);
  const changeColor = getChangeColor(changePercent, colors);
  const changeBg = getChangeBg(changePercent, colors);
  const logoUrl = getStockLogo(symbol);


  if (compact) {
    return (

      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactLeft}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.compactLogo} />
          ) : (
            <View style={[styles.compactLogoPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.logoText, { color: colors.primary }]}>{symbol.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.compactInfo}>
            <Text style={[styles.compactSymbol, { color: colors.text }]}>{symbol}</Text>
            <Text style={[styles.compactName, { color: colors.textMuted }]} numberOfLines={1}>
              {symbol}
            </Text>
          </View>
        </View>


        <View style={styles.compactRight}>
          <Text style={[styles.compactPrice, { color: colors.text }]}>{formatPrice(price)}</Text>
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
        </View>
      </TouchableOpacity>
    );
  }


  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >


      {/* Logo */}
      <View style={styles.header}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.logoText, { color: colors.primary }]}>{symbol.charAt(0)}</Text>
          </View>
        )}
      </View>


      {/* Info */}
      <View style={styles.content}>
        <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
        <Text style={[styles.name, { color: colors.textMuted }]} numberOfLines={2}>
          {symbol}
        </Text>
      </View>


      {/* Price */}
      <View style={styles.priceSection}>
        <Text style={[styles.price, { color: colors.text }]}>{formatPrice(price)}</Text>
        <View style={[styles.changeTag, { backgroundColor: changeBg }]}>
          <Ionicons
            name={positive ? 'trending-up' : 'trending-down'}
            size={12}
            color={changeColor}
          />
          <Text style={[styles.changeText, { color: changeColor }]}>
            {formatPercent(changePercent)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
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
  content: {
    marginBottom: spacing.sm,
  },
  symbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  name: {
    fontSize: fontSize.sm,
    lineHeight: 16,
  },
  priceSection: {
    marginTop: 'auto',
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  changeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactLogo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
  },
  compactLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  compactSymbol: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  compactName: {
    fontSize: fontSize.xs,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactPrice: {
    fontSize: fontSize.base,
    fontWeight: '700',
    marginBottom: 2,
  },
});
