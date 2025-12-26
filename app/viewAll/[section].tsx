import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';


import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useAlphaStore } from '@/store/alphaStore';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { formatPrice, isPositive, getChangeColor } from '@/utils/dummy';
import type { TopMoverStock, SectionType } from '@/types/database';



const ITEMS_PER_PAGE = 10;

// Avatar colors based on first letter
const getAvatarColor = (letter: string): string => {
  const colors: Record<string, string> = {
    A: '#9C27B0' , B: '#FF9800', C: '#2196F3' , D: '#4CAF50',
    E: '#F44336' , F: '#FF9800', G: '#8BC34A' , H: '#FF9800',
    I: '#00BCD4' , J: '#9C27B0', K: '#FF5722', L: '#3F51B5',
    M: '#E91E63' , N: '#00BCD4', O: '#FF9800' , P: '#9C27B0',
    Q: '#607D8B' , R: '#2196F3', S: '#00BCD4' , T: '#4CAF50',
    U: '#FF5722' , V: '#9C27B0', W: '#3F51B5' , X: '#F44336',
    Y: '#FFC107' , Z: '#607D8B',
  };
  return colors[letter.toUpperCase()] || '#6366F1';
};

type SortOption = 'default' | 'priceDesc' | 'priceAsc' | 'changeDesc';

export default function ViewAllScreen() {
  const insets = useSafeAreaInsets();
  const { section, title } = useLocalSearchParams<{ section: SectionType; title: string }>();
  const { colors } = useThemeStore();
  const { topGainers, topLosers, mostActive } = useAlphaStore();

  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);

  // Get data based on section
  const getData = (): TopMoverStock[] => {
    switch (section) {
      case 'gainers':
        return topGainers;
      case 'losers':
        return topLosers;
      case 'active':
        return mostActive;
      default:
        return [];
    }
  };

  const rawData = getData();


  // Sort data
  const sortedData = useMemo(() => {
    const data = [...rawData];
    switch (sortBy) {
      case 'priceDesc':
        return data.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'priceAsc':
        return data.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'changeDesc':
        return data.sort((a, b) => {
          const aChange = parseFloat(a.change_percentage.replace('%', ''));
          const bChange = parseFloat(b.change_percentage.replace('%', ''));
          return Math.abs(bChange) - Math.abs(aChange);
        });
      default:
        return data;
    }
  }, [rawData, sortBy]);



  // Pagination
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStockPress = useCallback((stock: TopMoverStock) => {
    router.push({
      pathname: '/product/[symbol]',
      params: { 
        symbol: stock.ticker, 
        name: stock.ticker,
        price: stock.price,
        change: stock.change_amount,
        changePercent: stock.change_percentage,
      },
    });
  }, []);



  // Sort Button Component
  const SortButton = ({ label, value }: { label: string; value: SortOption }) => (

    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === value && { backgroundColor: colors.primary },
        sortBy !== value && { backgroundColor: colors.surfaceSecondary },
      ]}
      onPress={() => {
        setSortBy(value);
        setCurrentPage(1);
      }}
    >
      <Text
        style={[
          styles.sortButtonText,
          { color: sortBy === value ? '#FFF' : colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );



  // Stock List Item Component
  const StockListItem = ({ stock }: { stock: TopMoverStock }) => {
    const changeColor = getChangeColor(stock.change_percentage, colors);
    const firstLetter = stock.ticker.charAt(0);
    const avatarColor = getAvatarColor(firstLetter);

    return (

      <TouchableOpacity
        style={[styles.stockItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleStockPress(stock)}
        activeOpacity={0.7}
      >


        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>


        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <Text style={[styles.stockSymbol, { color: colors.text }]}>{stock.ticker}</Text>
          <Text style={[styles.stockSubtitle, { color: colors.textMuted }]}>{stock.ticker}</Text>
        </View>

        {/* Price & Change */}
        <View style={styles.priceContainer}>
          <Text style={[styles.stockPrice, { color: colors.text }]}>
            {formatPrice(stock.price)}
          </Text>
          <Text style={[styles.stockChange, { color: changeColor }]}>
            ↗ {stock.change_percentage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (

    <View style={[styles.container, { backgroundColor: colors.background }]}>


      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>

        <View style={{ width: 40 }} />
      </View>



      {/* Sort Filters */}
      <View style={styles.sortContainer}>
        <SortButton label="Default" value="default" />
        <SortButton label="Price ↓" value="priceDesc" />
        <SortButton label="Price ↑" value="priceAsc" />
        <SortButton label="Change ↓" value="changeDesc" />
      </View>



      {/* List */}
      <FlatList
        data={paginatedData}
        renderItem={({ item }) => <StockListItem stock={item} />}
        keyExtractor={(item) => item.ticker}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />



      {/* Pagination */}
      <View style={[styles.pagination, { backgroundColor: colors.background, paddingBottom: insets.bottom + 10 }]}>
        
        <Text style={[styles.pageInfo, { color: colors.textMuted }]}>
          Page {currentPage} of {totalPages}
        </Text>

        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              { backgroundColor: colors.surfaceSecondary },
              currentPage === 1 && styles.pageButtonDisabled,
            ]}
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? colors.textMuted : colors.text} />
          </TouchableOpacity>

          
          <TouchableOpacity
            style={[
              styles.pageButton,
              { backgroundColor: colors.surfaceSecondary },
              currentPage === totalPages && styles.pageButtonDisabled,
            ]}
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? colors.textMuted : colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  sortButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  sortButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: 100,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  stockInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  stockSymbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  stockSubtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  stockChange: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  pageInfo: {
    fontSize: fontSize.sm,
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
});
