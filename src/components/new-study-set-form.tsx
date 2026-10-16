import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';

interface NewStudySetFormProps {
  onCreate: (title: string, description: string) => void;
  onCancel: () => void;
}

export function NewStudySetForm({ onCreate, onCancel }: NewStudySetFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed, description.trim());
    setTitle('');
    setDescription('');
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    setTitle('');
    setDescription('');
    onCancel();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>New study set</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        autoFocus
        returnKeyType="next"
      />

      <TextInput
        style={[styles.input, styles.inputDescription]}
        placeholder="Description (optional)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
        returnKeyType="default"
      />

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.buttonPressed,
            !title.trim() && styles.createButtonDisabled,
          ]}
          disabled={!title.trim()}
          onPress={handleCreate}>
          <Text style={styles.createText}>Create</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputDescription: {
    minHeight: 72,
    paddingTop: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.accent,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.45,
  },
  createText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accentText,
  },
  cancelButton: {
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
