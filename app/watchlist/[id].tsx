import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';


import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { formatPrice, getChangeColor } from '@/utils/dummy';
import alphaApi from '@/services/alphaApi';
import type { WatchlistStock, StockQuote } from '@/types/database';


export default function WatchlistDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { colors } = useThemeStore();
  const { watchlists, removeStock, deleteWatchlist } = useWatchlistStore();

  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set());

  

  // Get current watchlist
  const watchlist = watchlists.find((w) => w.id === id);
  
  const filteredStocks = watchlist?.stocks.filter((s) =>
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];



  const fetchQuotes = useCallback(async () => {
    if (!watchlist || watchlist.stocks.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const quotePromises = watchlist.stocks.map(async (stock) => {

        try {
          const data = await alphaApi.getQuote(stock.symbol);
          const quote = data['Global Quote'];


          if (quote && quote['01. symbol']) {
            return {
              symbol: stock.symbol,
              quote: {
                symbol: quote['01. symbol'],
                open: parseFloat(quote['02. open'] || '0'),
                high: parseFloat(quote['03. high'] || '0'),
                low: parseFloat(quote['04. low'] || '0'),
                price: parseFloat(quote['05. price'] || '0'),
                volume: parseInt(quote['06. volume'] || '0'),
                latestTradingDay: quote['07. latest trading day'] || '',
                previousClose: parseFloat(quote['08. previous close'] || '0'),
                change: parseFloat(quote['09. change'] || '0'),
                changePercent: (quote['10. change percent'] || '0').replace('%', ''),
              } as StockQuote,
            };
          }
          return null;
        } catch {
          return null;
        }
      });


      const results = await Promise.all(quotePromises);

      const newQuotes: Record<string, StockQuote> = {};

      results.forEach((result) => {
        if (result) {
          newQuotes[result.symbol] = result.quote;
        }
      });
      setQuotes(newQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [watchlist]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQuotes();
  }, [fetchQuotes]);

  const toggleSelection = (symbol: string) => {
    const newSelected = new Set(selectedSymbols);
    if (newSelected.has(symbol)) {
      newSelected.delete(symbol);
    } else {
      newSelected.add(symbol);
    }
    setSelectedSymbols(newSelected);
  };



  const handleStockPress = (stock: WatchlistStock) => {
    if (isDeleteMode) {
      toggleSelection(stock.symbol);
    } else {
      router.push({
        pathname: '/product/[symbol]',
        params: { symbol: stock.symbol, name: stock.name },
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedSymbols.size === 0) {
      Alert.alert('No Selection', 'Please select stocks to remove');
      return;
    }


    Alert.alert(
      'Remove Stocks',
      `Are you sure you want to remove ${selectedSymbols.size} stock(s) from this watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            selectedSymbols.forEach((symbol) => removeStock(id || '', symbol));
            setSelectedSymbols(new Set());
            setIsDeleteMode(false);
          },
        },
      ]
    );
  };



  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      setSelectedSymbols(new Set());
    }
    setIsDeleteMode(!isDeleteMode);
  };

  const handleDeleteWatchlist = () => {
    Alert.alert(
      'Delete Watchlist',
      `Are you sure you want to delete "${watchlist?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWatchlist(id || '');
            router.back();
          },
        },
      ]
    );
  };



  const renderStock = ({ item }: { item: WatchlistStock }) => {
    const quote = quotes[item.symbol];
    const price = quote?.price || 0;
    const change = quote?.change || 0;

    const changeColor = getChangeColor(change.toString(), colors);
    const isSelected = selectedSymbols.has(item.symbol);

    return (
      <TouchableOpacity
        style={[styles.stockItem, { 
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        }]}
        onPress={() => handleStockPress(item)}
        activeOpacity={0.7}
      >
        {isDeleteMode && (
          <View style={[
            styles.checkbox,
            { 
              borderColor: isSelected ? colors.primary : colors.textMuted,
              backgroundColor: isSelected ? colors.primary : 'transparent',
            }
          ]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            )}
          </View>
        )}
        <View style={styles.stockLeft}>

          <Text style={[styles.stockSymbol, { color: colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.stockName, { color: colors.primary }]}>{item.name}</Text>

        </View>

        <View style={styles.stockRight}>
          <Text style={[styles.stockPrice, { color: colors.text }]}>
            {quote ? formatPrice(price) : '...'}
          </Text>
          <Text style={[styles.stockChange, { color: changeColor }]}>
            {quote ? formatPrice(Math.abs(change)) : '--'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  const EmptyState = () => (

    <View style={styles.emptyContainer}>

      <Ionicons name="trending-up" size={48} color={colors.textMuted} />

      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Stocks Yet</Text>

      <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
        Add stocks from the Explore screen
      </Text>


      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.exploreButtonText}>Explore Stocks</Text>
      </TouchableOpacity>
    </View>
  );

  if (!watchlist) {

    return (

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Watchlist Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>


      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Watchlist Details</Text>
        <View style={{ width: 40 }} />
      </View>



      {/* Title Row */}
      <View style={styles.titleRow}>
        <Text style={[styles.watchlistName, { color: colors.text }]}>{watchlist.name}</Text>
        <View style={styles.titleActions}>
          {isDeleteMode ? (
            <>
              <TouchableOpacity 
                style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                onPress={handleDeleteSelected}
              >
                <Text style={styles.deleteButtonText}>
                  Remove ({selectedSymbols.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleDeleteMode}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              {filteredStocks.length > 0 && (
                <TouchableOpacity onPress={toggleDeleteMode}>
                  <Ionicons name="trash-outline" size={22} color={colors.text} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDeleteWatchlist}>
                <Ionicons name="folder-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>



      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search stocks..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>


      

      {/* Stock List */}
      {filteredStocks.length > 0 ? (
        <FlatList
          data={filteredStocks}
          renderItem={renderStock}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <EmptyState />
      )}
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
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  watchlistName: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockLeft: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  stockName: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  stockRight: {
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  exploreButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});