import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeading } from '@/components/screen-heading';
import { SourceRow } from '@/components/source-row';
import { ActionButton, QueryFeedback } from '@/components/study-ui';
import { colors } from '@/constants/theme';
import { pickAndUploadPdf } from '@/features/sources/actions';
import { sourceKeys, useSources } from '@/features/sources/query';
import { deleteStudySet } from '@/features/study-sets/actions';
import { studySetKeys, useStudySet } from '@/features/study-sets/query';

const STUDY_MODES = [
  {
    title: 'Summary',
    description: 'See the big picture',
  },
  {
    title: 'Flashcards',
    description: 'Make the ideas stick',
  },
  {
    title: 'Study chat',
    description: 'Follow your curiosity',
  },
];

export default function StudySetDetailScreen() {
  const { studySetId } = useLocalSearchParams<{ studySetId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: studySet, isLoading, error, refetch } = useStudySet(studySetId);
  const {
    data: sources,
    isLoading: sourcesLoading,
    error: sourcesError,
    refetch: refetchSources,
    isRefetching: sourcesRefetching,
  } = useSources(studySetId);

  const readyCount =
    sources?.filter((source) => source.status === 'ready').length ?? 0;
  const pendingCount =
    sources?.filter(
      (source) =>
        source.status === 'pending' || source.status === 'processing'
    ).length ?? 0;
  const hasReadySources = readyCount > 0;

  const uploadMutation = useMutation({
    mutationFn: () => pickAndUploadPdf(studySetId),
    onSuccess: async (sourceId) => {
      if (!sourceId) return;

      await queryClient.invalidateQueries({
        queryKey: sourceKeys.list(studySetId),
      });
    },
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: sourceKeys.list(studySetId),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudySet(studySetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studySetKeys.all });
      router.back();
    },
  });

  const confirmDelete = () => {
    if (!studySet) return;

    Alert.alert(
      'Delete study set',
      `"${studySet.title}" and everything inside it will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!studySet) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <View style={styles.feedbackContainer}>
          <QueryFeedback
            error={error ?? new Error('Study set not found')}
            onRetry={() => {
              void refetch();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: studySet.title }} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={() => {
                void refetch();
                void refetchSources();
              }}
              progressBackgroundColor={colors.card}
              refreshing={sourcesRefetching}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}>
          <ScreenHeading
            eyebrow="YOUR COLLECTION"
            title={studySet.title}
            description={
              studySet.description ||
              'A home for your sources, ideas, and next breakthrough.'
            }
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your study mode</Text>

            <View style={styles.modeGrid}>
              {STUDY_MODES.map((mode) => (
                <View key={mode.title} style={styles.modeCard}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>
                    {mode.description}
                  </Text>
                  <Text style={styles.modeLocked}>Coming next</Text>
                </View>
              ))}
            </View>

            <Text style={styles.helper}>
              {hasReadySources
                ? `${readyCount} processed ${
                    readyCount === 1 ? 'source' : 'sources'
                  } ready to study.`
                : pendingCount > 0
                  ? 'Your PDF is queued for processing.'
                  : 'Upload a PDF to unlock these tools.'}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sourcesHeader}>
              <Text style={styles.sectionTitle}>Sources</Text>
              {sources?.length ? (
                <Text style={styles.sourceCount}>{sources.length}</Text>
              ) : null}
            </View>

            <ActionButton
              title="Upload PDF"
              loading={uploadMutation.isPending}
              onPress={() => {
                uploadMutation.reset();
                uploadMutation.mutate();
              }}
            />

            <Text style={styles.helper}>PDF only, up to 20 MB.</Text>

            <QueryFeedback error={uploadMutation.error} />
            <QueryFeedback
              loading={sourcesLoading}
              error={sourcesError}
              onRetry={() => {
                void refetchSources();
              }}
            />

            {!sourcesLoading && !sourcesError ? (
              sources && sources.length > 0 ? (
                <View style={styles.sourceList}>
                  {sources.map((source) => (
                    <SourceRow
                      key={source.id}
                      source={source}
                      studySetId={studySetId}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState
                  title="No sources yet"
                  description="Upload a PDF to build your study material."
                />
              )
            ) : null}

            {pendingCount > 0 ? (
              <Text style={styles.note}>
                Processing will run once the study server is connected.
              </Text>
            ) : null}
          </View>

          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text style={styles.metaValue}>
                {new Date(studySet.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Updated</Text>
              <Text style={styles.metaValue}>
                {new Date(studySet.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <QueryFeedback error={deleteMutation.error} />

          <ActionButton
            destructive
            title="Delete study set"
            loading={deleteMutation.isPending}
            onPress={confirmDelete}
          />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sourceCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  sourceList: {
    gap: 8,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeCard: {
    minWidth: '45%',
    flex: 1,
    gap: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.highlight,
    paddingHorizontal: 20,
    paddingVertical: 20,
    opacity: 0.55,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  modeDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  modeLocked: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.muted,
  },
  helper: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  metaCard: {
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
});
