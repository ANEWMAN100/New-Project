import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radius, spacing } from '../../theme';
import { getMonthMatrix, toISODate } from '../../utils/dates';

interface CalendarPickerProps {
  startDate: string | null;
  endDate: string | null;
  onSelect: (start: string, end: string | null) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarPicker({ startDate, endDate, onSelect }: CalendarPickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const matrix = useMemo(() => getMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function handlePrev() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNext() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function handleDayPress(day: number) {
    const date = toISODate(new Date(viewYear, viewMonth, day));
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onSelect(date, null);
    } else {
      // Set end date
      if (date < startDate) {
        onSelect(date, startDate);
      } else {
        onSelect(startDate, date);
      }
    }
  }

  function isSelected(day: number): boolean {
    const date = toISODate(new Date(viewYear, viewMonth, day));
    return date === startDate || date === endDate;
  }

  function isInRange(day: number): boolean {
    if (!startDate || !endDate) return false;
    const date = toISODate(new Date(viewYear, viewMonth, day));
    return date > startDate && date < endDate;
  }

  function isToday(day: number): boolean {
    return (
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth() &&
      day === today.getDate()
    );
  }

  function isPast(day: number): boolean {
    const date = new Date(viewYear, viewMonth, day);
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayMidnight;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={styles.navBtn}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={handleNext} style={styles.navBtn}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Weekdays */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map(d => (
          <View key={d} style={styles.dayCell}>
            <Text style={styles.weekdayText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Days */}
      {matrix.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day === null) {
              return <View key={di} style={styles.dayCell} />;
            }
            const selected = isSelected(day);
            const inRange = isInRange(day);
            const past = isPast(day);

            return (
              <TouchableOpacity
                key={di}
                style={[
                  styles.dayCell,
                  inRange && styles.inRange,
                  selected && styles.selected,
                ]}
                onPress={() => !past && handleDayPress(day)}
                disabled={past}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayText,
                    past && styles.pastText,
                    isToday(day) && styles.todayText,
                    selected && styles.selectedText,
                    inRange && styles.inRangeText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 42;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  monthLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekdayText: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  dayText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pastText: {
    color: colors.textTertiary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  selected: {
    backgroundColor: colors.primary,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  inRange: {
    backgroundColor: colors.primaryGlow,
    borderRadius: 0,
  },
  inRangeText: {
    color: colors.primaryLight,
  },
});
