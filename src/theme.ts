/**
 * Every visual value in the app lives here, so the look can be tuned in one place.
 * Screens and components read these through `useTheme()` (src/hooks/useTheme.ts).
 *
 * The look is "Collector": a black, dotted page; pastel tiles that lock
 * together like puzzle pieces, each with one sharp corner; and content
 * presented as collectible cards, with a typed strip across the top, a
 * brush-lettered title and numbers in a monospaced face.
 */

/** The four tile colours. Text on a tile is always `ink`. */
export type BlockTone = 'lime' | 'mint' | 'rose' | 'sky';

export type Palette = {
  /** Page background */
  background: string;
  /** Plain cards */
  surface: string;
  /** Quieter blocks inside a card or tile: chips, stat boxes */
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  /** Outline of cards, frames and stat boxes */
  border: string;
  /** Primary actions: lime on the dark page, ink on anything light */
  primary: string;
  onPrimary: string;
  blocks: Record<BlockTone, string>;
  /** Text and icons on top of a tile or card. The same in light and dark. */
  ink: string;
  /** The off-white of cards and framed windows */
  paper: string;
  /** Dots of the page texture */
  dot: string;
  success: string;
  warning: string;
  danger: string;
};

const blocks: Record<BlockTone, string> = {
  lime: '#D7F56A',
  mint: '#BDEFD9',
  rose: '#F8C9DD',
  sky: '#BFE3F5',
};
const ink = '#111312';
const paper = '#FBF8EF';

/** The dark, dotted page itself. */
const night: Palette = {
  background: '#0B0D0C',
  surface: '#171B19',
  surfaceAlt: '#232927',
  text: '#EEF4F0',
  textSecondary: '#9DABA4',
  border: '#343D39',
  primary: blocks.lime,
  onPrimary: ink,
  blocks,
  ink,
  paper,
  dot: 'rgba(238, 244, 240, 0.13)',
  success: '#7BE3A4',
  warning: blocks.lime,
  danger: '#FF9AA5',
};

/**
 * What components see when they sit on something light: a paper card or a
 * pastel tile. Also the page palette in light mode.
 */
const onLight: Palette = {
  background: '#F3EFE6',
  surface: paper,
  surfaceAlt: '#ECE7D9',
  text: ink,
  textSecondary: '#4F5A55',
  border: ink,
  primary: ink,
  onPrimary: blocks.lime,
  blocks,
  ink,
  paper,
  dot: 'rgba(17, 19, 18, 0.14)',
  success: '#12733A',
  warning: '#5C5200',
  danger: '#B3261E',
};

export const palettes = { light: onLight, dark: night } as const;
export type SchemeName = keyof typeof palettes;

/** Used inside paper cards. */
export const paperPalette: Palette = onLight;
/** Used inside pastel tiles: the quiet blocks become a wash of white. */
export const tilePalette: Palette = { ...onLight, surfaceAlt: 'rgba(255, 255, 255, 0.5)' };

/** Applied on top of the page palette when High contrast is switched on in Settings. */
export const highContrast: Record<SchemeName, Partial<Palette>> = {
  light: { textSecondary: '#2A302D', surfaceAlt: '#E0DACA' },
  dark: { background: '#000000', textSecondary: '#D9E3DD', border: '#9DABA4', dot: 'rgba(238, 244, 240, 0)' },
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
export const tileGap = 5;

export const radii = {
  /** The one sharp corner every tile has */
  sharp: 7,
  chip: 12,
  card: 24,
  sheet: 28,
  pill: 999,
} as const;

/** Smallest comfortable tap target (accessibility) */
export const minTapSize = 44;

/** Loaded in src/app/_layout.tsx */
export const fonts = {
  // Bricolage Grotesque: the everyday face
  regular: 'BricolageGrotesque_400Regular',
  semibold: 'BricolageGrotesque_600SemiBold',
  bold: 'BricolageGrotesque_700Bold',
  extrabold: 'BricolageGrotesque_800ExtraBold',
  // Knewave: brush lettering, for titles on cards
  display: 'Knewave_400Regular',
  // DM Mono: numbers and the typed strip across the top of a card
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
} as const;

/** Body text never goes below 16. */
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 29 },
  script: { fontFamily: fonts.display, fontSize: 18, lineHeight: 20 },
  title: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 28 },
  heading: { fontFamily: fonts.extrabold, fontSize: 19, lineHeight: 23 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  /** The typed strip: "SCENARIO · NO.001" */
  strip: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, letterSpacing: 0.6 },
  /** Big monospaced numbers */
  numeral: { fontFamily: fonts.monoMedium, fontSize: 34, lineHeight: 36, letterSpacing: -1.2 },
} as const;
export type TextVariant = keyof typeof typography;
