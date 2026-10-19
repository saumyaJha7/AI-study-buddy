import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { StudySet } from '@/features/study-sets/query';

type StudySetCardProps = {
  studySet: StudySet;
  index?: number;
};

export function StudySetCard({ studySet, index = 0 }: StudySetCardProps) {
  const href = {
    pathname: '/(tabs)/(library)/[studySetId]',
    params: { studySetId: studySet.id },
  } as Href;

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${studySet.title}`}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.accentBar} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <View
                style={[
                  styles.initial,
                  index % 2
                    ? { transform: [{ rotate: '6deg' }] }
                    : { transform: [{ rotate: '-6deg' }] },
                ]}>
                <Text style={styles.initialText}>
                  {studySet.title.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.collection}>
                COLLECTION {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.openCircle}>
              <Text style={styles.openCircleText}>+</Text>
            </View>
          </View>

          <Text style={styles.title}>{studySet.title}</Text>

          {studySet.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {studySet.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.updated}>
              Updated {new Date(studySet.updated_at).toLocaleDateString()}
            </Text>
            <Text style={styles.openLabel}>Open collection →</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pressed: {
    opacity: 0.8,
  },
  accentBar: {
    width: 8,
    backgroundColor: colors.highlight,
  },
  body: {
    flex: 1,
    gap: 14,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initial: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
  },
  initialText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  collection: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: colors.muted,
  },
  openCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  openCircleText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
  title: {
    fontSize: 23,
    fontWeight: '600',
    letterSpacing: -0.4,
    color: colors.foreground,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  updated: {
    fontSize: 12,
    color: colors.muted,
  },
  openLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
