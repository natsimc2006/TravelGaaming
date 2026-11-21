import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  label: string;
  onPress?: () => void;
  color: string;
  deep: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const SIZES = { sm: { v: 10, h: 18, f: 15 }, md: { v: 14, h: 16, f: 16 }, lg: { v: 18, h: 28, f: 21 } };

/** Tactile "press-down" button: a darker base shows underneath and collapses on press. */
export default function ChunkyButton({
  label, onPress, color, deep, textColor = '#FFFFFF', size = 'md', left, right, style, disabled,
}: Props) {
  const s = SIZES[size];
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { if (!disabled && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }}
      disabled={disabled}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <View style={{ backgroundColor: disabled ? '#D8CDBA' : deep, borderRadius: 18, paddingBottom: pressed ? 1 : 5, marginTop: pressed ? 4 : 0 }}>
          <View
            style={[
              styles.face,
              { backgroundColor: disabled ? '#ECE6DC' : color, paddingVertical: s.v, paddingHorizontal: s.h },
            ]}
          >
            {left}
            <Text style={[styles.label, { color: textColor, fontSize: s.f, flexShrink: 1, textAlign: 'center' }]}>{label}</Text>
            {right}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontFamily: 'BricolageGrotesque_800ExtraBold', letterSpacing: 0.2 },
});
