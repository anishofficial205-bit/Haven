/**
 * Every visual value in the app lives here, so the look can be tuned in one place.
 * Screens and components read these through `useTheme()` (src/hooks/useTheme.ts).
 *
 * The look: a near-black (or paper-white) page, solid blocks of bright colour
 * with black text on them, white pill buttons, and big rounded tiles that fit
 * together like puzzle pieces.
 */

/** The four block colours. Text on a block is always `ink`. */
export type BlockTone = 'yellow' | 'pink' | 'green' | 'blue';

export type Palette = {
  /** Page background */
  background: string;
  /** Plain (outlined) cards and sheets */
  surface: string;
  /** Quieter blocks inside a card: chips, input fields, speech bubbles */
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  /** Outline of plain cards */
  border: string;
  /** Primary actions and the active tab: a white pill on dark, a black pill on light */
  primary: string;
  onPrimary: string;
  /** Bright blocks of colour for tiles */
  blocks: Record<BlockTone, string>;
  /** Text and icons on top of a block colour. The same in light and dark. */
  ink: string;
  /** The panic shield has its own calm colour. Deliberately not alarm red. */
  panic: string;
  onPanic: string;
  success: string;
  warning: string;
  danger: string;
};

const blocks: Record<BlockTone, string> = {
  yellow: '#F4E73A',
  pink: '#F272B4',
  green: '#3BDD5E',
  blue: '#4F8FFF',
};
const ink = '#0B0B0C';

const dark: Palette = {
  background: '#050506',
  surface: '#0F0F11',
  surfaceAlt: '#1D1D21',
  text: '#FFFFFF',
  textSecondary: '#A9A9B4',
  border: '#2E2E35',
  primary: '#FFFFFF',
  onPrimary: ink,
  blocks,
  ink,
  panic: '#B9F6E6',
  onPanic: '#0B3B34',
  success: '#4BE272',
  warning: '#F4E73A',
  danger: '#FF8794',
};

const light: Palette = {
  background: '#F3F1EA',
  surface: '#FFFFFF',
  surfaceAlt: '#E8E5DB',
  text: ink,
  textSecondary: '#55545C',
  border: '#1B1B1F',
  primary: ink,
  onPrimary: '#FFFFFF',
  blocks,
  ink,
  panic: '#B9F6E6',
  onPanic: '#0B3B34',
  success: '#12733A',
  warning: '#6E5A00',
  danger: '#B3261E',
};

export const palettes = { light, dark } as const;
export type SchemeName = keyof typeof palettes;

/** Applied on top of the palette when High contrast is switched on in Settings. */
export const highContrast: Record<SchemeName, Partial<Palette>> = {
  light: {
    textSecondary: '#2A2A30',
    border: '#000000',
    surfaceAlt: '#DDD9CC',
  },
  dark: {
    background: '#000000',
    textSecondary: '#E2E2EA',
    border: '#B5B5C2',
    surfaceAlt: '#2A2A30',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  /** Screen gutter */
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Tiles sit this close together, so they read as one interlocking shape. */
export const tileGap = 8;

export const radii = {
  chip: 14,
  card: 26,
  sheet: 30,
  pill: 999,
} as const;

/** Smallest comfortable tap target (accessibility) */
export const minTapSize = 44;

/** Loaded in src/app/_layout.tsx */
export const fonts = {
  // Outfit: the clean everyday face
  regular: 'Outfit_400Regular',
  semibold: 'Outfit_500Medium',
  bold: 'Outfit_600SemiBold',
  extrabold: 'Outfit_700Bold',
  // Bagel Fat One: the bubbly one, for a few big words
  display: 'BagelFatOne_400Regular',
  // Gochi Hand: handwriting, for small asides
  script: 'GochiHand_400Regular',
} as const;

/** Body text never goes below 16. */
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38 },
  title: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 31 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 25 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  script: { fontFamily: fonts.script, fontSize: 20, lineHeight: 24 },
} as const;
export type TextVariant = keyof typeof typography;
