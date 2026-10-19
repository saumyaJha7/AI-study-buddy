import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/navigation';

export default function LibraryLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[studySetId]/index" options={{ title: 'Study set' }} />
      <Stack.Screen name="[studySetId]/summary" options={{ title: 'Summary' }} />
    </Stack>
  );
}
