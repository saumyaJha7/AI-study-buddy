import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { SourceStatus } from '@/features/sources/query';

const LABELS: Record<SourceStatus, string> = {
  pending: 'Queued',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};

const TONES: Record<SourceStatus, { backgroundColor: string; color: string }> = {
  pending: { backgroundColor: colors.highlight, color: colors.muted },
  processing: { backgroundColor: colors.highlight, color: colors.primary },
  ready: { backgroundColor: colors.highlight, color: colors.primary },
  failed: { backgroundColor: colors.dangerSurface, color: colors.danger },
};

export function StatusBadge({ status }: { status: SourceStatus }) {
  const tone = TONES[status];

  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.label, { color: tone.color }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
