import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => listener.remove();
  }, []);
  return reduced;
}

/**
 * A pressable that dips slightly when touched, like pushing a real button.
 * Stays still if the phone is set to reduce motion.
 */
export function PressableScale({ style, onPressIn, onPressOut, children, ...rest }: Props) {
  const [scale] = useState(() => new Animated.Value(1));
  const reduced = useReducedMotion();

  const to = (value: number) => {
    if (reduced) return;
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  };

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        to(0.97);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        to(1);
        onPressOut?.(event);
      }}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children as React.ReactNode}</Animated.View>
    </Pressable>
  );
}
