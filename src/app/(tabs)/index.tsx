import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewStudySetForm } from '@/components/new-study-set-form';
import { StudySetCard, type StudySet } from '@/components/study-set-card';
import { colors } from '@/constants/theme';

export default function LibraryScreen() {
  const scrollViewRef = useRef<ScrollViewType>(null);

  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateStudySet = (title: string, description: string) => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const newSet: StudySet = {
      id: Date.now().toString(),
      title,
      description,
      updatedAt: `${day}/${month}/${year}`,
    };

    setStudySets((prev) => [newSet, ...prev]);
    setIsFormOpen(false);
    Keyboard.dismiss();
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleDeleteStudySet = (id: string) => {
    setStudySets((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Library</Text>
          </View>

          <Text style={styles.heroText}>
            {'A space for your next\nbreakthrough.'}
          </Text>

          <Text style={styles.sectionSubtitle}>Your study collections</Text>

          <Text style={styles.descriptionText}>
            {'Upload materials, generate summaries,\nflashcards, and chat with your notes.'}
          </Text>

          {isFormOpen ? (
            <NewStudySetForm
              onCreate={handleCreateStudySet}
              onCancel={() => setIsFormOpen(false)}
            />
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleOpenForm}>
              <Text style={styles.primaryButtonText}>New study set</Text>
            </Pressable>
          )}

          <View style={styles.collectionsContainer}>
            {studySets.map((set) => (
              <StudySetCard
                key={set.id}
                studySet={set}
                onDelete={handleDeleteStudySet}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRow: {
    marginBottom: 36,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 32,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#d0d4dc',
    marginTop: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentText,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  collectionsContainer: {
    marginTop: 20,
    minHeight: 40,
  },
});
