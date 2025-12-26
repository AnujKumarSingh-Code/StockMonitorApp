import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Switch,
  Platform,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import AddWatchlistModal from '@/components/AddWatchlistModal';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import type { Watchlist } from '@/types/database';


const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 85;

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useThemeStore();
  const { watchlists, deleteWatchlist } = useWatchlistStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredWatchlists = watchlists.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())

  );


  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };



  const handleWatchlistPress = (watchlist: Watchlist) => {
    if (isDeleteMode) {
      toggleSelection(watchlist.id);
    } else {
      router.push({
        pathname: '/watchlist/[id]' as any,
        params: { id: watchlist.id, name: watchlist.name },
      });
    }
  };



  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Selection', 'Please select watchlists to delete');
      return;
    }

    Alert.alert(
      'Delete Watchlists',
      `Are you sure you want to delete ${selectedIds.size} watchlist(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => deleteWatchlist(id));
            setSelectedIds(new Set());
            setIsDeleteMode(false);
          },
        },
      ]
    );
  };



  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      // Exiting delete mode
      setSelectedIds(new Set());
    }
    setIsDeleteMode(!isDeleteMode);
  };

  const renderWatchlist = ({ item }: { item: Watchlist }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.watchlistItem, { 
          backgroundColor: colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        }]}
        onPress={() => handleWatchlistPress(item)}
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

        <Text style={[styles.watchlistName, { color: colors.text, flex: 1 }]}>
          {item.name}
        </Text>
        {!isDeleteMode && (
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
        )}

      </TouchableOpacity>
    );
  };



  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Watchlists</Text>
      <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
        Tap + to create your first watchlist
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>


      {/* Header  */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Watchlist</Text>
        </View>
        <View style={styles.headerRight}>


          {/* Theme Toggle   */}
          <View style={[styles.themeToggleContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={16}
              color={colors.primary}
            />
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
              style={styles.themeSwitch}
            />
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Row   */}
      <View style={styles.titleRow}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Watchlist</Text>
        <View style={styles.titleActions}>
          {isDeleteMode ? (
            <>
              <TouchableOpacity 
                style={[styles.deleteButton, { backgroundColor: colors.danger }]}
                onPress={handleDeleteSelected}
              >
                <Text style={styles.deleteButtonText}>
                  Delete ({selectedIds.size})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={toggleDeleteMode}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </>
          ) : (
            <>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={toggleDeleteMode}
              >
                <Ionicons name="trash-outline" size={22} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={26} color={colors.text} />
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
            placeholder="Search watch list..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>



      {/* List */}

      {filteredWatchlists.length > 0 ? (
        <FlatList
          data={filteredWatchlists}
          renderItem={renderWatchlist}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.base,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}


      {/* Create Modal */}
      
      <AddWatchlistModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
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
  iconButton: {
    padding: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  pageTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    marginBottom: spacing.md,
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
  watchlistItem: {
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
  watchlistName: {
    fontSize: fontSize.md,
    fontWeight: '600',
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
  },
});