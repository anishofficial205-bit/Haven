/**
 * Every visual value in the app lives here, so the look can be tuned in one place.
 * Screens and components read these through `useTheme()` (src/hooks/useTheme.ts).
 */

export type Palette = {
  /** Page background behind cards */
  background: string;
  /** Cards and sheets */
  surface: string;
  /** Quieter blocks inside a card: chips, input fields */
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  /** Primary actions: buttons, active tab, links */
  primary: string;
  onPrimary: string;
  /** Header and hero surfaces: start and end of the violet gradient */
  gradient: readonly [string, string];
  onGradient: string;
  onGradientMuted: string;
  /** The panic shield has its own calm colour. Deliberately not alarm red. */
  panic: string;
  onPanic: string;
  success: string;
  warning: string;
  danger: string;
};

const light: Palette = {
  background: '#F7F4FD',
  surface: '#FFFFFF',
  surfaceAlt: '#EFE9FB',
  text: '#1E1633',
  textSecondary: '#5E557A',
  border: '#E2DAF3',
  primary: '#6435C9',
  onPrimary: '#FFFFFF',
  gradient: ['#5B2FC4', '#7F56D9'],
  onGradient: '#FFFFFF',
  onGradientMuted: '#E9E0FB',
  panic: '#D6F5EF',
  onPanic: '#0B5F58',
  success: '#1B7A4B',
  warning: '#8A5A00',
  danger: '#B3261E',
};

const dark: Palette = {
  background: '#120E1F',
  surface: '#1D1730',
  surfaceAlt: '#2A2244',
  text: '#F3EFFC',
  textSecondary: '#B9AFD6',
  border: '#352C52',
  primary: '#B39AF4',
  onPrimary: '#170F2E',
  gradient: ['#33207A', '#5236A8'],
  onGradient: '#FFFFFF',
  onGradientMuted: '#D9CEF7',
  panic: '#123F3B',
  onPanic: '#8FE6D8',
  success: '#6FD3A0',
  warning: '#F2C063',
  danger: '#FFB4AB',
};

export const palettes = { light, dark } as const;
export type SchemeName = keyof typeof palettes;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  /** Screen gutter */
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  chip: 12,
  card: 20,
  sheet: 24,
  pill: 999,
} as const;

/** Smallest comfortable tap target (accessibility) */
export const minTapSize = 44;

/** Nunito, loaded in src/app/_layout.tsx */
export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

/** Body text never goes below 16. */
export const typography = {
  title: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
} as const;
export type TextVariant = keyof typeof typography;
