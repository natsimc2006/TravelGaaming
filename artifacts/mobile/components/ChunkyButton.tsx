import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

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
    <Pressable onPress={onPress} disabled={disabled} style={style}>
      {({ pressed }) => (
        <View style={{ backgroundColor: disabled ? '#CFC7D9' : deep, borderRadius: 18, paddingBottom: pressed ? 1 : 5, marginTop: pressed ? 4 : 0 }}>
          <View
            style={[
              styles.face,
              { backgroundColor: disabled ? '#E3DDEA' : color, paddingVertical: s.v, paddingHorizontal: s.h },
            ]}
          >
            {left}
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.label, { color: textColor, fontSize: s.f, flexShrink: 1 }]}>{label}</Text>
            {right}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { fontFamily: 'Fredoka_600SemiBold', letterSpacing: 0.2 },
});
