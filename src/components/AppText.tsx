import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { typography, type TextVariant } from '@/theme';

type Props = TextProps & {
  variant?: TextVariant;
  /** Overrides the default text colour */
  color?: string;
};

/** All text in the app goes through this, so font and size stay consistent. */
export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  const theme = useTheme();
  return <Text {...rest} style={[typography[variant], { color: color ?? theme.text }, style]} />;
}
