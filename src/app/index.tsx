import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/context/auth-context';

type Tab = 'library' | 'settings';

interface StudySet {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { session, user, signOut } = useAuth();
  const scrollViewRef = useRef<ScrollViewType>(null);

  const [activeTab, setActiveTab] = useState<Tab>('library');

  // Study sets collection
  const [studySets, setStudySets] = useState<StudySet[]>([]);

  // Inline form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Auth modal state for Settings screen
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  const handleCreateStudySet = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const newSet: StudySet = {
      id: Date.now().toString(),
      title: trimmed,
      description: newDescription.trim(),
      updatedAt: formattedDate,
    };

    setStudySets((prev) => [newSet, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setIsFormOpen(false);
    Keyboard.dismiss();
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
    // Auto-scroll down so the form is visible above the keyboard
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  const handleCancelForm = () => {
    Keyboard.dismiss();
    setNewTitle('');
    setNewDescription('');
    setIsFormOpen(false);
  };

  const handleDeleteStudySet = (id: string) => {
    setStudySets((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Main Content Area */}
        {activeTab === 'library' ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Top Header */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Library</Text>
            </View>

            {/* Motivational / Hero Heading */}
            <Text style={styles.heroText}>
              {'A space for your next\nbreakthrough.'}
            </Text>

            {/* Section Subheading */}
            <Text style={styles.sectionSubtitle}>Your study collections</Text>

            {/* Description */}
            <Text style={styles.descriptionText}>
              {'Upload materials, generate summaries,\nflashcards, and chat with your notes.'}
            </Text>

            {/* Inline Form or Button */}
            {isFormOpen ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>New study set</Text>

                <TextInput
                  style={styles.formInput}
                  placeholder="Title"
                  placeholderTextColor="#7c838d"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                  returnKeyType="next"
                />

                <TextInput
                  style={[styles.formInput, styles.formInputDescription]}
                  placeholder="Description (optional)"
                  placeholderTextColor="#7c838d"
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  textAlignVertical="top"
                  returnKeyType="default"
                />

                <View style={styles.formActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.formCreateButton,
                      pressed && styles.buttonPressed,
                      !newTitle.trim() && { opacity: 0.45 },
                    ]}
                    disabled={!newTitle.trim()}
                    onPress={handleCreateStudySet}>
                    <Text style={styles.formCreateText}>Create</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.formCancelButton,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={handleCancelForm}>
                    <Text style={styles.formCancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleOpenForm()}>
                <Text style={styles.primaryButtonText}>New study set</Text>
              </Pressable>
            )}

            {/* Collections List */}
            <View style={styles.collectionsContainer}>
              {studySets.map((set) => (
                <View key={set.id} style={styles.studyCard}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{set.title}</Text>
                    <Text style={styles.cardUpdated}>
                      Updated {set.updatedAt}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={12}
                    onPress={() => handleDeleteStudySet(set.id)}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && { opacity: 0.6 },
                    ]}>
                    <Feather name="trash-2" size={16} color="#64748b" />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Settings Header */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* Settings Hero */}
            <Text style={styles.settingsHeroText}>Your study space</Text>
            <Text style={styles.settingsDescription}>
              {'Manage your account and keep learning at\nyour pace.'}
            </Text>

            {/* Signed In Card */}
            <Pressable
              style={styles.settingsSignedInCard}
              onPress={() => {
                if (!session) setIsAuthModalVisible(true);
              }}>
              <Text style={styles.settingsSignedInLabel}>Signed in as</Text>
              <Text style={styles.settingsSignedInEmail}>
                {user?.email || 'amitdewangan@gmail.com'}
              </Text>
            </Pressable>

            {/* About Card */}
            <View style={styles.settingsAboutCard}>
              <Text style={styles.settingsAboutTitle}>About Study Buddy</Text>
              <Text style={styles.settingsAboutDescription}>
                Your materials, made easier to understand. Build study sets,
                explore summaries, practice flashcards, and ask questions
                grounded in your notes.
              </Text>
            </View>

            {/* Sign Out Button */}
            <Pressable
              style={({ pressed }) => [
                styles.settingsSignOutButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                if (session) {
                  signOut();
                } else {
                  setIsAuthModalVisible(true);
                }
              }}>
              <Text style={styles.settingsSignOutText}>Sign out</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Bottom Navigation Bar */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}>
          {/* Library Tab */}
          <Pressable
            style={styles.tabItem}
            onPress={() => setActiveTab('library')}>
            <View
              style={[
                styles.tabIconPill,
                activeTab === 'library' && styles.tabIconPillActive,
              ]}>
              <Feather
                name="book-open"
                size={20}
                color={activeTab === 'library' ? '#F5C29E' : '#8E988D'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'library'
                  ? styles.tabLabelActive
                  : styles.tabLabelInactive,
              ]}>
              Library
            </Text>
          </Pressable>

          {/* Settings Tab */}
          <Pressable
            style={styles.tabItem}
            onPress={() => setActiveTab('settings')}>
            <View
              style={[
                styles.tabIconPill,
                activeTab === 'settings' && styles.tabIconPillActive,
              ]}>
              <Feather
                name="settings"
                size={20}
                color={activeTab === 'settings' ? '#F5C29E' : '#8E988D'}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'settings'
                  ? styles.tabLabelActive
                  : styles.tabLabelInactive,
              ]}>
              Settings
            </Text>
          </Pressable>
        </View>

        {/* Auth Modal for Supabase Login / Signup */}
        <Modal
          animationType="fade"
          transparent
          visible={isAuthModalVisible}
          onRequestClose={() => setIsAuthModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setIsAuthModalVisible(false)}
            />
            <View style={styles.authModalContent}>
              <View style={styles.authModalHeader}>
                <Text style={styles.authModalTitle}>Account</Text>
                <Pressable
                  hitSlop={12}
                  onPress={() => setIsAuthModalVisible(false)}>
                  <Feather name="x" size={20} color="#94a3b8" />
                </Pressable>
              </View>
              <AuthForm />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d0f11',
  },
  container: {
    flex: 1,
    backgroundColor: '#0d0f11',
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
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#8c929a',
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

  /* ── Primary "New study set" button ── */
  primaryButton: {
    backgroundColor: '#F5C29E',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5C29E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#151618',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  /* ── Inline creation form (replaces the button when open) ── */
  formCard: {
    backgroundColor: '#1b1e22',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#24282f',
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#2a2e35',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#ffffff',
  },
  formInputDescription: {
    minHeight: 72,
    paddingTop: 14,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  formCreateButton: {
    flex: 1,
    backgroundColor: '#F5C29E',
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCreateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#151618',
  },
  formCancelButton: {
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },

  /* ── Study set cards ── */
  collectionsContainer: {
    marginTop: 20,
    minHeight: 40,
  },
  studyCard: {
    backgroundColor: '#1b1e22',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#24282f',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  cardUpdated: {
    fontSize: 13,
    color: '#7c838d',
    marginTop: 6,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },

  /* ── Settings screen ── */
  settingsHeroText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  settingsDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#8c929a',
    marginBottom: 32,
  },
  settingsSignedInCard: {
    backgroundColor: '#1b1e22',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#24282f',
    marginBottom: 16,
    gap: 8,
  },
  settingsSignedInLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8c929a',
  },
  settingsSignedInEmail: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsAboutCard: {
    backgroundColor: '#1b1e22',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#24282f',
    marginBottom: 24,
    gap: 10,
  },
  settingsAboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsAboutDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#a0a6b0',
  },
  settingsSignOutButton: {
    backgroundColor: '#1b1e22',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#24282f',
  },
  settingsSignOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5C29E',
  },
  /* ── Auth modal ── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  authModalContent: {
    backgroundColor: '#1b1e22',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24282f',
  },
  authModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
  },

  /* ── Bottom tab bar ── */
  bottomBar: {
    backgroundColor: '#101411',
    borderTopWidth: 1,
    borderTopColor: '#171c18',
    paddingTop: 8,
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    minWidth: 84,
  },
  tabIconPill: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabIconPillActive: {
    backgroundColor: '#283627',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#F5C29E',
    fontWeight: '600',
  },
  tabLabelInactive: {
    color: '#8E988D',
    fontWeight: '500',
  },
});
