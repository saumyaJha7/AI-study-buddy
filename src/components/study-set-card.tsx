import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

export interface StudySet {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

interface StudySetCardProps {
  studySet: StudySet;
  onDelete: (id: string) => void;
}

export function StudySetCard({ studySet, onDelete }: StudySetCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {studySet.title}
        </Text>
        {studySet.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {studySet.description}
          </Text>
        ) : null}
        <Text style={styles.updated}>Updated {studySet.updatedAt}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${studySet.title}`}
        hitSlop={12}
        onPress={() => onDelete(studySet.id)}
        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}>
        <Feather name="trash-2" size={16} color="#64748b" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  updated: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 6,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
});
