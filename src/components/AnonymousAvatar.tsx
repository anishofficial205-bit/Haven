import { VenetianMask } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { radii } from '@/theme';

/** The one avatar shown on all public content, whoever wrote it. */
export function AnonymousAvatar({ size = 36 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.circle, { width: size, height: size, backgroundColor: theme.surfaceAlt }]}>
      <VenetianMask size={size * 0.58} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
