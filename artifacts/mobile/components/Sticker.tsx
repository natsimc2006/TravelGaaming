import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface StickerProps {
  size: number;
  /** Colour of the inner shape. */
  fill: string;
  /** Resting tilt in degrees. */
  tilt?: number;
  round?: boolean;
  /** When set, the sticker "slaps" onto the page after this many ms. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Die-cut sticker: white border, soft drop shadow, slight tilt. If `delay` is given it
 * pops in like it's being stuck down — overshoots in scale, then settles at its tilt.
 */
export default function Sticker({ size, fill, tilt = 0, round = true, delay, style, children }: StickerProps) {
  const animate = delay !== undefined;
  const t = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.spring(t, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      speed: 14,
      bounciness: 12,
    }).start();
  }, []);

  const border = Math.max(4, Math.round(size * 0.09));
  const inner = size - border * 2;
  const outerR = round ? size / 2 : size * 0.26;
  const innerR = round ? inner / 2 : inner * 0.22;

  return (
    <Animated.View
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: outerR,
          opacity: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
          transform: [
            { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1.35, 1] }) },
            { rotate: t.interpolate({ inputRange: [0, 1], outputRange: [`${tilt * 3}deg`, `${tilt}deg`] }) },
          ],
        },
        style,
      ]}
    >
      <View style={{ width: inner, height: inner, borderRadius: innerR, backgroundColor: fill, alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </Animated.View>
  );
}

/** Gentle continuous bob — used for Pip so the mascot feels alive without being distracting. */
export function useBob(amplitude = 3, duration = 1600) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return {
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] }) },
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-2deg', '2deg'] }) },
    ],
  };
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B2A33',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
});
