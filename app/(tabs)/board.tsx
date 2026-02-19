import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, BOARD_COLUMNS, ITEM_TYPES } from '../../src/theme';
import { useBoardStore, useTripsStore, useAuthStore } from '../../src/store';
import { GlassCard } from '../../src/components/common/GlassCard';
import { Button } from '../../src/components/common/Button';
import { BottomSheet } from '../../src/components/common/BottomSheet';
import { Input } from '../../src/components/common/Input';
import { Chip } from '../../src/components/common/Chip';
import { EmptyState } from '../../src/components/common/EmptyState';
import type { BoardColumn, ItemType, TripItem } from '../../src/types';

export default function BoardScreen() {
  const currentTripId = useTripsStore(s => s.currentTripId);
  const currentTrip = useTripsStore(s => s.getCurrentTrip());
  const { items, loadItems, addItem, moveItem, deleteItem } = useBoardStore();
  const [showAdd, setShowAdd] = useState(false);
  const [moveSheet, setMoveSheet] = useState<TripItem | null>(null);

  useEffect(() => {
    if (currentTripId) loadItems(currentTripId);
  }, [currentTripId]);

  if (!currentTripId || !currentTrip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="📋"
          title="Select a trip first"
          subtitle="Open a trip from the Trips tab to view its board."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>{currentTrip.destination}</Text>
          <Text style={styles.headerTitle}>Trip Board</Text>
        </View>
        <Button title="+ Add" onPress={() => setShowAdd(true)} size="sm" />
      </View>

      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columnsContainer}
        style={styles.columns}
      >
        {BOARD_COLUMNS.map(col => {
          const colItems = items.filter(i => i.board_column === col.key);
          return (
            <View key={col.key} style={styles.column}>
              <View style={[styles.columnHeader, { borderLeftColor: col.color }]}>
                <Text style={styles.columnTitle}>{col.label}</Text>
                <Text style={styles.columnCount}>{colItems.length}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={styles.columnScroll}>
                {colItems.map(item => (
                  <BoardItemCard
                    key={item.id}
                    item={item}
                    onLongPress={() => setMoveSheet(item)}
                    onDelete={() => {
                      if (Platform.OS === 'web') {
                        if (confirm('Delete this item?')) deleteItem(item.id);
                      } else {
                        Alert.alert('Delete', 'Delete this item?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
                        ]);
                      }
                    }}
                  />
                ))}
                {colItems.length === 0 && (
                  <Text style={styles.emptyCol}>Tap + Add to add items</Text>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Item Sheet */}
      <AddItemSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        tripId={currentTripId}
        onAdd={addItem}
      />

      {/* Move Item Sheet */}
      {moveSheet && (
        <BottomSheet
          visible={!!moveSheet}
          onClose={() => setMoveSheet(null)}
          title={`Move "${moveSheet.title}"`}
        >
          {BOARD_COLUMNS.filter(c => c.key !== moveSheet.board_column).map(col => (
            <TouchableOpacity
              key={col.key}
              style={styles.moveOption}
              onPress={() => {
                moveItem(moveSheet.id, col.key);
                setMoveSheet(null);
              }}
            >
              <View style={[styles.moveColor, { backgroundColor: col.color }]} />
              <Text style={styles.moveText}>{col.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: spacing.xl }} />
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

function BoardItemCard({
  item, onLongPress, onDelete,
}: {
  item: TripItem;
  onLongPress: () => void;
  onDelete: () => void;
}) {
  const typeColor = colors.itemTypes[item.item_type] ?? colors.primary;

  return (
    <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.85} delayLongPress={300}>
      <GlassCard style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '25' }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{item.item_type}</Text>
          </View>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.deleteBtn}>×</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.blurb ? <Text style={styles.itemBlurb} numberOfLines={2}>{item.blurb}</Text> : null}
        <View style={styles.itemMeta}>
          {item.est_minutes && (
            <Text style={styles.metaText}>{item.est_minutes}min</Text>
          )}
          {item.est_cost && (
            <Text style={styles.metaText}>{item.est_cost}</Text>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

function AddItemSheet({
  visible, onClose, tripId, onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  onAdd: (data: any) => void;
}) {
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<ItemType>('Activity');
  const [blurb, setBlurb] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');
  const [estMinutes, setEstMinutes] = useState('');
  const [estCost, setEstCost] = useState('');
  const [column, setColumn] = useState<BoardColumn>('must');

  function handleAdd() {
    if (!title.trim()) return;
    onAdd({
      trip_id: tripId,
      title: title.trim(),
      item_type: itemType,
      blurb: blurb.trim(),
      notes: notes.trim(),
      link: link.trim(),
      est_minutes: estMinutes ? parseInt(estMinutes, 10) : undefined,
      est_cost: estCost.trim() || undefined,
      board_column: column,
    });
    // Reset
    setTitle('');
    setBlurb('');
    setNotes('');
    setLink('');
    setEstMinutes('');
    setEstCost('');
    setColumn('must');
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Item">
      <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g., Eiffel Tower" />

      <Text style={styles.fieldLabel}>Type</Text>
      <View style={styles.chipGrid}>
        {ITEM_TYPES.map(t => (
          <Chip
            key={t}
            label={t}
            selected={itemType === t}
            onPress={() => setItemType(t)}
            color={colors.itemTypes[t]}
          />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Column</Text>
      <View style={styles.chipGrid}>
        {BOARD_COLUMNS.map(c => (
          <Chip
            key={c.key}
            label={c.label}
            selected={column === c.key}
            onPress={() => setColumn(c.key)}
            color={c.color}
          />
        ))}
      </View>

      <Input label="Short Description" value={blurb} onChangeText={setBlurb} placeholder="One-liner..." />
      <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Details..." multiline />
      <Input label="Link" value={link} onChangeText={setLink} placeholder="https://..." keyboardType="url" />

      <View style={styles.rowInputs}>
        <Input
          label="Est. Duration (min)"
          value={estMinutes}
          onChangeText={setEstMinutes}
          placeholder="60"
          keyboardType="numeric"
          containerStyle={{ flex: 1, marginRight: spacing.sm }}
        />
        <Input
          label="Est. Cost"
          value={estCost}
          onChangeText={setEstCost}
          placeholder="$25"
          containerStyle={{ flex: 1 }}
        />
      </View>

      <Button title="Add to Board" onPress={handleAdd} fullWidth disabled={!title.trim()} />
      <View style={{ height: spacing.xl }} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  columns: {
    flex: 1,
  },
  columnsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  column: {
    width: 280,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },
  columnTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  columnCount: {
    ...typography.caption,
    color: colors.textTertiary,
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  columnScroll: {
    flex: 1,
  },
  emptyCol: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  itemCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  deleteBtn: {
    fontSize: 20,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  itemTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemBlurb: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  moveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  moveColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moveText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
