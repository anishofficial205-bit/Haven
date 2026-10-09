import { useSettings } from '@/lib/settings';
import { highContrast, palettes, type Palette, type SchemeName } from '@/theme';

/** The design is dark only. */
export function useSchemeName(): SchemeName {
  return 'dark';
}

/** The app's colours, with the high-contrast overrides if switched on in Settings. */
export function useTheme(): Palette {
  const settings = useSettings();
  return settings.highContrast ? { ...palettes.dark, ...highContrast } : palettes.dark;
}

/** Same as useTheme. Kept so components that draw the page itself read clearly. */
export const usePageTheme = useTheme;
