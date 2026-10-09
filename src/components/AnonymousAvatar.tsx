import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useTheme } from '@/hooks/useTheme';

/**
 * The one avatar shown on all public content, whoever wrote it:
 * a little ghost in dark glasses.
 */
export function AnonymousAvatar({ size = 36 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.blocks.sky,
        borderWidth: 1.5,
        borderColor: theme.ink,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={size * 0.74} height={size * 0.74} viewBox="0 0 100 100">
        <Path
          d="M18 88 V46 A32 32 0 0 1 82 46 V88 L69 77 L56 88 L44 77 L31 88 Z"
          fill={theme.ink}
          stroke={theme.ink}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <Rect x={26} y={40} width={21} height={14} rx={6} fill={theme.paper} />
        <Rect x={53} y={40} width={21} height={14} rx={6} fill={theme.paper} />
        <Rect x={44} y={44} width={12} height={4} fill={theme.paper} />
      </Svg>
    </View>
  );
}
