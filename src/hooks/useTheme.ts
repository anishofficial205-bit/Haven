import { createContext, use } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings } from '@/lib/settings';
import { highContrast, palettes, type Palette, type SchemeName } from '@/theme';

/**
 * Set by a card or tile, so everything inside it (text, chips, buttons)
 * automatically uses colours that read on a light surface, even though the
 * page around it is dark.
 */
export const SurfaceContext = createContext<Palette | null>(null);

/** Light or dark, following the choice in Settings > Appearance. */
export function useSchemeName(): SchemeName {
  const system = useColorScheme();
  const { theme } = useSettings();
  if (theme !== 'system') return theme;
  return system === 'dark' ? 'dark' : 'light';
}

/** The colours of the page itself, ignoring any card or tile we may be inside. */
export function usePageTheme(): Palette {
  const scheme = useSchemeName();
  const settings = useSettings();
  return settings.highContrast ? { ...palettes[scheme], ...highContrast[scheme] } : palettes[scheme];
}

/** The colours to use right here: the surrounding card or tile's, else the page's. */
export function useTheme(): Palette {
  const page = usePageTheme();
  return use(SurfaceContext) ?? page;
}
