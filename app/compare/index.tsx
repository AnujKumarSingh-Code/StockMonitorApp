import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';


import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import alphaApi from '@/services/alphaApi';
import { useDebounce } from '@/hooks/useDebounce';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { formatPrice, formatLargeNumber, formatPercent } from '@/utils/dummy';
import type { StockOverview, SearchResult } from '@/types/database';


interface CompareStock {
  symbol: string;
  overview: StockOverview | null;
  isLoading: boolean;
}



export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();

  const [stocks, setStocks] = useState<CompareStock[]>([
    { symbol: '', overview: null, isLoading: false },
    { symbol: '', overview: null, isLoading: false },
  ]);

  const [showSearch, setShowSearch] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);



  useEffect(() => {
    if (debouncedQuery.length >= 1) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);



  const searchStocks = async () => {
    setIsSearching(true);
    try {
      const result = await alphaApi.searchSymbols(debouncedQuery);
      setSearchResults(result.bestMatches || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };


  const selectStock = async (result: SearchResult) => {
    const symbol = result['1. symbol'];
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);

    // Update stock in slot
    const newStocks = [...stocks];
    newStocks[activeSlot] = { symbol, overview: null, isLoading: true };
    setStocks(newStocks);


    // Fetch overview
    try {
      const overview = await alphaApi.getOverview(symbol);
      newStocks[activeSlot] = { symbol, overview, isLoading: false };
      setStocks([...newStocks]);
    } catch (error) {
      newStocks[activeSlot] = { symbol, overview: null, isLoading: false };
      setStocks([...newStocks]);
    }
  };



  const openSearchModal = (slot: number) => {
    setActiveSlot(slot);
    setShowSearch(true);
  };

  const clearSlot = (slot: number) => {
    const newStocks = [...stocks];
    newStocks[slot] = { symbol: '', overview: null, isLoading: false };
    setStocks(newStocks);
  };


  const addThirdStock = () => {
    if (stocks.length < 3) {
      setStocks([...stocks, { symbol: '', overview: null, isLoading: false }]);
    }
  };

  const removeThirdStock = () => {
    if (stocks.length > 2) {
      setStocks(stocks.slice(0, 2));
    }
  };

  // Comparison metrics
  const metrics = [
    { key: 'MarketCapitalization', label: 'Market Cap', format: formatLargeNumber },
    { key: 'PERatio', label: 'P/E Ratio', format: (v: string) => v || 'N/A' },
    { key: 'EPS', label: 'EPS', format: (v: string) => formatPrice(v) },
    { key: 'DividendYield', label: 'Dividend Yield', format: (v: string) => v ? `${(parseFloat(v) * 100).toFixed(2)}%` : 'N/A' },
    { key: '52WeekHigh', label: '52W High', format: (v: string) => formatPrice(v) },
    { key: '52WeekLow', label: '52W Low', format: (v: string) => formatPrice(v) },
    { key: 'Beta', label: 'Beta', format: (v: string) => v || 'N/A' },
    { key: 'ProfitMargin', label: 'Profit Margin', format: (v: string) => v ? `${(parseFloat(v) * 100).toFixed(2)}%` : 'N/A' },
    { key: 'RevenueTTM', label: 'Revenue (TTM)', format: formatLargeNumber },
    { key: 'GrossProfitTTM', label: 'Gross Profit', format: formatLargeNumber },
  ];



  const StockSlot = ({ stock, slot }: { stock: CompareStock; slot: number }) => (
    <View style={[styles.stockSlot, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {stock.symbol ? (
        <>
          <View style={styles.slotHeader}>
            <Text style={[styles.symbolText, { color: colors.text }]}>{stock.symbol}</Text>
            <TouchableOpacity onPress={() => clearSlot(slot)}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {stock.isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : stock.overview?.Name ? (
            <Text style={[styles.nameText, { color: colors.textMuted }]} numberOfLines={1}>
              {stock.overview.Name}
            </Text>
          ) : (
            <Text style={[styles.nameText, { color: colors.danger }]}>No data</Text>
          )}
        </>
      ) : (
        <TouchableOpacity style={styles.addSlot} onPress={() => openSearchModal(slot)}>
          <Ionicons name="add-circle" size={32} color={colors.primary} />
          <Text style={[styles.addText, { color: colors.primary }]}>Add Stock</Text>
        </TouchableOpacity>
      )}
    </View>
  );



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Compare Stocks</Text>
        <View style={{ width: 24 }} />
      </View>


      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stock Slots */}
        <View style={styles.slotsRow}>
          {stocks.map((stock, index) => (
            <StockSlot key={index} stock={stock} slot={index} />
          ))}
        </View>


        {/* Add/Remove Third Stock */}
        <View style={styles.addRemoveRow}>
          {stocks.length < 3 ? (
            <TouchableOpacity style={styles.addThirdBtn} onPress={addThirdStock}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={[styles.addThirdText, { color: colors.primary }]}>Add third stock</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addThirdBtn} onPress={removeThirdStock}>
              <Ionicons name="remove" size={16} color={colors.danger} />
              <Text style={[styles.addThirdText, { color: colors.danger }]}>Remove third</Text>
            </TouchableOpacity>
          )}
        </View>



        {/* Comparison Table */}
        {stocks.some((s) => s.overview) && (
          <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.tableTitle, { color: colors.text }]}>Comparison</Text>
            

            {metrics.map((metric) => (
              <View key={metric.key} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{metric.label}</Text>
                <View style={styles.metricValues}>
                  {stocks.map((stock, index) => (
                    <Text 
                      key={index} 
                      style={[styles.metricValue, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {stock.overview ? metric.format((stock.overview as any)[metric.key]) : '-'}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>



      {/* Search Modal */}

      <Modal visible={showSearch} animationType="slide" transparent={false}>
        <View style={[styles.searchModal, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          <View style={styles.searchHeader}>

            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.searchInputContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="search" size={20} color={colors.textMuted} />

              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search stocks..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="characters"
              />
            </View>
          </View>


          {isSearching ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : (

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item['1. symbol']}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.searchResult, { borderBottomColor: colors.border }]}
                  onPress={() => selectStock(item)}
                >

                  <Text style={[styles.resultSymbol, { color: colors.text }]}>
                    {item['1. symbol']}
                  </Text>
                  <Text style={[styles.resultName, { color: colors.textMuted }]} numberOfLines={1}>
                    {item['2. name']}
                  </Text>

                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stockSlot: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  nameText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  addSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  addRemoveRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addThirdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addThirdText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tableContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  tableTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  metricLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  metricValues: {
    flexDirection: 'row',
    flex: 2,
  },
  metricValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchModal: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
  },
  loader: {
    marginTop: spacing.xl,
  },
  searchResult: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
  },
  resultSymbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  resultName: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  
});