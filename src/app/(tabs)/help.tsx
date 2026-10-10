import { router } from 'expo-router';
import { ArrowRight, ChevronRight, Inbox, Phone } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Dots } from '@/components/Dots';
import { Glow } from '@/components/Glow';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { PROFESSIONAL_TYPES, useMyRequests, type ProfessionalType } from '@/lib/help';
import { helplines } from '@/lib/helplines';
import { TYPE_ICONS } from '@/lib/icons';
import { FEATURE_TONE, radii, shades, spacing, tileGap } from '@/theme';

const copy = strings.help;
const M = shades[FEATURE_TONE.help];

/** Each door steps one shade deeper. Text flips to dark on the palest one. */
const DOORS: Record<ProfessionalType, { colors: readonly [string, string, string]; ink: string; wash: string }> = {
  therapist: { colors: [M[1], M[3], M[4]], ink: M[8], wash: 'rgba(4, 31, 25, 0.14)' },
  intimacy_coach: { colors: [M[3], M[5], M[6]], ink: '#FFFFFF', wash: 'rgba(255, 255, 255, 0.2)' },
  legal_advisor: { colors: [M[4], M[6], M[7]], ink: '#FFFFFF', wash: 'rgba(255, 255, 255, 0.2)' },
};

/**
 * The three kinds of professional fill the page. Helplines are one slim pill
 * at the bottom (and always behind a long press on the shield).
 */
export default function HelpScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const requests = useMyRequests(profile?.id);
  const open = requests.data?.filter((request) => request.status !== 'closed').length ?? 0;

  return (
    <View style={[styles.page, { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <Dots />
      {PROFESSIONAL_TYPES.map((type) => {
        const Icon = TYPE_ICONS[type];
        const door = DOORS[type];
        return (
          <Glow
            key={type}
            tone={FEATURE_TONE.help}
            colors={door.colors}
            style={styles.door}
            accessibilityLabel={`${copy.writeTo(copy.types[type].name)}. ${copy.types[type].when}`}
            onPress={() => router.push({ pathname: '/help/[type]', params: { type } })}>
            <View style={[styles.icon, { backgroundColor: door.wash }]}>
              <Icon size={20} color={door.ink} />
            </View>
            <View style={styles.doorFoot}>
              <View style={styles.flex}>
                <AppText variant="title" color={door.ink}>
                  {copy.types[type].name}
                </AppText>
                <AppText variant="label" color={door.ink} style={styles.when}>
                  {copy.types[type].when}
                </AppText>
              </View>
              <View style={[styles.write, { backgroundColor: type === 'therapist' ? M[8] : M[0] }]}>
                <AppText variant="label" color={type === 'therapist' ? M[0] : M[7]}>
                  {copy.write}
                </AppText>
                <ArrowRight size={15} color={type === 'therapist' ? M[0] : M[7]} />
              </View>
            </View>
          </Glow>
        );
      })}

      <Pressable
        onPress={() => router.push('/help/requests')}
        accessibilityRole="button"
        accessibilityLabel={copy.myRequests}
        style={[styles.row, styles.requests]}>
        <Inbox size={18} color={M[0]} />
        <AppText variant="label" color={M[0]} style={styles.flex}>
          {copy.myRequests}
        </AppText>
        {open > 0 ? (
          <View style={styles.badge}>
            <AppText variant="label" color={M[7]}>
              {open}
            </AppText>
          </View>
        ) : (
          <ChevronRight size={16} color={M[2]} />
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push('/helplines')}
        accessibilityRole="button"
        accessibilityLabel={strings.helplines.title}
        style={[styles.row, styles.helplines]}>
        <View style={styles.phone}>
          <Phone size={16} color={M[1]} />
        </View>
        <View style={styles.flex}>
          <AppText variant="label">{copy.helplinesShort}</AppText>
          <AppText variant="caption" color={M[2]} numberOfLines={1}>
            {helplines.map((line) => line.number).join(' · ')}
          </AppText>
        </View>
        <ChevronRight size={16} color={M[2]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: tileGap,
  },
  flex: {
    flex: 1,
  },
  door: {
    flex: 1,
    minHeight: 120,
    borderRadius: 28,
    justifyContent: 'space-between',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  when: {
    opacity: 0.9,
    marginTop: 2,
  },
  write: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  row: {
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  requests: {
    height: 50,
    paddingLeft: spacing.lg + 2,
    paddingRight: spacing.md,
    backgroundColor: M[7],
  },
  badge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: M[1],
  },
  helplines: {
    minHeight: 52,
    paddingLeft: 7,
    paddingRight: spacing.md,
    paddingVertical: 6,
    backgroundColor: M[8],
    borderWidth: 1,
    borderColor: M[6],
  },
  phone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: M[7],
  },
});
