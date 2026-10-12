import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type Instrument = {
  id: number;
  name: string;
};

export default function HomeScreen() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstruments = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('instruments')
        .select('*')
        .order('id', { ascending: true });

      if (queryError) {
        setError(queryError.message);
      } else {
        setError(null);
        setInstruments(data ?? []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch instruments');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInstruments();
  }, [fetchInstruments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInstruments();
  }, [fetchInstruments]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Instruments
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Data fetched from Supabase
          </ThemedText>
        </ThemedView>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <ThemedText type="small" style={styles.stateText}>
              Loading instruments...
            </ThemedText>
          </View>
        ) : error ? (
          <ThemedView type="backgroundElement" style={styles.messageBox}>
            <ThemedText type="subtitle" style={styles.errorTitle}>
              Error loading instruments
            </ThemedText>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
            <ThemedText type="code" style={styles.hintText}>
              Verify your Supabase credentials in .env and check that the instruments table exists.
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={instruments}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={
              instruments.length === 0 ? styles.emptyContainer : styles.listContent
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <ThemedView type="backgroundElement" style={styles.itemCard}>
                <ThemedText type="subtitle" style={styles.itemName}>
                  {item.name}
                </ThemedText>
                <ThemedText type="code" style={styles.itemId}>
                  ID: {item.id}
                </ThemedText>
              </ThemedView>
            )}
            ListEmptyComponent={
              <ThemedView type="backgroundElement" style={styles.messageBox}>
                <ThemedText type="subtitle">No instruments found</ThemedText>
                <ThemedText type="small" style={styles.stateText}>
                  Pull down to refresh after inserting rows in Supabase.
                </ThemedText>
              </ThemedView>
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 18,
    lineHeight: 24,
    textTransform: 'capitalize',
  },
  itemId: {
    opacity: 0.6,
  },
  messageBox: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 24,
    color: '#e5484d',
  },
  errorText: {
    textAlign: 'center',
    color: '#e5484d',
  },
  hintText: {
    marginTop: Spacing.two,
    textAlign: 'center',
    fontSize: 11,
  },
  stateText: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});
