import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeading } from '@/components/screen-heading';
import {
  ActionButton,
  QueryFeedback,
  StudyText,
} from '@/components/study-ui';
import { colors } from '@/constants/theme';
import { useSources } from '@/features/sources/query';
import { createConversation } from '@/features/study-sets/actions';
import {
  pickConversation,
  studySetKeys,
  useConversations,
  useMessages,
} from '@/features/study-sets/query';
import { sendChatMessage } from '@/lib/api-client';

export default function ChatScreen() {
  const { studySetId } = useLocalSearchParams<{ studySetId: string }>();
  const queryClient = useQueryClient();
  const conversations = useConversations(studySetId);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const conversationId =
    createdId || pickConversation(conversations.data)?.id || '';
  const messages = useMessages(conversationId);
  const sources = useSources(studySetId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const ready = sources.data?.some((source) => source.status === 'ready');
  const visibleMessages = (messages.data ?? []).filter(
    (message) => message.role !== 'system'
  );
  const loading =
    conversations.isLoading ||
    (!!conversationId && messages.isLoading);
  const error = conversations.error ?? messages.error ?? sources.error;

  const send = useMutation({
    mutationFn: async (text: string) => {
      let id = conversationId;

      if (!id) {
        const conversation = await createConversation(studySetId);
        id = conversation.id;
        setCreatedId(id);
      }

      await sendChatMessage(id, text);
      return id;
    },
    onSuccess: () => setDraft(''),
    onSettled: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      await queryClient.invalidateQueries({
        queryKey: studySetKeys.conversations(studySetId),
      });

      if (data) {
        await queryClient.invalidateQueries({
          queryKey: studySetKeys.messages(data),
        });
      }
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Study chat' }} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messagesContent}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }>
            <ScreenHeading
              eyebrow="THINK IT THROUGH"
              title="A little clarity."
              description="Explore your materials, one question at a time."
            />

            <Text style={styles.intro}>
              Ask questions, untangle a concept, or get a new perspective on
              your sources. AI can make mistakes; check important details.
            </Text>

            <QueryFeedback
              loading={loading}
              error={error}
              onRetry={() => {
                void conversations.refetch();
                if (conversationId) void messages.refetch();
                void sources.refetch();
              }}
            />

            {!loading && !error && !visibleMessages.length ? (
              <EmptyState
                title="Let's work through it"
                description="Try “Explain the main concepts” or “What should I focus on for my exam?”"
              />
            ) : null}

            {visibleMessages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <View
                  key={message.id}
                  style={[
                    styles.message,
                    isUser ? styles.userMessage : styles.assistantMessage,
                  ]}>
                  <Text style={styles.author}>
                    {isUser ? 'You' : 'Study Buddy'}
                  </Text>
                  <StudyText content={message.content} />
                </View>
              );
            })}

            {send.isPending ? (
              <Text
                accessibilityLiveRegion="polite"
                style={styles.thinking}>
                Study Buddy is thinking...
              </Text>
            ) : null}

            <QueryFeedback error={send.error} />
          </ScrollView>

          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Message Study Buddy"
              placeholder="Ask about your materials..."
              placeholderTextColor={colors.muted}
              value={draft}
              onChangeText={setDraft}
              editable={!send.isPending}
              multiline
              maxLength={6000}
              style={styles.input}
            />

            <ActionButton
              title="Send message"
              loading={send.isPending}
              disabled={!draft.trim() || loading || !!error || !ready}
              onPress={() => {
                const text = draft.trim();
                if (text) send.mutate(text);
              }}
            />

            {!sources.isLoading && !ready ? (
              <Text style={styles.helper}>
                Process a source in this study set to start chatting.
              </Text>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  messagesContent: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  message: {
    maxWidth: '92%',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.highlight,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
  },
  author: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.primary,
  },
  thinking: {
    fontSize: 13,
    color: colors.primary,
  },
  composer: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    minHeight: 48,
    maxHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    color: colors.foreground,
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
});
