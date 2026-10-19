import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type ScreenHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  introduction?: boolean;
};

const STEPS = ['01  Collect', '02  Understand', '03  Remember'];

function StudyIllustration() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.illustration}>
      <View style={styles.illustrationRing} />
      <View style={[styles.note, styles.noteBack]} />
      <View style={[styles.note, styles.noteFront]}>
        <Text style={styles.noteLabel}>ONE GOOD IDEA</Text>
        <View style={styles.noteLineLong} />
        <View style={styles.noteLineShort} />
      </View>
    </View>
  );
}

export function ScreenHeading({
  eyebrow,
  title,
  description,
  introduction = false,
}: ScreenHeadingProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, introduction && styles.titleIntroduction]}>
          {title}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {introduction ? (
        <StudyIllustration />
      ) : (
        <View style={styles.marksRow}>
          <View style={[styles.mark, styles.markWide]} />
          <View style={styles.mark} />
          <View style={styles.mark} />
        </View>
      )}

      {introduction ? (
        <View style={styles.stepsRow}>
          {STEPS.map((step) => (
            <Text key={step} style={styles.step}>
              {step}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: colors.primary,
  },
  body: {
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  titleIntroduction: {
    fontSize: 36,
    lineHeight: 46,
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.muted,
  },
  marksRow: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  mark: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.highlight,
  },
  markWide: {
    width: 40,
    backgroundColor: colors.primary,
  },
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.highlight,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  step: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  illustration: {
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustrationRing: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: {
    position: 'absolute',
    width: 192,
    height: 112,
    borderRadius: 16,
  },
  noteBack: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.highlight,
    transform: [{ rotate: '-12deg' }, { translateX: -12 }],
  },
  noteFront: {
    gap: 12,
    padding: 20,
    backgroundColor: colors.primary,
    transform: [{ rotate: '7deg' }, { translateX: 10 }],
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: colors.primaryForeground,
  },
  noteLineLong: {
    width: 112,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.highlight,
  },
  noteLineShort: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.highlight,
    opacity: 0.5,
  },
});
