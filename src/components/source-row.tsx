import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/theme';
import { deleteSource } from '@/features/sources/actions';
import { sourceKeys, type Source } from '@/features/sources/query';
import { processSource } from '@/lib/api-client';

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SourceRow({
  source,
  studySetId,
  onRetryStart,
}: {
  source: Source;
  studySetId: string;
  onRetryStart?: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteSource(source),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sourceKeys.list(studySetId),
      });
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => processSource(source.id),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: sourceKeys.list(studySetId),
      });
    },
  });

  const confirmDelete = () => {
    Alert.alert(
      'Remove source',
      `"${source.title}" will be removed from this study set.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const retry = () => {
    onRetryStart?.();
    retryMutation.mutate();
  };

  const size = formatFileSize(source.file_size);
  const meta = [
    'PDF',
    size,
    new Date(source.created_at).toLocaleDateString(),
  ]
    .filter(Boolean)
    .join(' · ');

  const canRetry =
    source.status === 'pending' || source.status === 'failed';
  const retrying = retryMutation.isPending;
  const errorMessage =
    retrying ||
    source.status === 'ready' ||
    source.status === 'processing'
      ? null
      : retryMutation.error?.message ?? source.error_message;

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Feather name="file-text" size={18} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {source.title}
        </Text>
        <Text style={styles.meta}>{meta}</Text>

        {errorMessage ? (
          <Text selectable numberOfLines={2} style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}

        {canRetry ? (
          <Pressable
            accessibilityLabel={`Retry processing ${source.title}`}
            accessibilityRole="button"
            accessibilityState={{
              busy: retrying,
              disabled: retrying || deleteMutation.isPending,
            }}
            disabled={retrying || deleteMutation.isPending}
            onPress={retry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
              (retrying || deleteMutation.isPending) && styles.disabled,
            ]}>
            {retrying ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Feather name="refresh-cw" size={13} color={colors.primary} />
            )}
            <Text style={styles.retryLabel}>
              {retrying ? 'Retrying...' : 'Retry processing'}
            </Text>
          </Pressable>
        ) : null}

        {deleteMutation.error ? (
          <Text selectable style={styles.error}>
            {deleteMutation.error.message}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailing}>
        <StatusBadge status={source.status} />
        <Pressable
          accessibilityLabel={`Remove ${source.title}`}
          accessibilityRole="button"
          disabled={deleteMutation.isPending || retrying}
          hitSlop={8}
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
            (deleteMutation.isPending || retrying) && styles.disabled,
          ]}>
          <Feather name="trash-2" size={16} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.highlight,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.foreground,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
  },
  error: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.danger,
  },
  retryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteButton: {
    padding: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
