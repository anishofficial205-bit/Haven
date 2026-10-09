import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { TEXT_SCALE, useSettings } from '@/lib/settings';
import { typography, type TextVariant } from '@/theme';

type Props = TextProps & {
  variant?: TextVariant;
  /** Overrides the default text colour */
  color?: string;
};

/** All text in the app goes through this, so font and size stay consistent. */
export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  const theme = useTheme();
  const scale = TEXT_SCALE[useSettings().textSize];
  const base = typography[variant];
  const sized = { ...base, fontSize: base.fontSize * scale, lineHeight: base.lineHeight * scale };
  return <Text {...rest} style={[sized, { color: color ?? theme.text }, style]} />;
}
