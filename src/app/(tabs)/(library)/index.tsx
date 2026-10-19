import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeading } from '@/components/screen-heading';
import { QueryFeedback } from '@/components/study-ui';
import { StudySetCard } from '@/components/study-set-card';
import { colors } from '@/constants/theme';
import { createStudySet } from '@/features/study-sets/actions';
import { studySetKeys, useStudySets } from '@/features/study-sets/query';

export default function LibraryScreen() {
  const queryClient = useQueryClient();
  const { data: studySets, isLoading, error, refetch, isRefetching } =
    useStudySets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const descriptionInputRef = useRef<TextInput>(null);

  const createMutation = useMutation({
    mutationFn: () => createStudySet(title, description),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studySetKeys.all });
      setTitle('');
      setDescription('');
      setShowForm(false);
      Keyboard.dismiss();
    },
  });

  const listHeader = (
    <View style={styles.headerBlock}>
      <ScreenHeading
        introduction
        eyebrow="MAKE ROOM FOR YOUR NEXT IDEA"
        title={'A curious mind.\nA world to discover.'}
        description="Gather your materials. Find the key ideas. Make what you learn stay with you."
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Your collections</Text>
        <Text style={styles.countText}>
          {studySets?.length ?? 0} study sets
        </Text>
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New study set</Text>

          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            editable={!createMutation.isPending}
            returnKeyType="next"
            onSubmitEditing={() => descriptionInputRef.current?.focus()}
          />

          <TextInput
            ref={descriptionInputRef}
            style={[styles.input, styles.inputDescription]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            editable={!createMutation.isPending}
            multiline
            textAlignVertical="top"
          />

          {createMutation.error ? (
            <Text selectable style={styles.errorText}>
              {createMutation.error.message}
            </Text>
          ) : null}

          <View style={styles.formActions}>
            <Pressable
              accessibilityRole="button"
              disabled={!title.trim() || createMutation.isPending}
              onPress={() => createMutation.mutate()}
              style={({ pressed }) => [
                styles.createButton,
                pressed && styles.buttonPressed,
                (!title.trim() || createMutation.isPending) &&
                  styles.buttonDisabled,
              ]}>
              {createMutation.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={styles.createText}>Create</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={createMutation.isPending}
              onPress={() => {
                setTitle('');
                setDescription('');
                createMutation.reset();
                setShowForm(false);
              }}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowForm(true)}
          style={({ pressed }) => [
            styles.newSetButton,
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.newSetText}>Start a new collection</Text>
          <Text style={styles.newSetArrow}>→</Text>
        </Pressable>
      )}
    </View>
  );

  const emptyComponent =
    isLoading || error ? (
      <QueryFeedback
        loading={isLoading}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    ) : (
      <EmptyState
        title="No study sets yet"
        description="Create your first study set, then add a PDF or link to get started."
      />
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={studySets ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyComponent}
          renderItem={({ item, index }) => (
            <StudySetCard studySet={item} index={index} />
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  listContent: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerBlock: {
    gap: 16,
    paddingBottom: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
  },
  countText: {
    fontSize: 14,
    color: colors.muted,
  },
  formCard: {
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 4,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.foreground,
  },
  inputDescription: {
    minHeight: 80,
    paddingTop: 14,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  createButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  createText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 15,
    color: colors.foreground,
  },
  newSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  newSetText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryForeground,
  },
  newSetArrow: {
    fontSize: 24,
    color: colors.primaryForeground,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
