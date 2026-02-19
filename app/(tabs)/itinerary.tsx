import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors, typography, spacing, radius, gradients,
  PERIODS, PERIOD_LABELS,
} from '../../src/theme';
import {
  useItineraryStore, useTripsStore, useBoardStore,
} from '../../src/store';
import { GlassCard } from '../../src/components/common/GlassCard';
import { Button } from '../../src/components/common/Button';
import { BottomSheet } from '../../src/components/common/BottomSheet';
import { EmptyState } from '../../src/components/common/EmptyState';
import { getDaysBetween, getDayLabel, formatDateShort } from '../../src/utils/dates';
import type { Period, TripItem, ItinerarySlot } from '../../src/types';

export default function ItineraryScreen() {
  const currentTripId = useTripsStore(s => s.currentTripId);
  const currentTrip = useTripsStore(s => s.getCurrentTrip());
  const { slots, loadSlots, ensureSlot, addItemToSlot, removeItemFromSlot, getSlotItems } = useItineraryStore();
  const { items: boardItems, loadItems: loadBoardItems } = useBoardStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addToSlot, setAddToSlot] = useState<{ date: string; period: Period } | null>(null);

  const days = useMemo(() => {
    if (!currentTrip) return [];
    return getDaysBetween(currentTrip.start_date, currentTrip.end_date);
  }, [currentTrip?.start_date, currentTrip?.end_date]);

  useEffect(() => {
    if (currentTripId) {
      loadSlots(currentTripId);
      loadBoardItems(currentTripId);
    }
  }, [currentTripId]);

  useEffect(() => {
    if (days.length > 0 && !selectedDate) {
      setSelectedDate(days[0]);
    }
  }, [days]);

  if (!currentTripId || !currentTrip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="📅"
          title="Select a trip first"
          subtitle="Open a trip from the Trips tab to plan your itinerary."
        />
      </SafeAreaView>
    );
  }

  const scheduledItemIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots) {
      const slotItems = getSlotItems(slot.id);
      slotItems.forEach(si => ids.add(si.trip_item_id));
    }
    return ids;
  }, [slots]);

  const unscheduledItems = boardItems.filter(i => !scheduledItemIds.has(i.id));

  function handleAddFromBoard(item: TripItem, date: string, period: Period) {
    const slot = ensureSlot(currentTripId!, date, period);
    addItemToSlot(slot.id, item.id);
    setAddToSlot(null);
  }

  function getSlotForDatePeriod(date: string, period: Period): ItinerarySlot | undefined {
    return slots.find(s => s.slot_date === date && s.period === period);
  }

  const periodGradients: Record<string, [string, string]> = {
    morning: gradients.morning,
    afternoon: gradients.afternoon,
    evening: gradients.evening,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>{currentTrip.destination}</Text>
          <Text style={styles.headerTitle}>Itinerary</Text>
        </View>
      </View>

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelector}
        style={styles.daySelectorScroll}
      >
        {days.map(day => {
          const isSelected = day === selectedDate;
          return (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, isSelected && styles.dayChipSelected]}
              onPress={() => setSelectedDate(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayChipLabel, isSelected && styles.dayChipLabelSelected]}>
                {getDayLabel(currentTrip.start_date, day)}
              </Text>
              <Text style={[styles.dayChipDate, isSelected && styles.dayChipDateSelected]}>
                {formatDateShort(day)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Periods */}
      <ScrollView style={styles.periodsScroll} showsVerticalScrollIndicator={false}>
        {selectedDate && PERIODS.map(period => {
          const slot = getSlotForDatePeriod(selectedDate, period);
          const slotItems = slot ? getSlotItems(slot.id) : [];

          return (
            <View key={period} style={styles.periodSection}>
              <LinearGradient
                colors={periodGradients[period]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.periodBadge}
              >
                <Text style={styles.periodLabel}>{PERIOD_LABELS[period]}</Text>
              </LinearGradient>

              <View style={styles.periodItems}>
                {slotItems.map((si, idx) => {
                  const tripItem = si.tripItem;
                  if (!tripItem) return null;
                  const typeColor = colors.itemTypes[tripItem.item_type] ?? colors.primary;
                  return (
                    <GlassCard key={si.id} style={styles.itineraryItem}>
                      <View style={styles.itineraryItemRow}>
                        <View style={[styles.itemDot, { backgroundColor: typeColor }]} />
                        <View style={styles.itineraryItemContent}>
                          <Text style={styles.itineraryItemTitle}>{tripItem.title}</Text>
                          <View style={styles.itineraryItemMeta}>
                            <Text style={styles.itineraryItemType}>{tripItem.item_type}</Text>
                            {tripItem.est_minutes && (
                              <Text style={styles.itineraryItemDuration}>{tripItem.est_minutes}min</Text>
                            )}
                          </View>
                          {tripItem.notes ? (
                            <Text style={styles.itineraryItemNotes} numberOfLines={1}>
                              {tripItem.notes}
                            </Text>
                          ) : null}
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            const doRemove = () => removeItemFromSlot(si.id);
                            if (Platform.OS === 'web') {
                              if (confirm('Remove from itinerary?')) doRemove();
                            } else {
                              Alert.alert('Remove', 'Remove from itinerary?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Remove', style: 'destructive', onPress: doRemove },
                              ]);
                            }
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={styles.removeBtn}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  );
                })}

                <TouchableOpacity
                  style={styles.addFromBoard}
                  onPress={() => setAddToSlot({ date: selectedDate, period })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addFromBoardText}>+ Add from Board</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Add from Board sheet */}
      {addToSlot && (
        <BottomSheet
          visible={!!addToSlot}
          onClose={() => setAddToSlot(null)}
          title="Add from Board"
        >
          {unscheduledItems.length === 0 ? (
            <Text style={styles.noItems}>No unscheduled items on the board.</Text>
          ) : (
            unscheduledItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.boardPickItem}
                onPress={() => handleAddFromBoard(item, addToSlot.date, addToSlot.period)}
              >
                <View style={[styles.pickDot, { backgroundColor: colors.itemTypes[item.item_type] ?? colors.primary }]} />
                <View style={styles.pickContent}>
                  <Text style={styles.pickTitle}>{item.title}</Text>
                  <Text style={styles.pickType}>{item.item_type}</Text>
                </View>
                <Text style={styles.pickAdd}>+</Text>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: spacing.xl }} />
        </BottomSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
  daySelectorScroll: {
    flexGrow: 0,
  },
  daySelector: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  dayChipLabelSelected: {
    color: colors.textPrimary,
  },
  dayChipDate: {
    ...typography.small,
    color: colors.textTertiary,
  },
  dayChipDateSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  periodsScroll: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  periodSection: {
    marginBottom: spacing.xl,
  },
  periodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  periodLabel: {
    ...typography.captionBold,
    color: '#fff',
  },
  periodItems: {
    gap: spacing.sm,
  },
  itineraryItem: {
    padding: spacing.md,
  },
  itineraryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  itineraryItemContent: {
    flex: 1,
  },
  itineraryItemTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  itineraryItemMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 2,
  },
  itineraryItemType: {
    ...typography.small,
    color: colors.textTertiary,
  },
  itineraryItemDuration: {
    ...typography.small,
    color: colors.textTertiary,
  },
  itineraryItemNotes: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  removeBtn: {
    fontSize: 20,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  addFromBoard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addFromBoardText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  noItems: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  boardPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  pickDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pickContent: {
    flex: 1,
  },
  pickTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  pickType: {
    ...typography.small,
    color: colors.textTertiary,
  },
  pickAdd: {
    ...typography.h3,
    color: colors.primary,
  },
});
