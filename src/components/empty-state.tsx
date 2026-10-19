import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.illustration}>
        <View style={[styles.note, styles.noteBack]} />
        <View style={[styles.note, styles.noteFront]} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  illustration: {
    width: 96,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  note: {
    position: 'absolute',
    width: 56,
    height: 64,
    borderRadius: 12,
  },
  noteBack: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
    transform: [{ rotate: '-14deg' }, { translateX: -8 }],
  },
  noteFront: {
    backgroundColor: colors.primary,
    transform: [{ rotate: '9deg' }, { translateX: 8 }],
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.foreground,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.muted,
  },
});
