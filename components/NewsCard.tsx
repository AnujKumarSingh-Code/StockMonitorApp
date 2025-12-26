import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import type { NewsArticle } from '@/services/alphaApi';



interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const { colors } = useThemeStore();

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bullish':
      case 'somewhat-bullish':
        return colors.success;
      case 'bearish':
      case 'somewhat-bearish':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  const getSentimentIcon = (label: string): keyof typeof Ionicons.glyphMap => {
    switch (label.toLowerCase()) {
      case 'bullish':
      case 'somewhat-bullish':
        return 'trending-up';
      case 'bearish':
      case 'somewhat-bearish':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {

      const year = timestamp.slice(0, 4);
      const month = timestamp.slice(4, 6);
      const day = timestamp.slice(6, 8);
      const hour = timestamp.slice(9, 11);
      const minute = timestamp.slice(11, 13);
      
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return 'Just now';
    } catch {
      return '';
    }
  };


  const handlePress = () => {
    Linking.openURL(article.url);
  };

  const sentimentColor = getSentimentColor(article.overall_sentiment_label);
  const sentimentIcon = getSentimentIcon(article.overall_sentiment_label);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >

      {/* Image */}
      {article.banner_image ? (
        <Image 
          source={{ uri: article.banner_image }} 
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="newspaper-outline" size={24} color={colors.textMuted} />
        </View>
      )}


      {/* Content */}
      <View style={styles.content}>

        {/* Source & Time */}
        <View style={styles.metaRow}>
          <Text style={[styles.source, { color: colors.primary }]} numberOfLines={1}>
            {article.source}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatTimeAgo(article.time_published)}
          </Text>
        </View>


        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {article.title}
        </Text>


        {/* Sentiment */}
        <View style={styles.sentimentRow}>
          <View style={[styles.sentimentBadge, { backgroundColor: sentimentColor + '20' }]}>
            <Ionicons name={sentimentIcon} size={12} color={sentimentColor} />
            <Text style={[styles.sentimentText, { color: sentimentColor }]}>
              {article.overall_sentiment_label.replace('-', ' ')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: {
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  source: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: fontSize.xs,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  sentimentRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  sentimentText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});