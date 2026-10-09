import { useColorScheme } from 'react-native';

import { palettes, type Palette, type SchemeName } from '@/theme';

export function useSchemeName(): SchemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/** The colours for the current light or dark mode. */
export function useTheme(): Palette {
  return palettes[useSchemeName()];
}
