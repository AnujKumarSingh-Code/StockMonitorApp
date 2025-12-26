import { View, StyleSheet } from 'react-native';
import Shimmer from './Shimmer';
import { useThemeStore } from '@/store/themeStore';
import { spacing, borderRadius } from '@/constants/theme';


export default function ShimmerProduct() {
  const { colors } = useThemeStore();

  return (

    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Price Section */}
      <View style={styles.priceSection}>
        <Shimmer width={180} height={40} />

        <View style={styles.changeRow}>
          <Shimmer width={100} height={30} borderRadius={borderRadius.md} />
          <Shimmer width={80} height={24} />
        </View>

      </View>

      {/* Chart Section */}
      <Shimmer height={220} style={styles.chart} />


      {/* Range Buttons */}
      <View style={styles.rangeRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} width={45} height={36} borderRadius={borderRadius.md} />
        ))}
      </View>

      {/* Action Button */}
      <Shimmer height={50} borderRadius={borderRadius.lg} style={styles.action} />

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <Shimmer width={120} height={24} style={styles.sectionTitle} />

        <View style={[styles.statsGrid, { backgroundColor: colors.card }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.statItem}>
              <Shimmer width={60} height={16} />
              <Shimmer width={80} height={20} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>

      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>

        <Shimmer width={150} height={24} style={styles.sectionTitle} />

        <Shimmer height={80} style={styles.description} />

        <View style={[styles.keyStats, { backgroundColor: colors.card }]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.keyStatRow}>
              <Shimmer width={100} height={16} />
              <Shimmer width={80} height={16} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.base,
  },
  priceSection: {
    marginBottom: spacing.xl,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  chart: {
    marginBottom: spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  action: {
    marginBottom: spacing.xl,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  statItem: {
    width: '45%',
  },
  aboutSection: {
    marginBottom: spacing.xl,
  },
  description: {
    marginBottom: spacing.lg,
  },
  keyStats: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  keyStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
});
