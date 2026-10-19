import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import {
  studySetKeys,
  useLatestSummary,
} from '@/features/study-sets/query';
import { generateSummary } from '@/lib/api-client';

export default function SummaryScreen() {
  const { studySetId } = useLocalSearchParams<{ studySetId: string }>();
  const queryClient = useQueryClient();
  const summary = useLatestSummary(studySetId);
  const sources = useSources(studySetId);
  const ready = sources.data?.some((source) => source.status === 'ready');

  const generate = useMutation({
    mutationFn: () => generateSummary(studySetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: studySetKeys.summary(studySetId),
      });
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Summary' }} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}>
          <ScreenHeading
            eyebrow="READ & UNDERSTAND"
            title="The big picture"
            description="Turn your sources into a focused guide to the key ideas."
          />

          <QueryFeedback
            loading={summary.isLoading}
            error={summary.error ?? sources.error}
            onRetry={() => {
              void summary.refetch();
              void sources.refetch();
            }}
          />

          {!summary.isLoading && !summary.error && !summary.data ? (
            <EmptyState
              title="Your summary starts here"
              description={
                ready
                  ? 'Generate a guide from your processed sources.'
                  : 'Upload and process a PDF source in this study set first.'
              }
            />
          ) : null}

          {summary.data ? (
            <View style={styles.summaryCard}>
              <Text style={styles.generated}>
                Generated{' '}
                {new Date(summary.data.created_at).toLocaleDateString()}
              </Text>
              <StudyText content={summary.data.content} />
            </View>
          ) : null}

          <QueryFeedback error={generate.error} />

          <ActionButton
            title={
              generate.isPending
                ? 'Creating summary...'
                : summary.data
                  ? 'Regenerate summary'
                  : 'Generate summary'
            }
            loading={generate.isPending}
            disabled={!ready || summary.isLoading}
            onPress={() => {
              generate.reset();
              generate.mutate();
            }}
          />

          <Text style={styles.note}>
            AI can make mistakes. Check important details against your sources.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  generated: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.muted,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.muted,
  },
});
