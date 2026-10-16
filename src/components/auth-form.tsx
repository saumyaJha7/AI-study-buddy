import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.session) {
          // Immediately signed in (if email confirmation is turned off in Supabase)
          setInfoMessage('Account created and signed in successfully!');
        } else if (data.user) {
          // Email confirmation is required
          setInfoMessage(
            'Account created! If email confirmation is enabled on your Supabase project, check your inbox to confirm your account.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.icon}>🎓</Text>
          <Text style={styles.title}>
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Sign up to start learning with your AI Study Buddy'
              : 'Sign in to access your study materials'}
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {infoMessage ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{infoMessage}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          disabled={loading}
          onPress={handleSubmit}>
          {loading ? (
            <ActivityIndicator color="#151618" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </Pressable>

        <View style={styles.toggleRow}>
          <Text style={styles.togglePrompt}>
            {isSignUp
              ? 'Already have an account?'
              : "Don't have an account yet?"}
          </Text>
          <Pressable
            onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
              setInfoMessage(null);
            }}>
            <Text style={styles.toggleLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  input: {
    backgroundColor: '#14161a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2e35',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#F5C29E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#151618',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  togglePrompt: {
    color: '#94a3b8',
    fontSize: 14,
  },
  toggleLink: {
    color: '#F5C29E',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#451a1a',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    color: '#a7f3d0',
    fontSize: 13,
    lineHeight: 18,
  },
});
