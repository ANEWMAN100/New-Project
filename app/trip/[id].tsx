import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
  Alert, Platform, Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors, typography, spacing, radius, gradients, shadows, HERO_IMAGES,
} from '../../src/theme';
import {
  useTripsStore, useAuthStore, useBoardStore, useActivityStore,
} from '../../src/store';
import { GlassCard } from '../../src/components/common/GlassCard';
import { Button } from '../../src/components/common/Button';
import { AvatarGroup } from '../../src/components/common/Avatar';
import { Chip } from '../../src/components/common/Chip';
import { BottomSheet } from '../../src/components/common/BottomSheet';
import { Input } from '../../src/components/common/Input';
import { formatDateRange } from '../../src/utils/dates';
import { profilesApi } from '../../src/data';
import type { TripMember } from '../../src/types';

export default function TripOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const {
    setCurrentTrip, getCurrentTrip, members, loadMembers,
    deleteTrip, leaveTrip, cloneTrip,
    inviteByEmail, createInviteLink,
  } = useTripsStore();
  const { items, loadItems } = useBoardStore();
  const { entries, loadEntries } = useActivityStore();

  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setCurrentTrip(id);
      loadItems(id);
      loadEntries(id);
    }
  }, [id]);

  const trip = getCurrentTrip();

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Loading trip...</Text>
      </SafeAreaView>
    );
  }

  // Re-bind to a const after the guard so TS knows it's non-null
  const currentTrip = trip;
  const heroImage = HERO_IMAGES[currentTrip.hero_image_key] ?? HERO_IMAGES.default;
  const isOwner = currentTrip.owner_id === user?.id;
  const activeMembers = members.filter(m => m.status === 'active');

  function getMemberDisplayNames(): { name: string; avatar_url: string | null }[] {
    return activeMembers.map(m => {
      if (m.user_id) {
        const profile = profilesApi.getById(m.user_id);
        return { name: profile?.name ?? 'User', avatar_url: profile?.avatar_url ?? null };
      }
      return { name: m.invited_email ?? 'Invited', avatar_url: null };
    });
  }

  function handleInviteByEmail() {
    if (!inviteEmail.trim()) return;
    inviteByEmail(currentTrip.id, inviteEmail.trim());
    setInviteEmail('');
    Alert.alert('Invited', `Invitation sent to ${inviteEmail.trim()}`);
  }

  function handleCreateInviteLink() {
    const member = createInviteLink(currentTrip.id);
    const link = `zeitgeist://invite/${member.invite_code}`;
    setInviteLink(link);
  }

  function handleShare() {
    const text = `Join my trip to ${currentTrip.destination}! ${formatDateRange(currentTrip.start_date, currentTrip.end_date)}`;
    if (Platform.OS === 'web') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        alert('Trip info copied to clipboard!');
      }
    } else {
      Share.share({ message: text });
    }
  }

  function handleClone() {
    const cloned = cloneTrip(currentTrip.id);
    if (cloned) {
      if (Platform.OS === 'web') {
        alert('Trip cloned! Check your trips list.');
      } else {
        Alert.alert('Cloned', 'Trip cloned! Check your trips list.');
      }
      router.push(`/trip/${cloned.id}`);
    }
  }

  function handleDelete() {
    const doDelete = () => {
      deleteTrip(currentTrip.id);
      router.replace('/');
    };
    if (Platform.OS === 'web') {
      if (confirm('Delete this trip? This cannot be undone.')) doDelete();
    } else {
      Alert.alert('Delete Trip', 'Delete this trip? This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  }

  function handleLeave() {
    const doLeave = () => {
      leaveTrip(currentTrip.id);
      router.replace('/');
    };
    if (Platform.OS === 'web') {
      if (confirm('Leave this trip?')) doLeave();
    } else {
      Alert.alert('Leave Trip', 'Leave this trip?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: doLeave },
      ]);
    }
  }

  function getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      create_trip: 'created this trip',
      add_item: 'added an item',
      schedule_item: 'scheduled an item',
      invite_member: 'invited a member',
      join_trip: 'joined the trip',
      clone_trip: 'cloned a trip',
    };
    return labels[action] ?? action;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: heroImage.uri }} style={styles.heroImage} />
          <LinearGradient colors={gradients.hero} style={styles.heroOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'} Back</Text>
          </TouchableOpacity>
          <View style={styles.heroContent}>
            <Text style={styles.destination}>{currentTrip.destination}</Text>
            <Text style={styles.dateRange}>{formatDateRange(currentTrip.start_date, currentTrip.end_date)}</Text>
          </View>
        </View>

        {/* Collaborators */}
        <View style={styles.section}>
          <View style={styles.collabRow}>
            <AvatarGroup members={getMemberDisplayNames()} size={36} />
            <Button title="+ Invite" onPress={() => setShowInvite(true)} size="sm" variant="secondary" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleClone}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionLabel}>Clone</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSettings(true)}>
            <Text style={styles.actionIcon}>⚙</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Vibes */}
        {currentTrip.vibe_tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.chipRow}>
              {currentTrip.vibe_tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  selected
                  color={colors.vibeColors[tag]}
                />
              ))}
            </View>
          </View>
        )}

        {/* City Pulse (Placeholder) */}
        <GlassCard style={styles.pulseCard}>
          <Text style={styles.pulseTitle}>City Pulse</Text>
          <Text style={styles.pulseText}>
            Notes and local tips for {currentTrip.destination}. Add your own observations or let the group contribute.
          </Text>
        </GlassCard>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>Board Items</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statNumber}>{activeMembers.length}</Text>
            <Text style={styles.statLabel}>Travelers</Text>
          </GlassCard>
        </View>

        {/* Activity Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {entries.slice(0, 10).map(entry => {
            const actor = entry.actor_id ? profilesApi.getById(entry.actor_id) : null;
            return (
              <View key={entry.id} style={styles.activityRow}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>
                  <Text style={styles.activityActor}>{actor?.name ?? 'Someone'}</Text>
                  {' '}{getActionLabel(entry.action)}
                </Text>
              </View>
            );
          })}
          {entries.length === 0 && (
            <Text style={styles.emptyActivity}>No activity yet. Start adding items!</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Invite Sheet */}
      <BottomSheet visible={showInvite} onClose={() => { setShowInvite(false); setInviteLink(null); }} title="Invite Collaborators">
        <Input
          label="Email"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="friend@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          title="Send Invite"
          onPress={handleInviteByEmail}
          fullWidth
          disabled={!inviteEmail.trim()}
          style={{ marginBottom: spacing.xl }}
        />

        <Text style={styles.orText}>— or —</Text>

        <Button
          title="Generate Invite Link"
          variant="secondary"
          onPress={handleCreateInviteLink}
          fullWidth
          style={{ marginBottom: spacing.md }}
        />

        {inviteLink && (
          <GlassCard style={styles.linkCard}>
            <Text style={styles.linkText} selectable>{inviteLink}</Text>
            <Button
              title="Copy"
              size="sm"
              onPress={() => {
                if (Platform.OS === 'web') {
                  navigator.clipboard?.writeText(inviteLink);
                  alert('Copied!');
                } else {
                  Alert.alert('Copied', 'Invite link copied.');
                }
              }}
            />
          </GlassCard>
        )}

        {/* Current Members */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Members</Text>
        {members.map(m => {
          const profile = m.user_id ? profilesApi.getById(m.user_id) : null;
          return (
            <View key={m.id} style={styles.memberRow}>
              <Text style={styles.memberName}>
                {profile?.name ?? m.invited_email ?? 'Pending'}
              </Text>
              <Text style={styles.memberRole}>{m.role} · {m.status}</Text>
            </View>
          );
        })}
        <View style={{ height: spacing.xl }} />
      </BottomSheet>

      {/* Settings Sheet */}
      <BottomSheet visible={showSettings} onClose={() => setShowSettings(false)} title="Trip Settings">
        {isOwner ? (
          <Button title="Delete Trip" variant="danger" onPress={handleDelete} fullWidth />
        ) : (
          <Button title="Leave Trip" variant="danger" onPress={handleLeave} fullWidth />
        )}
        <View style={{ height: spacing.xl }} />
      </BottomSheet>
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
  loading: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  heroContainer: {
    height: 260,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  backText: {
    ...typography.captionBold,
    color: '#fff',
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  destination: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  dateRange: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  collabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pulseCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  pulseTitle: {
    ...typography.bodyBold,
    color: colors.primaryLight,
    marginBottom: spacing.sm,
  },
  pulseText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
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
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  activityText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  activityActor: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  emptyActivity: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  orText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  linkText: {
    ...typography.caption,
    color: colors.primaryLight,
    flex: 1,
    marginRight: spacing.sm,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  memberName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  memberRole: {
    ...typography.small,
    color: colors.textTertiary,
  },
});
