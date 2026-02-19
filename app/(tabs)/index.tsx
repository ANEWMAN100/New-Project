import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
  RefreshControl, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, gradients, shadows, HERO_IMAGES } from '../../src/theme';
import { useTripsStore, useAuthStore } from '../../src/store';
import { GlassCard } from '../../src/components/common/GlassCard';
import { Button } from '../../src/components/common/Button';
import { AvatarGroup } from '../../src/components/common/Avatar';
import { EmptyState } from '../../src/components/common/EmptyState';
import { formatDateRange, isUpcoming } from '../../src/utils/dates';
import { profilesApi } from '../../src/data';
import type { Trip, TripMember } from '../../src/types';
import { tripMembersApi } from '../../src/data';

export default function TripsScreen() {
  const router = useRouter();
  const { trips, loadTrips, setCurrentTrip } = useTripsStore();
  const user = useAuthStore(s => s.user);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips();
    setRefreshing(false);
  }, []);

  const upcomingTrips = trips.filter(t => isUpcoming(t.start_date));
  const pastTrips = trips.filter(t => !isUpcoming(t.start_date));

  function openTrip(trip: Trip) {
    setCurrentTrip(trip.id);
    router.push(`/trip/${trip.id}`);
  }

  function getMemberNames(tripId: string): { name: string; avatar_url: string | null }[] {
    const members = tripMembersApi.getForTrip(tripId)
      .filter(m => m.status === 'active');
    return members.map(m => {
      if (m.user_id) {
        const profile = profilesApi.getById(m.user_id);
        return { name: profile?.name ?? 'User', avatar_url: profile?.avatar_url ?? null };
      }
      return { name: m.invited_email ?? 'Invited', avatar_url: null };
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hey, ${user.name.split(' ')[0]}` : 'Welcome'}
            </Text>
            <Text style={styles.title}>Your Trips</Text>
          </View>
          <Button
            title="+ New Trip"
            onPress={() => router.push('/trip/new')}
            size="sm"
          />
        </View>

        {trips.length === 0 && (
          <EmptyState
            icon="🌍"
            title="No trips yet"
            subtitle="Create your first trip and start planning an unforgettable adventure."
            actionLabel="Create Trip"
            onAction={() => router.push('/trip/new')}
          />
        )}

        {/* Upcoming */}
        {upcomingTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                members={getMemberNames(trip.id)}
                onPress={() => openTrip(trip)}
              />
            ))}
          </View>
        )}

        {/* Past */}
        {pastTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Trips</Text>
            {pastTrips.map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                members={getMemberNames(trip.id)}
                onPress={() => openTrip(trip)}
                isPast
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TripCard({
  trip, members, onPress, isPast,
}: {
  trip: Trip;
  members: { name: string; avatar_url: string | null }[];
  onPress: () => void;
  isPast?: boolean;
}) {
  const heroImage = HERO_IMAGES[trip.hero_image_key] ?? HERO_IMAGES.default;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <GlassCard style={[styles.tripCard, isPast ? styles.tripCardPast : undefined]} padded={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: heroImage.uri }} style={styles.heroImage} />
          <LinearGradient
            colors={gradients.hero}
            style={styles.heroOverlay}
          />
          <View style={styles.heroContent}>
            <Text style={styles.tripDestination}>{trip.destination}</Text>
            <Text style={styles.tripDates}>{formatDateRange(trip.start_date, trip.end_date)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.tripFooter}>
          <AvatarGroup members={members} size={28} />
          <View style={styles.vibeRow}>
            {trip.vibe_tags.slice(0, 3).map(tag => (
              <View key={tag} style={[styles.vibeDot, { backgroundColor: colors.vibeColors[tag] ?? colors.primary }]} />
            ))}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
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
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
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
  tripCard: {
    marginBottom: spacing.lg,
    ...(shadows.md as any),
  },
  tripCardPast: {
    opacity: 0.7,
  },
  heroContainer: {
    height: 160,
    overflow: 'hidden',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
  },
  tripDestination: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  tripDates: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  vibeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  vibeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
