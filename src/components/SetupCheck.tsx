import { useQuery } from '@tanstack/react-query';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { strings } from '@/i18n/en';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * Tells the person setting up the project whether the app can reach the
 * database. Rendered only in development builds.
 */
export function SetupCheck() {
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
  if (isSupabaseConfigured) {
    if (isPending) {
      message = strings.dev.checking;
    } else if (error) {
      message = strings.dev.error(error.message);
    } else if (data === 0) {
      message = strings.dev.emptyDatabase;
    } else {
      message = strings.dev.connected(data ?? 0);
    }
  }

  // Nothing to say once the database is reachable and has content.
  if (isSupabaseConfigured && !isPending && !error && (data ?? 0) > 0) return null;

  return (
    <Card>
      <AppText variant="label">{strings.dev.title}</AppText>
      <AppText>{message}</AppText>
    </Card>
  );
}
