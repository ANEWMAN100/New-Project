import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../../src/theme';
import { useChatStore, useTripsStore, useAuthStore } from '../../src/store';
import { Avatar } from '../../src/components/common/Avatar';
import { EmptyState } from '../../src/components/common/EmptyState';
import { profilesApi } from '../../src/data';

export default function ChatScreen() {
  const currentTripId = useTripsStore(s => s.currentTripId);
  const currentTrip = useTripsStore(s => s.getCurrentTrip());
  const user = useAuthStore(s => s.user);
  const { messages, loadMessages, sendMessage } = useChatStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentTripId) loadMessages(currentTripId);
  }, [currentTripId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  if (!currentTripId || !currentTrip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="💬"
          title="Select a trip first"
          subtitle="Open a trip to start chatting with your travel crew."
        />
      </SafeAreaView>
    );
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !currentTripId) return;
    sendMessage(currentTripId, trimmed);
    setText('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{currentTrip.destination}</Text>
        <Text style={styles.headerTitle}>Trip Chat</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatArea}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <EmptyState
              icon="💬"
              title="No messages yet"
              subtitle="Start the conversation!"
            />
          )}
          {messages.map(msg => {
            const isOwn = msg.sender_id === user?.id;
            const sender = profilesApi.getById(msg.sender_id);
            return (
              <View key={msg.id} style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
                {!isOwn && (
                  <Avatar name={sender?.name ?? 'User'} size={28} url={sender?.avatar_url} />
                )}
                <View style={[styles.msgBubble, isOwn && styles.msgBubbleOwn]}>
                  {!isOwn && (
                    <Text style={styles.msgSender}>{sender?.name ?? 'User'}</Text>
                  )}
                  <Text style={[styles.msgText, isOwn && styles.msgTextOwn]}>{msg.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
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
  chatArea: {
    flex: 1,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  msgRowOwn: {
    justifyContent: 'flex-end',
  },
  msgBubble: {
    maxWidth: '75%',
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    padding: spacing.md,
  },
  msgBubbleOwn: {
    backgroundColor: colors.primaryDark,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
  },
  msgSender: {
    ...typography.small,
    color: colors.primaryLight,
    marginBottom: 2,
    fontWeight: '600',
  },
  msgText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  msgTextOwn: {
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.bgCardSolid,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendText: {
    ...typography.button,
    color: '#fff',
  },
});
