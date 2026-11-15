import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface TimerProps {
  seconds: number;
  running: boolean;
  onEnd?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function Timer({ seconds, running, onEnd, size = 'md' }: TimerProps) {
  const colors = useColors();
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            onEnd?.();
            return 0;
          }
          if (prev <= 6) pulse();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onEnd, pulse]);

  const pct = remaining / seconds;
  const timerColor =
    pct > 0.5 ? colors.timerNormal :
    pct > 0.25 ? colors.timerWarning :
    colors.timerDanger;

  const fontSizes: Record<string, number> = { sm: 18, md: 26, lg: 40 };
  const sizes: Record<string, number> = { sm: 60, md: 92, lg: 120 };
  const strokeW: Record<string, number> = { sm: 4, md: 5, lg: 6 };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const displayTime = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${remaining}`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: sizes[size],
          height: sizes[size],
          borderRadius: sizes[size] / 2,
          borderWidth: strokeW[size],
          borderColor: timerColor,
          backgroundColor: timerColor + '18',
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.text, { color: timerColor, fontSize: fontSizes[size], maxWidth: sizes[size] - 20 }]}>
        {displayTime}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Fredoka_600SemiBold',
    textAlign: 'center',
  },
});
