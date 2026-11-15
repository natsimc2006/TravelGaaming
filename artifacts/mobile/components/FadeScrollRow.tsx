import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props extends Omit<ScrollViewProps, 'horizontal'> {
  children: React.ReactNode;
  /** Colour the edge fades into — should match what sits behind the row. */
  fadeColor?: string;
  fadeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Horizontal scroll row with soft edge fades that only appear when there is
 * more content in that direction — makes "swipe for more" obvious.
 */
export default function FadeScrollRow({
  children,
  fadeColor,
  fadeWidth = 36,
  style,
  onScroll,
  ...rest
}: Props) {
  const colors = useColors();
  const bg = fadeColor ?? colors.background;
  const [viewW, setViewW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [x, setX] = useState(0);

  const overflow = contentW > viewW + 2;
  const showRight = overflow && x + viewW < contentW - 4;
  const showLeft = overflow && x > 4;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setX(e.nativeEvent.contentOffset.x);
    onScroll?.(e);
  };

  return (
    <View style={style} onLayout={(e: LayoutChangeEvent) => setViewW(e.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={w => setContentW(w)}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        {...rest}
      >
        {children}
      </ScrollView>
      {showLeft && (
        <LinearGradient
          pointerEvents="none"
          colors={[bg, withAlpha(bg, 0)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fade, { left: 0, width: fadeWidth * 0.6 }]}
        />
      )}
      {showRight && (
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(bg, 0), bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fade, { right: 0, width: fadeWidth }]}
        />
      )}
    </View>
  );
}

function withAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, bottom: 0 },
});
