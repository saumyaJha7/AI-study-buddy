import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
};

export function ActionButton({
  title,
  onPress,
  disabled,
  loading,
  destructive = false,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        destructive ? styles.buttonDestructive : styles.buttonPrimary,
        pressed && styles.buttonPressed,
        (disabled || loading) && styles.buttonDisabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.primaryForeground} />
      ) : (
        <Text
          style={[
            styles.label,
            destructive ? styles.labelDestructive : styles.labelPrimary,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

type QueryFeedbackProps = {
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

export function QueryFeedback({ loading, error, onRetry }: QueryFeedbackProps) {
  if (loading) {
    return (
      <View style={styles.feedback}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.feedbackText}>Loading your study material...</Text>
      </View>
    );
  }

  if (!error) return null;

  return (
    <View accessibilityLiveRegion="polite" style={styles.errorCard}>
      <Text selectable style={styles.errorText}>
        {error.message}
      </Text>
      {onRetry ? <ActionButton title="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonDestructive: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelPrimary: {
    color: colors.primaryForeground,
  },
  labelDestructive: {
    color: colors.danger,
  },
  feedback: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  feedbackText: {
    color: colors.muted,
  },
  errorCard: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.danger,
  },
});
