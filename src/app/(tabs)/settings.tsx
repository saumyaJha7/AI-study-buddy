import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeading } from '@/components/screen-heading';
import { ActionButton, QueryFeedback } from '@/components/study-ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signOut();
      if (result.error) {
        setError(result.error);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause
          : new Error('Unable to sign out. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <ScreenHeading
          eyebrow="ACCOUNT"
          title="Your study space."
          description="A little space to make learning your own."
        />

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Signed in as</Text>
          <Text selectable style={styles.cardEmail}>
            {user?.email ?? 'Not signed in'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Study Buddy</Text>
          <Text style={styles.cardBody}>
            Your materials, made easier to understand. Build study sets, explore
            summaries, practice flashcards, and ask questions grounded in your
            notes.
          </Text>
        </View>

        <QueryFeedback error={error} />

        <ActionButton
          title="Sign out"
          loading={loading}
          onPress={handleSignOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  cardEmail: {
    fontSize: 16,
    color: colors.foreground,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.muted,
  },
});
