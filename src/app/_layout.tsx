import { Stack } from 'expo-router';

import { AuthProvider } from '@/context/auth-context';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      />
    </AuthProvider>
  );
}
