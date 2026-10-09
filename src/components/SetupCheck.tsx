import { useQuery } from '@tanstack/react-query';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * Tells the person setting up the project whether the app can reach the
 * database. Rendered only in development builds.
 */
export function SetupCheck() {
  const theme = useTheme();
  const { data, error, isPending } = useQuery({
    queryKey: ['setup-check'],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('spaces')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  let message: string = strings.dev.notConfigured;
  let color = theme.warning;
  if (isSupabaseConfigured) {
    if (isPending) {
      message = strings.dev.checking;
      color = theme.textSecondary;
    } else if (error) {
      message = strings.dev.error(error.message);
      color = theme.danger;
    } else if (data === 0) {
      message = strings.dev.emptyDatabase;
    } else {
      message = strings.dev.connected(data ?? 0);
      color = theme.success;
    }
  }

  return (
    <Card>
      <AppText variant="label" color={theme.textSecondary}>
        {strings.dev.title}
      </AppText>
      <AppText color={color}>{message}</AppText>
    </Card>
  );
}
