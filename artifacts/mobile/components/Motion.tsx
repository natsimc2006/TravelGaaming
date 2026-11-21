import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Shared entrance animations. Kept deliberately small and quick (≤ 450ms) so the
 * app feels lively without making a parent wait.
 */

/** Fades and slides children up into place after `delay` ms. */
export function FadeInUp({
  delay = 0,
  distance = 14,
  style,
  children,
}: {
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(t, { toValue: 1, delay, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Drops in from above with a little bounce — for big moments (the letter plate, a stamp). */
export function DropIn({
  delay = 0,
  trigger,
  tilt = 0,
  style,
  children,
}: {
  delay?: number;
  /** Change this value to replay the drop (e.g. the current letter). */
  trigger?: unknown;
  tilt?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    t.setValue(0);
    Animated.spring(t, { toValue: 1, delay, useNativeDriver: true, speed: 12, bounciness: 14 }).start();
  }, [trigger]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }),
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
            { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1.15, 1] }) },
            { rotate: t.interpolate({ inputRange: [0, 1], outputRange: [`${tilt - 8}deg`, `${tilt}deg`] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** "Stamp" — slams down from large and slightly rotated, like a rubber stamp. */
export function Stamp({ delay = 0, tilt = 10, style, children }: { delay?: number; tilt?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(t, { toValue: 1, delay, useNativeDriver: true, speed: 20, bounciness: 10 }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
          transform: [
            { scale: t.interpolate({ inputRange: [0, 1], outputRange: [2.2, 1] }) },
            { rotate: t.interpolate({ inputRange: [0, 1], outputRange: [`${tilt + 20}deg`, `${tilt}deg`] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** Counts a number up from 0 — for final scores. Returns the current display value. */
export function useCountUp(target: number, duration = 700, delay = 0) {
  const [value, setValue] = React.useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target]);
  return value;
}
