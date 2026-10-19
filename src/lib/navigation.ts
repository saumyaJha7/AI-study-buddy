import { colors } from '@/constants/theme';

export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.foreground },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
} as const;
