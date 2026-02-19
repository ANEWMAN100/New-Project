import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors, typography, spacing, radius, gradients,
  HERO_IMAGES, VIBE_OPTIONS,
} from '../../src/theme';
import { useTripsStore } from '../../src/store';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { Chip } from '../../src/components/common/Chip';
import { CalendarPicker } from '../../src/components/common/CalendarPicker';
import type { VibeTag } from '../../src/types';

const STEPS = ['Destination', 'Travelers', 'Vibe'];

export default function NewTripScreen() {
  const router = useRouter();
  const { createTrip, inviteByEmail } = useTripsStore();
  const [step, setStep] = useState(0);

  // Step 1: Destination + Dates
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [heroKey, setHeroKey] = useState('default');

  // Step 2: Travelers
  const [travelerCount, setTravelerCount] = useState('2');
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  // Step 3: Vibes
  const [vibes, setVibes] = useState<VibeTag[]>([]);

  function canProceed(): boolean {
    if (step === 0) return !!destination.trim() && !!startDate && !!endDate;
    if (step === 1) return true; // Travelers optional
    if (step === 2) return true; // Vibes optional
    return false;
  }

  function handleNext() {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  }

  function handleCreate() {
    if (!startDate || !endDate) return;

    const trip = createTrip({
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      hero_image_key: heroKey,
      vibe_tags: vibes,
    });

    if (trip) {
      // Send invites
      for (const email of inviteEmails) {
        inviteByEmail(trip.id, email);
      }
      router.replace(`/trip/${trip.id}`);
    }
  }

  function addEmail() {
    const email = emailInput.trim();
    if (email && !inviteEmails.includes(email)) {
      setInviteEmails([...inviteEmails, email]);
      setEmailInput('');
    }
  }

  function removeEmail(email: string) {
    setInviteEmails(inviteEmails.filter(e => e !== email));
  }

  function toggleVibe(v: VibeTag) {
    setVibes(vibes.includes(v) ? vibes.filter(x => x !== v) : [...vibes, v]);
  }

  const heroImages = Object.entries(HERO_IMAGES);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
            <Text style={styles.backText}>{'<'} {step > 0 ? 'Back' : 'Cancel'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.progressItem}>
              <View style={[styles.progressDot, i <= step && styles.progressDotActive]} />
              <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1: Destination + Dates */}
          {step === 0 && (
            <View>
              <Text style={styles.stepTitle}>Where are you headed?</Text>
              <Input
                label="Destination"
                value={destination}
                onChangeText={setDestination}
                placeholder="e.g., Paris, France"
                autoFocus
              />

              <Text style={styles.fieldLabel}>Hero Image</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heroScroll}>
                {heroImages.map(([key, img]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setHeroKey(key)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.heroThumb, heroKey === key && styles.heroThumbSelected]}>
                      <Image source={{ uri: img.uri }} style={styles.heroThumbImage} />
                      <Text style={styles.heroThumbLabel}>{key}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Travel Dates</Text>
              <CalendarPicker
                startDate={startDate}
                endDate={endDate}
                onSelect={(s, e) => {
                  setStartDate(s);
                  setEndDate(e);
                }}
              />
              {startDate && endDate && (
                <Text style={styles.datePreview}>
                  {startDate} → {endDate}
                </Text>
              )}
            </View>
          )}

          {/* Step 2: Travelers + Invites */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Who's coming?</Text>
              <Input
                label="Number of Travelers"
                value={travelerCount}
                onChangeText={setTravelerCount}
                keyboardType="numeric"
                placeholder="2"
              />

              <Text style={styles.fieldLabel}>Invite Collaborators</Text>
              <Text style={styles.fieldHint}>
                Invite friends by email. They can add items and help plan.
              </Text>

              <View style={styles.emailInputRow}>
                <Input
                  value={emailInput}
                  onChangeText={setEmailInput}
                  placeholder="friend@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerStyle={{ flex: 1, marginBottom: 0 }}
                  onSubmitEditing={addEmail}
                />
                <Button title="Add" size="sm" onPress={addEmail} disabled={!emailInput.trim()} />
              </View>

              {inviteEmails.length > 0 && (
                <View style={styles.emailList}>
                  {inviteEmails.map(email => (
                    <View key={email} style={styles.emailChip}>
                      <Text style={styles.emailChipText}>{email}</Text>
                      <TouchableOpacity onPress={() => removeEmail(email)}>
                        <Text style={styles.emailRemove}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.skipHint}>
                You can also invite people later from the trip overview.
              </Text>
            </View>
          )}

          {/* Step 3: Vibes */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>What's the vibe?</Text>
              <Text style={styles.fieldHint}>
                Select the themes that fit your trip. Helps personalize recommendations later.
              </Text>

              <View style={styles.vibeGrid}>
                {VIBE_OPTIONS.map(v => (
                  <Chip
                    key={v}
                    label={v}
                    selected={vibes.includes(v)}
                    onPress={() => toggleVibe(v)}
                    color={colors.vibeColors[v]}
                    style={styles.vibeChip}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <Button
            title={step < 2 ? 'Continue' : 'Create Trip'}
            onPress={handleNext}
            fullWidth
            disabled={!canProceed()}
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.primaryLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  progressItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glassBorder,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  progressLabelActive: {
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  fieldHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  heroScroll: {
    marginBottom: spacing.lg,
  },
  heroThumb: {
    width: 100,
    height: 70,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  heroThumbSelected: {
    borderColor: colors.primary,
  },
  heroThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroThumbLabel: {
    position: 'absolute',
    bottom: 2,
    left: 4,
    ...typography.small,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
  datePreview: {
    ...typography.captionBold,
    color: colors.primaryLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emailInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  emailList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  emailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radius.pill,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  emailChipText: {
    ...typography.caption,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  emailRemove: {
    fontSize: 18,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  skipHint: {
    ...typography.caption,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  vibeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.bgCardSolid,
  },
});
