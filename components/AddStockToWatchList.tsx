import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';


import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { spacing, fontSize, borderRadius } from '@/constants/theme';
import type { Watchlist, WatchlistStock } from '@/types/database';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddStockToWatchListProps {
  stock: WatchlistStock;
  onClose: () => void;
}

export default function AddStockToWatchList({ stock, onClose }: AddStockToWatchListProps) {

  const { colors } = useThemeStore();
  const { watchlists, addStock, createWatchlist } = useWatchlistStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');


  const handleAddToWatchlist = async (watchlist: Watchlist) => {
    await addStock(watchlist.id, stock);
    onClose();
  };


  const handleCreateWatchlist = async () => {
    if (!newWatchlistName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }

    try {
      const newWatchlist = await createWatchlist(newWatchlistName.trim());
      await addStock(newWatchlist.id, stock);
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create watchlist');
    }
  };



  const handleCancel = () => {
    setShowCreate(false);
    setNewWatchlistName('');
    Keyboard.dismiss();
  };


  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { backgroundColor: colors.surface }]}>

              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Add to Watchlist</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>


              {showCreate ? (
                // Create new watchlist form
                <View style={styles.createForm}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Watchlist name"
                    placeholderTextColor={colors.textMuted}
                    value={newWatchlistName}
                    onChangeText={setNewWatchlistName}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCreateWatchlist}
                  />

                  <View style={styles.createButtons}>

                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={handleCancel}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.createButton, { backgroundColor: colors.primary }]}
                      onPress={handleCreateWatchlist}
                    >
                      <Text style={styles.createButtonText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>

                  {/* Watchlist List */}
                  <ScrollView 
                    style={styles.list} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {watchlists.length > 0 ? (
                      watchlists.map((watchlist) => (
                        <TouchableOpacity
                          key={watchlist.id}
                          style={[styles.watchlistItem, { borderBottomColor: colors.border }]}
                          onPress={() => handleAddToWatchlist(watchlist)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.watchlistName, { color: colors.text }]}>
                            {watchlist.name}
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        No watchlists yet. Create one below.
                      </Text>
                    )}
                  </ScrollView>

                  

                  {/* Create New Watchlist Button */}
                  <TouchableOpacity
                    style={[styles.createNewButton, { borderColor: colors.primary }]}
                    onPress={() => setShowCreate(true)}
                  >
                    <Ionicons name="add" size={20} color={colors.primary} />
                    <Text style={[styles.createNewText, { color: colors.primary }]}>
                      Create New Watchlist
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  list: {
    maxHeight: 200,
    flexGrow: 0,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
  },
  watchlistName: {
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    padding: spacing.xl,
    fontSize: fontSize.base,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  createNewText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  createForm: {
    padding: spacing.base,
  },
  input: {
    fontSize: fontSize.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  createButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});