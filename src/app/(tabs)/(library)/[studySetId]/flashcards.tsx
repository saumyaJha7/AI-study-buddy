import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ScreenHeading } from '@/components/screen-heading';
import { ActionButton, QueryFeedback } from '@/components/study-ui';
import { colors } from '@/constants/theme';
import { useSources } from '@/features/sources/query';
import {
  studySetKeys,
  useLatestFlashcardDeck,
} from '@/features/study-sets/query';
import { generateFlashcards } from '@/lib/api-client';

const COUNT_OPTIONS = [6, 12, 20] as const;

export default function FlashcardsScreen() {
  const { studySetId } = useLocalSearchParams<{ studySetId: string }>();
  const queryClient = useQueryClient();
  const deck = useLatestFlashcardDeck(studySetId);
  const sources = useSources(studySetId);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState<number>(12);
  const [finished, setFinished] = useState(false);

  const cards = deck.data?.cards ?? [];
  const currentIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[currentIndex];
  const ready = sources.data?.some((source) => source.status === 'ready');

  const generate = useMutation({
    mutationFn: () => generateFlashcards(studySetId, count),
    onSuccess: async () => {
      setIndex(0);
      setFlipped(false);
      setFinished(false);
      await queryClient.invalidateQueries({
        queryKey: studySetKeys.flashcards(studySetId),
      });
    },
  });

  function move(next: number) {
    setIndex(next);
    setFlipped(false);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Flashcards' }} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}>
          <ScreenHeading
            eyebrow="PRACTICE & REMEMBER"
            title="Make it stick."
            description="Think of the answer, then tap the card to reveal it."
          />

          <QueryFeedback
            loading={deck.isLoading}
            error={deck.error ?? sources.error}
            onRetry={() => {
              void deck.refetch();
              void sources.refetch();
            }}
          />

          {card && !finished ? (
            <View style={styles.review}>
              <Text style={styles.progress}>
                Card {currentIndex + 1} of {cards.length}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  flipped
                    ? 'Answer. Tap to show question'
                    : 'Question. Tap to reveal answer'
                }
                onPress={() => setFlipped(!flipped)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}>
                <Text style={styles.cardLabel}>
                  {flipped ? 'Answer' : 'Question'}
                </Text>
                <Text selectable style={styles.cardText}>
                  {flipped ? card.back : card.front}
                </Text>
                <Text style={styles.cardHint}>
                  Tap to {flipped ? 'see the question' : 'reveal the answer'}
                </Text>
              </Pressable>

              <View style={styles.navRow}>
                <ActionButton
                  title="Previous"
                  style={styles.navButton}
                  disabled={currentIndex === 0}
                  onPress={() => move(currentIndex - 1)}
                />
                <ActionButton
                  title={
                    currentIndex === cards.length - 1
                      ? 'Finish review'
                      : 'Next card'
                  }
                  style={styles.navButton}
                  onPress={() => {
                    if (currentIndex === cards.length - 1) {
                      setFinished(true);
                      setFlipped(false);
                    } else {
                      move(currentIndex + 1);
                    }
                  }}
                />
              </View>
            </View>
          ) : finished ? (
            <View style={styles.finishedBlock}>
              <EmptyState
                title="Review complete"
                description={`You reviewed ${cards.length} cards. Come back for another round to keep the ideas fresh.`}
              />
              <ActionButton
                title="Review again"
                onPress={() => {
                  move(0);
                  setFinished(false);
                }}
              />
            </View>
          ) : !deck.isLoading && !deck.error ? (
            <EmptyState
              title="Make it stick"
              description="Generate flashcards from your processed sources to start practicing."
            />
          ) : null}

          <View style={styles.generatorCard}>
            <Text style={styles.generatorTitle}>Cards to generate</Text>

            <View style={styles.countRow}>
              {COUNT_OPTIONS.map((value) => {
                const selected = count === value;

                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setCount(value)}
                    style={[
                      styles.countChip,
                      selected && styles.countChipSelected,
                    ]}>
                    <Text
                      style={[
                        styles.countText,
                        selected && styles.countTextSelected,
                      ]}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <QueryFeedback error={generate.error} />

            <ActionButton
              title={cards.length ? 'Generate a new deck' : 'Generate flashcards'}
              loading={generate.isPending}
              disabled={!ready || deck.isLoading}
              onPress={() => {
                generate.reset();
                generate.mutate();
              }}
            />

            <Text style={styles.helper}>
              Requires at least one processed source. Your latest deck appears
              here.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  review: {
    gap: 16,
  },
  progress: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.muted,
  },
  card: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
    padding: 28,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.primary,
  },
  cardText: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    color: colors.foreground,
  },
  cardHint: {
    fontSize: 13,
    color: colors.muted,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
  },
  finishedBlock: {
    gap: 12,
  },
  generatorCard: {
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 20,
  },
  generatorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countChip: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  countChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.foreground,
  },
  countTextSelected: {
    color: colors.primaryForeground,
  },
  helper: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
});
