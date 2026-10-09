import { useColorScheme } from 'react-native';

import { useSettings } from '@/lib/settings';
import { highContrast, palettes, type Palette, type SchemeName } from '@/theme';

/** Light or dark, following the phone unless the person chose otherwise in Settings. */
export function useSchemeName(): SchemeName {
  const system = useColorScheme();
  const { theme } = useSettings();
  if (theme !== 'system') return theme;
  return system === 'dark' ? 'dark' : 'light';
}

/** The colours for the current mode, with the high-contrast overrides if switched on. */
export function useTheme(): Palette {
  const scheme = useSchemeName();
  const settings = useSettings();
  return settings.highContrast ? { ...palettes[scheme], ...highContrast[scheme] } : palettes[scheme];
}
