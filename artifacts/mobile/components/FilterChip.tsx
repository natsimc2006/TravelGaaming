import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export default function FilterChip({ label, selected, onPress, color }: FilterChipProps) {
  const colors = useColors();
  const activeColor = color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? activeColor : colors.muted,
          borderRadius: 100,
          opacity: pressed ? 0.75 : 1,
          borderWidth: selected ? 0 : 1,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? '#FFFFFF' : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
  },
});
