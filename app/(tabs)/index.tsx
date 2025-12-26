import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Modal,
  Dimensions,
  Platform,
  Switch,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '@/store/themeStore';
import { useAlphaStore } from '@/store/alphaStore';
import { useSearchHistoryStore } from '@/store/searchHistoryStore';
import { useDebounce } from '@/hooks/useDebounce';
import { ShimmerGrid } from '@/components/Shimmer';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import { formatPrice, isPositive, getChangeColor } from '@/utils/dummy';

import type { TopMoverStock, SearchResult, SectionType } from '@/types/database';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.base * 3) / 2;
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 85;

// Hardcoding  avatar colors based on first letter
const getAvatarColor = (letter: string): string => {
  const colors: Record<string, string> = {
    A: '#9C27B0' , B: '#FF9800', C: '#2196F3' , D: '#4CAF50',
    E: '#F44336' , F: '#FF9800', G: '#8BC34A' , H: '#FF9800',
    I: '#00BCD4' , J: '#9C27B0', K: '#FF5722' , L: '#3F51B5',
    M: '#E91E63' , N: '#00BCD4', O: '#FF9800' , P: '#9C27B0',
    Q: '#607D8B' , R: '#2196F3', S: '#00BCD4' , T: '#4CAF50',
    U: '#FF5722' , V: '#9C27B0', W: '#3F51B5' , X: '#F44336',
    Y: '#FFC107' , Z: '#607D8B',
  };
  return colors[letter.toUpperCase()] || '#6366F1';
};





const CATEGORIES = ['All', 'Stocks', 'Gainers', 'Losers', 'Active'];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useThemeStore();
  const {
    topGainers,
    topLosers,
    mostActive,
    isLoadingMovers,
    moversError,
    fetchTopMovers,
    searchResults,
    isSearching,
    searchStocks,
    clearSearch,
  } = useAlphaStore();

  const { history, loadHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistoryStore();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchTopMovers();
    loadHistory();
  }, [fetchTopMovers, loadHistory]);



  useEffect(() => {
    if (debouncedQuery) {
      searchStocks(debouncedQuery);
    } else {
      clearSearch();
    }
  }, [debouncedQuery, searchStocks, clearSearch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchTopMovers();
    setRefreshing(false);
  }, [fetchTopMovers]);


  const handleStockPress = (stock: TopMoverStock) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
  };



  const handleSearchResultPress = (result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToHistory(result);
    setSearchQuery('');
    setShowSearch(false);
    clearSearch();
    router.push({
      pathname: '/product/[symbol]',
      params: { symbol: result['1. symbol'], name: result['2. name'] },
    });
  };

  const handleHistoryPress = (symbol: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery('');
    setShowSearch(false);
    clearSearch();
    router.push({
      pathname: '/product/[symbol]',
      params: { symbol, name },
    });
  };

  const handleTrendingPress = (stock: TopMoverStock) => {
    setSearchQuery('');
    setShowSearch(false);
    clearSearch();
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
  };



  const handleViewAll = (section: SectionType, title: string) => {
    router.push({
      pathname: '/viewAll/[section]',
      params: { section, title },
    });
  };

  // Get trending stocks based on category
  const getTrendingStocks = (): TopMoverStock[] => {
    switch (selectedCategory) {
      case 'Gainers':
        return topGainers.slice(0, 8);
      case 'Losers':
        return topLosers.slice(0, 8);
      case 'Active':
        return mostActive.slice(0, 8);
      case 'Stocks':
      case 'All':
      default:
        // Mixing of   all categories
        const mixed: TopMoverStock[] = [];
        for (let i = 0; i < 3; i++) {
          if (topGainers[i]) mixed.push(topGainers[i]);
          if (topLosers[i]) mixed.push(topLosers[i]);
          if (mostActive[i]) mixed.push(mostActive[i]);
        }
        return mixed.slice(0, 8);
    }
  };

  const StockCard = ({ stock }: { stock: TopMoverStock }) => {
    const changeColor = getChangeColor(stock.change_percentage, colors);
    const firstLetter = stock.ticker.charAt(0);
    const avatarColor = getAvatarColor(firstLetter);
    
    const changeAmount = parseFloat(stock.change_amount) || 0;
    const changePercent = stock.change_percentage.replace('%', '');

    return (
      <TouchableOpacity
        style={[styles.stockCard, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}
        onPress={() => handleStockPress(stock)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>

        <Text style={[styles.stockSymbol, { color: colors.text }]}>
          {stock.ticker}
        </Text>

        <Text style={[styles.stockPrice, { color: colors.text }]}>
          {formatPrice(stock.price)}
        </Text>

        <Text style={[styles.stockChange, { color: changeColor }]}>
          {Math.abs(changeAmount).toFixed(2)} ({changePercent}%)
        </Text>

      </TouchableOpacity>
    );
  };


  const TrendingStockItem = ({ stock }: { stock: TopMoverStock }) => {
    return (
      <TouchableOpacity
        style={[styles.trendingItem, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}
        onPress={() => handleTrendingPress(stock)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="trending-up" size={18} color={colors.textMuted} />

        <Text style={[styles.trendingText, { color: colors.text }]} numberOfLines={2}>
          {stock.ticker}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, data: TopMoverStock[], section: SectionType) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <TouchableOpacity 
          style={styles.viewAllBtn}
          onPress={() => handleViewAll(section, title)}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stockGrid}>
        {data.slice(0, 4).map((stock) => (
          <StockCard key={stock.ticker} stock={stock} />
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Stocks</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Compare Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/compare/' as any);
            }}
          >
            <Ionicons name="git-compare-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={[styles.themeToggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={16}
              color={colors.primary}
            />

            <Switch
              value={isDark}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTheme();
              }}
              trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
              style={styles.themeSwitch}
            />
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>



      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoadingMovers ? (
          <View style={styles.loadingContainer}>
            <ShimmerGrid count={4} />
          </View>
        ) : moversError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.textMuted }]}>
              {moversError}
            </Text>

            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={fetchTopMovers}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderSection('Top Gainers', topGainers, 'gainers')}
            {renderSection('Top Losers', topLosers, 'losers')}
            {renderSection('Most Active', mostActive, 'active')}
          </>
        )}
      </ScrollView>



      {/* Search Modal */}
      <Modal
        visible={showSearch}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={[styles.searchModal, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.searchInputContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder='Search "Tech stocks" or symbols'
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="characters"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>



          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (

                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    { 
                      backgroundColor: isSelected ? colors.text : 'transparent',
                      borderColor: isSelected ? colors.text : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: isSelected ? colors.background : colors.text }
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}

          </ScrollView>

          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
            {isSearching ? (
              <Text style={[styles.searchingText, { color: colors.textMuted }]}>
                Searching...
              </Text>
            ) : searchQuery.length > 0 && searchResults.length > 0 ? (

              searchResults.map((result) => (
                <TouchableOpacity
                  key={result['1. symbol']}
                  style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSearchResultPress(result)}
                >
                  <View>
                    <Text style={[styles.resultSymbol, { color: colors.text }]}>
                      {result['1. symbol']}
                    </Text>
                    <Text style={[styles.resultName, { color: colors.textMuted }]} numberOfLines={1}>
                      {result['2. name']}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))
            ) : searchQuery.length > 0 ? (
              <Text style={[styles.noResultsText, { color: colors.textMuted }]}>
                No results found
              </Text>
            ) : (
              // Showing the   search history and trending searches when no query
              <>
                {/* Search History */}
                {history.length > 0 && (
                  <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                      <Text style={[styles.trendingTitle, { color: colors.text }]}>
                        Recent Searches
                      </Text>

                      <TouchableOpacity onPress={clearHistory}>
                        <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    {history.slice(0, 5).map((item) => (
                      <TouchableOpacity
                        key={item.symbol}
                        style={[styles.historyItem, { borderBottomColor: colors.border }]}
                        onPress={() => handleHistoryPress(item.symbol, item.name)}
                      >
                        <View style={styles.historyLeft}>
                          <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                          <View style={styles.historyText}>
                            <Text style={[styles.resultSymbol, { color: colors.text }]}>
                              {item.symbol}
                            </Text>
                            <Text style={[styles.resultName, { color: colors.textMuted }]} numberOfLines={1}>
                              {item.name}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity onPress={() => removeFromHistory(item.symbol)}>
                          <Ionicons name="close" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}



                {/* Trending Searches */}
                <Text style={[styles.trendingTitle, { color: colors.text, marginTop: history.length > 0 ? spacing.lg : 0 }]}>
                  Trending Searches
                </Text>
                <View style={styles.trendingGrid}>
                  {getTrendingStocks().map((stock, index) => (
                    <TrendingStockItem key={`${stock.ticker}-${index}`} stock={stock} />
                  ))}
                </View>
              </>
            )}
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    borderRadius: 20,
    height: 32,
  },
  themeSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  searchButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stockCard: {
    width: CARD_WIDTH,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
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
  stockSymbol: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  stockPrice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stockChange: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  errorText: {
    fontSize: fontSize.base,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  retryText: {
    color: '#FFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  
  // Search Modal
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
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  categoryTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
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
  searchingText: {
    padding: spacing.xl,
    textAlign: 'center',
  },
  noResultsText: {
    padding: spacing.xl,
    textAlign: 'center',
  },
  trendingTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    width: (width - spacing.base * 2 - spacing.sm) / 2,
    gap: spacing.sm,
  },
  trendingText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  historySection: {
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clearText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  historyText: {
    flex: 1,
  },
});