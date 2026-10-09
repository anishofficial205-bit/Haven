/**
 * Every visual value in the app lives here, so the look can be tuned in one place.
 * Screens and components read these through `useTheme()` (src/hooks/useTheme.ts).
 *
 * The look is "Glow Blocks": a black, dotted page; blocks lit from inside with
 * a deep gradient; plain dark panels for anything read at length; tight
 * headings; dot-matrix numbers; and one electric yellow for whatever is
 * selected or is the main action.
 *
 * Each area of the app owns one glow colour (see FEATURE_TONE). Home uses all
 * of them, one block per area.
 */

export type GlowTone = 'lilac' | 'pink' | 'peri' | 'mint' | 'orange';

/** light (top-left), mid, deep (far corner) */
export const glows: Record<GlowTone, readonly [string, string, string]> = {
  lilac: ['#C9B3FF', '#6A3FE0', '#24106B'],
  pink: ['#FF8FCD', '#B81469', '#4D062B'],
  peri: ['#A9B8FF', '#3148C8', '#0C1760'],
  mint: ['#9AF0CC', '#17876A', '#06342A'],
  orange: ['#FFC56E', '#CF5A12', '#4A1803'],
};

export type Feature = 'scenarios' | 'confess' | 'spaces' | 'help' | 'profile';

/** One colour per area of the app. Change an area's colour here and it changes everywhere. */
export const FEATURE_TONE: Record<Feature, GlowTone> = {
  scenarios: 'lilac',
  confess: 'pink',
  spaces: 'peri',
  help: 'mint',
  profile: 'orange',
};

export type Palette = {
  /** Page background, under the dots */
  background: string;
  /** Plain panels: posts, rows, inputs */
  surface: string;
  /** Quieter blocks inside a panel: chips, your own pending reply */
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  /** Hairline around panels and controls */
  border: string;
  /** Electric yellow: the selected thing, the main action. Nothing else. */
  primary: string;
  /** Text and icons on top of yellow */
  onPrimary: string;
  /** A soft white wash for controls sitting on a glow */
  wash: string;
  /** Dots of the page texture */
  dot: string;
  success: string;
  warning: string;
  danger: string;
};

const night: Palette = {
  background: '#050506',
  surface: '#111115',
  surfaceAlt: '#1D1D24',
  text: '#FFFFFF',
  textSecondary: '#A3A3B2',
  border: 'rgba(255, 255, 255, 0.13)',
  primary: '#E8FF2A',
  onPrimary: '#0C0C0C',
  wash: 'rgba(255, 255, 255, 0.14)',
  dot: 'rgba(255, 255, 255, 0.15)',
  success: '#7BE3A4',
  warning: '#E8FF2A',
  danger: '#FF9AA5',
};

/** The design is dark only. Both names point at it so nothing breaks if the phone is in light mode. */
export const palettes = { light: night, dark: night } as const;
export type SchemeName = keyof typeof palettes;

/** Applied on top when High contrast is switched on in Settings. */
export const highContrast: Partial<Palette> = {
  background: '#000000',
  surface: '#16161B',
  textSecondary: '#D6D6E2',
  border: 'rgba(255, 255, 255, 0.45)',
  dot: 'rgba(255, 255, 255, 0)',
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

/** Gap between neighbouring blocks */
export const tileGap = 8;

export const radii = {
  chip: 12,
  card: 24,
  sheet: 28,
  pill: 999,
} as const;

/** Smallest comfortable tap target (accessibility) */
export const minTapSize = 44;

/** Loaded in src/app/_layout.tsx */
export const fonts = {
  regular: 'Poppins_400Regular',
  semibold: 'Poppins_500Medium',
  bold: 'Poppins_600SemiBold',
  extrabold: 'Poppins_700Bold',
  /** Doto: the dot-matrix numbers */
  matrix: 'Doto_900Black',
} as const;

/**
 * Reading text (posts, stories, messages) is `body` and never goes below 16.
 * Headings are tight; labels are small.
 */
export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 27, lineHeight: 27, letterSpacing: -1.3 },
  title: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 25, letterSpacing: -0.8 },
  heading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 20, letterSpacing: -0.6 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, letterSpacing: -0.3 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17, letterSpacing: -0.1 },
  caption: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 15 },
  /** Small capitals above a block: "THIS WEEK" */
  strip: { fontFamily: fonts.semibold, fontSize: 10.5, lineHeight: 13, letterSpacing: 0.9 },
  /** Kept so older call sites still work; same as label */
  script: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17 },
  /** Dot-matrix numbers */
  numeral: { fontFamily: fonts.matrix, fontSize: 34, lineHeight: 32, letterSpacing: -0.6 },
} as const;
export type TextVariant = keyof typeof typography;
