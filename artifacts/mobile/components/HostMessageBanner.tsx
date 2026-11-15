import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface HostMessageBannerProps {
  message: string;
  color?: string;
  visible: boolean;
}

export default function HostMessageBanner({ message, color, visible }: HostMessageBannerProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const accentColor = color ?? colors.secondary;

  useEffect(() => {
    if (visible && message) {
      opacity.setValue(0);
      translateY.setValue(-8);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 30, bounciness: 2 }),
      ]).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [message, visible]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: accentColor + '18',
          borderLeftColor: accentColor,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.text, { color: accentColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderLeftWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
