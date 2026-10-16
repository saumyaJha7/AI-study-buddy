import { useState } from 'react';
import {
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/context/auth-context';

type Tab = 'library' | 'settings';

interface StudySet {
  id: string;
  title: string;
  updatedAt: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { session, user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('library');

  // Study sets collection - empty by default as requested:
  // "in place of os1 , operating system and Os card .. make the place empty"
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');

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
      updatedAt: formattedDate,
    };

    setStudySets((prev) => [newSet, ...prev]);
    setNewTitle('');
    setIsModalVisible(false);
  };

  const handleDeleteStudySet = (id: string) => {
    setStudySets((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Main Content Area */}
        {activeTab === 'library' ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
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

            {/* Primary Action Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setIsModalVisible(true)}>
              <Text style={styles.primaryButtonText}>New study set</Text>
            </Pressable>

            {/* Collections List Area:
                Empty by default ("in place of os1 , operating system and Os card .. make the place empty").
                If the user creates study sets via the button, they render with the exact matching card style. */}
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
            {/* Settings Screen */}
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {session && user ? (
              <View style={styles.settingsCard}>
                <Text style={styles.settingsCardBadge}>Authenticated</Text>
                <Text style={styles.settingsCardLabel}>Account Email</Text>
                <Text style={styles.settingsCardValue}>{user.email}</Text>

                <Text style={[styles.settingsCardLabel, { marginTop: 12 }]}>
                  User ID
                </Text>
                <Text style={styles.settingsCardMono}>{user.id}</Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.signOutButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={signOut}>
                  <Feather name="log-out" size={16} color="#f87171" />
                  <Text style={styles.signOutButtonText}>Sign Out</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.authWrapper}>
                <AuthForm />
              </View>
            )}

            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>AI Study Buddy</Text>
              <Text style={styles.aboutSubtitle}>
                Version 1.0.0 • Mobile-first learning companion
              </Text>
            </View>
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

        {/* Modal for Creating New Study Set */}
        <Modal
          animationType="fade"
          transparent
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setIsModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Study Set</Text>
              <Text style={styles.modalSubtitle}>
                Give your new study collection a title to get started.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Operating Systems"
                placeholderTextColor="#64748b"
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateStudySet}
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalCancelButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    setNewTitle('');
                    setIsModalVisible(false);
                  }}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalCreateButton,
                    pressed && styles.buttonPressed,
                    !newTitle.trim() && { opacity: 0.5 },
                  ]}
                  disabled={!newTitle.trim()}
                  onPress={handleCreateStudySet}>
                  <Text style={styles.modalCreateText}>Create</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
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
  settingsCard: {
    backgroundColor: '#1b1e22',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#24282f',
    marginBottom: 16,
  },
  settingsCardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#132e22',
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
  },
  settingsCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  settingsCardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  settingsCardMono: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 12,
    color: '#93c5fd',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#291b1f',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#451a24',
  },
  signOutButtonText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
  authWrapper: {
    marginBottom: 20,
  },
  aboutCard: {
    backgroundColor: '#15171b',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#20242a',
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 2,
  },
  aboutSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1b1e22',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2c313a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8a9099',
    marginBottom: 18,
    lineHeight: 18,
  },
  modalInput: {
    backgroundColor: '#111316',
    borderWidth: 1,
    borderColor: '#2c313a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCreateButton: {
    backgroundColor: '#F5C29E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCreateText: {
    color: '#151618',
    fontSize: 14,
    fontWeight: '600',
  },
});
