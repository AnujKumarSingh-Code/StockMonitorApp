import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';


import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '@/store/themeStore';
import { useAlphaStore } from '@/store/alphaStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import AdvancedChart from '@/components/AdvancedChart';
import NewsCard from '@/components/NewsCard';
import AddStockToWatchList from '@/components/AddStockToWatchList';
import alphaApi, { NewsArticle } from '@/services/alphaApi';
import { formatPrice, formatLargeNumber, isPositive, getChangeColor } from '@/utils/dummy';
import { spacing, fontSize, borderRadius } from '@/constants/theme';



export default function ProductScreen() {

  const insets = useSafeAreaInsets();
  const { symbol, name, price, change, changePercent } = useLocalSearchParams<{
    symbol: string;
    name: string;
    price?: string;
    change?: string;
    changePercent?: string;
  }>();

  const { colors } = useThemeStore();
  const {
    currentOverview,
    currentQuote,
    isLoadingDetails,
    fetchStockDetails,
    clearDetails,
    topGainers,
    topLosers,
    mostActive,
  } = useAlphaStore();

  const { isStockInAnyWatchlist } = useWatchlistStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);


  // Findind stock data from top movers if available
  const findStockFromMovers = () => {
    const allStocks = [...topGainers, ...topLosers, ...mostActive];
    return allStocks.find((s) => s.ticker === symbol);
  };

  const moverData = findStockFromMovers();

  // Fetch news
  const fetchNews = async () => {
    if (!symbol) return;
    setIsLoadingNews(true);
    try {
      const articles = await alphaApi.getNews(symbol, 5);
      setNews(articles);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };



  useEffect(() => {
    if (symbol) {
      fetchStockDetails(symbol);
      fetchNews();
    }
    return () => clearDetails();
  }, [symbol, fetchStockDetails, clearDetails]);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (symbol) {
      await Promise.all([fetchStockDetails(symbol), fetchNews()]);
    }
    setRefreshing(false);
  }, [symbol, fetchStockDetails]);



  // Use passed data, mover data, or API data (in that priority)
  const displayPrice = price || moverData?.price || (currentQuote?.price ? String(currentQuote.price) : '0');
  const displayChange = change || moverData?.change_amount || (currentQuote?.change ? String(currentQuote.change) : '0');
  const displayChangePercent = changePercent || moverData?.change_percentage || (currentQuote?.changePercent || '0');

  const isInWatchlist = symbol ? isStockInAnyWatchlist(symbol) : false;

  const positive = isPositive(displayChangePercent);

  const changeColor = getChangeColor(displayChangePercent, colors);



  // Info Row Component
  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>

      <Text style={[styles.infoValue, { color: colors.text }]}>
        {value || '--'}
      </Text>

    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>


      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>{symbol}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >


        {/* Symbol & Company Name Section */}
        <View style={styles.titleSection}>

          <View style={styles.titleLeft}>
            <Text style={[styles.symbolTitle, { color: colors.text }]}>{symbol}</Text>
            <Text style={[styles.companyName, { color: colors.textSecondary }]}>
              {currentOverview?.Name || name || symbol}
            </Text>
            {/* Loading indicator */}
            {isLoadingDetails && (
              <View style={styles.loadingBars}>
                <View style={[styles.loadingBar, { backgroundColor: colors.primary }]} />
                <View style={[styles.loadingBar, styles.loadingBarShort, { backgroundColor: colors.primary }]} />
              </View>
            )}
          </View>

          <TouchableOpacity onPress={() => setShowWatchlistModal(true)}>
            <Ionicons
              name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={isInWatchlist ? colors.primary : colors.text}
            />
          </TouchableOpacity>

        </View>



        {/* Chart */}
        <View style={styles.chartSection}>
          <AdvancedChart symbol={symbol || ''} isPositive={positive} />
        </View>


        {/* Description */}
        {currentOverview?.Description && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.description, { color: colors.text }]}>
              {currentOverview.Description}
            </Text>
          </View>
        )}


        {/* No Description Fallback */}
        {!currentOverview?.Description && !isLoadingDetails && (
          <View style={styles.descriptionSection}>
            <Text style={[styles.noDataText, { color: colors.textMuted }]}>
              {currentOverview ? 'No description available' : 'None'}
            </Text>
          </View>
        )}


        {/* News Section */}
        <View style={styles.infoSection}>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest News</Text>
          {isLoadingNews ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : news.length > 0 ? (
            news.map((article, index) => (
              <NewsCard key={index} article={article} />
            ))
          ) : (

            <Text style={[styles.noDataText, { color: colors.textMuted }]}>
              No news available
            </Text>
          )}

        </View>


        {/* Performance Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>

          <InfoRow label="52 Week Low" value={currentOverview?.['52WeekLow']} />
          <InfoRow label="52 Week High" value={currentOverview?.['52WeekHigh']} />
          <InfoRow label="Today's Open" value={currentQuote?.open ? formatPrice(currentQuote.open) : undefined} />
          <InfoRow label="Today's High" value={currentQuote?.high ? formatPrice(currentQuote.high) : undefined} />
          <InfoRow label="Today's Low" value={currentQuote?.low ? formatPrice(currentQuote.low) : undefined} />
          <InfoRow label="Prev Close" value={currentQuote?.previousClose ? formatPrice(currentQuote.previousClose) : undefined} />
        </View>



        {/* Fundamentals Section */}
        <View style={styles.infoSection}>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fundamentals</Text>

          <InfoRow 
            label="Market Cap" 
            value={currentOverview?.MarketCapitalization ? formatLargeNumber(currentOverview.MarketCapitalization) : undefined} 
          />

          <InfoRow label="P/E Ratio (TTM)" value={currentOverview?.PERatio || 'None'} />

          <InfoRow 
            label="P/B Ratio" 
            value={currentOverview?.BookValue ? parseFloat(currentOverview.BookValue).toFixed(2) : '-'} 
          />

          <InfoRow 
            label="ROE" 
            value={currentOverview?.ReturnOnEquityTTM ? parseFloat(currentOverview.ReturnOnEquityTTM).toFixed(3) : undefined} 
          />

          <InfoRow label="EPS (TTM)" value={currentOverview?.EPS || 'None'} />

          <InfoRow 
            label="Dividend Yield" 
            value={currentOverview?.DividendYield && currentOverview.DividendYield !== '0' 
              ? `${(parseFloat(currentOverview.DividendYield) * 100).toFixed(2)}%` 
              : undefined
            } 
          />
          <InfoRow label="Beta" value={currentOverview?.Beta} />
        </View>
      </ScrollView>

      

      {/* Watchlist Modal */}
      <Modal
        visible={showWatchlistModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWatchlistModal(false)}
      >
        <AddStockToWatchList
          stock={{
            symbol: symbol || '',
            name: currentOverview?.Name || name || symbol || '',
            addedAt: new Date().toISOString(),
          }}
          onClose={() => setShowWatchlistModal(false)}
        />
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
  content: {
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  titleLeft: {
    flex: 1,
  },
  symbolTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
  },
  companyName: {
    fontSize: fontSize.base,
    marginTop: spacing.xs,
  },
  loadingBars: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  loadingBar: {
    height: 4,
    width: 20,
    borderRadius: 2,
  },
  loadingBarShort: {
    width: 12,
  },
  chartSection: {
    paddingHorizontal: spacing.base,
    marginVertical: spacing.md,
  },
  descriptionSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'justify',
  },
  noDataText: {
    fontSize: fontSize.base,
  },
  infoSection: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: fontSize.base,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
});