import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

type Props = {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Small line under the body, e.g. "This part is being built" */
  note?: string;
};

export function EmptyState({ icon: Icon, title, body, note }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: theme.surfaceAlt }]}>
        <Icon size={32} color={theme.primary} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {title}
      </AppText>
      <AppText color={theme.textSecondary} style={styles.center}>
        {body}
      </AppText>
      {note ? (
        <AppText variant="label" color={theme.textSecondary} style={styles.center}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
