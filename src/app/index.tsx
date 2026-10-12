import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/context/auth-context';

const FEATURES = [
  {
    id: 'ai-tutor',
    icon: '🤖',
    title: 'Ask AI Tutor',
    description: 'Break down complex concepts and get instant step-by-step answers.',
  },
  {
    id: 'flashcards',
    icon: '📇',
    title: 'Flashcards & Decks',
    description: 'Create and review smart flashcards powered by spaced repetition.',
  },
  {
    id: 'notes',
    icon: '📝',
    title: 'Study Notes',
    description: 'Organize your subjects, upload documents, and generate summaries.',
  },
  {
    id: 'quiz',
    icon: '⚡',
    title: 'Practice Quizzes',
    description: 'Test your understanding with AI-generated practice questions.',
  },
];

export default function HomeScreen() {
  const { session, user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Connecting to Supabase Auth...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not authenticated, render the Auth Form
  if (!session || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="handled">
          <AuthForm />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authenticated State: AI Study Buddy Dashboard
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Top User Bar */}
        <View style={styles.userBar}>
          <View style={styles.userInfo}>
            <View style={styles.statusDot} />
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.signOutButtonPressed,
            ]}
            onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Study Buddy</Text>
          <Text style={styles.subtitle}>
            Your intelligent personal companion for smarter, faster learning.
          </Text>
        </View>

        {/* User Account Info Card */}
        <View style={styles.accountCard}>
          <Text style={styles.accountCardTitle}>Authenticated via Supabase</Text>
          <Text style={styles.accountCardText}>
            User ID: <Text style={styles.accountCardMono}>{user.id}</Text>
          </Text>
          <Text style={styles.accountCardSub}>
            Account stored securely in Supabase <Text style={styles.accountCardMono}>auth.users</Text>
          </Text>
        </View>

        {/* Study Features */}
        <View style={styles.grid}>
          {FEATURES.map((feature) => (
            <View key={feature.id} style={styles.card}>
              <Text style={styles.cardIcon}>{feature.icon}</Text>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  userEmail: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  signOutButtonPressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    gap: 8,
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  accountCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 4,
  },
  accountCardTitle: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accountCardText: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  accountCardSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  accountCardMono: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    color: '#93c5fd',
  },
  grid: {
    gap: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  cardIcon: {
    fontSize: 26,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  cardDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
