import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../../src/theme';
import { useTripsStore, useAuthStore } from '../../src/store';
import { Button } from '../../src/components/common/Button';
import { GlassCard } from '../../src/components/common/GlassCard';
import { tripsApi, tripMembersApi } from '../../src/data';

export default function JoinInviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const ensureUser = useAuthStore(s => s.ensureUser);
  const { joinByCode } = useTripsStore();
  const [status, setStatus] = useState<'loading' | 'found' | 'joined' | 'error'>('loading');
  const [tripName, setTripName] = useState('');

  useEffect(() => {
    if (!user) ensureUser();

    // Look up the invite
    if (code) {
      // Search for the invite code in all members
      const allTrips = tripMembersApi as any;
      // We need a different approach - search through mock data
      setTimeout(() => {
        // Try to join immediately
        const member = joinByCode(code);
        if (member) {
          const trip = tripsApi.getById(member.trip_id);
          setTripName(trip?.destination ?? 'Unknown trip');
          setStatus('joined');
        } else {
          setStatus('error');
        }
      }, 500);
    }
  }, [code]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Joining trip...</Text>
          </View>
        )}

        {status === 'joined' && (
          <View style={styles.center}>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.title}>You're in!</Text>
            <Text style={styles.subtitle}>You've joined the trip to {tripName}</Text>
            <Button
              title="Open Trip"
              onPress={() => router.replace('/')}
              style={{ marginTop: spacing.xl }}
            />
          </View>
        )}

        {status === 'error' && (
          <View style={styles.center}>
            <Text style={styles.emoji}>😕</Text>
            <Text style={styles.title}>Invalid Invite</Text>
            <Text style={styles.subtitle}>
              This invite code is invalid or has already been used.
            </Text>
            <Button
              title="Go Home"
              variant="secondary"
              onPress={() => router.replace('/')}
              style={{ marginTop: spacing.xl }}
            />
          </View>
        )}
      </View>
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
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  center: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
