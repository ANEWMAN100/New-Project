import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, HERO_IMAGES } from '../../src/theme';
import { useAuthStore, useTripsStore } from '../../src/store';
import { Avatar } from '../../src/components/common/Avatar';
import { GlassCard } from '../../src/components/common/GlassCard';
import { Button } from '../../src/components/common/Button';
import { formatDateRange, isPast } from '../../src/utils/dates';
import type { Trip } from '../../src/types';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);
  const { trips, loadTrips, setCurrentTrip } = useTripsStore();

  useEffect(() => {
    loadTrips();
  }, []);

  const clonedTrips = trips.filter(t => t.cloned_from_trip_id);
  const pastTrips = trips.filter(t => isPast(t.end_date));

  function openTrip(trip: Trip) {
    setCurrentTrip(trip.id);
    router.push(`/trip/${trip.id}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar name={user?.name ?? 'User'} url={user?.avatar_url} size={72} />
          <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statNumber}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statNumber}>{clonedTrips.length}</Text>
            <Text style={styles.statLabel}>Cloned</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statNumber}>{pastTrips.length}</Text>
            <Text style={styles.statLabel}>Past</Text>
          </GlassCard>
        </View>

        {/* My Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Trips</Text>
          {trips.length === 0 && (
            <Text style={styles.emptyText}>No trips yet.</Text>
          )}
          {trips.map(trip => (
            <TouchableOpacity key={trip.id} onPress={() => openTrip(trip)} activeOpacity={0.8}>
              <GlassCard style={styles.miniCard} padded={false}>
                <Image
                  source={{ uri: (HERO_IMAGES[trip.hero_image_key] ?? HERO_IMAGES.default).uri }}
                  style={styles.miniImage}
                />
                <View style={styles.miniInfo}>
                  <Text style={styles.miniDest}>{trip.destination}</Text>
                  <Text style={styles.miniDates}>{formatDateRange(trip.start_date, trip.end_date)}</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cloned Trips */}
        {clonedTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cloned Trips</Text>
            {clonedTrips.map(trip => (
              <TouchableOpacity key={trip.id} onPress={() => openTrip(trip)} activeOpacity={0.8}>
                <GlassCard style={styles.miniCard} padded={false}>
                  <Image
                    source={{ uri: (HERO_IMAGES[trip.hero_image_key] ?? HERO_IMAGES.default).uri }}
                    style={styles.miniImage}
                  />
                  <View style={styles.miniInfo}>
                    <Text style={styles.miniDest}>{trip.destination}</Text>
                    <Text style={styles.miniDates}>{formatDateRange(trip.start_date, trip.end_date)}</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Button
            title="Sign Out"
            variant="ghost"
            onPress={() => {
              signOut();
              router.replace('/');
            }}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  profileEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  miniCard: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  miniImage: {
    width: 64,
    height: 64,
    resizeMode: 'cover',
  },
  miniInfo: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  miniDest: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  miniDates: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
