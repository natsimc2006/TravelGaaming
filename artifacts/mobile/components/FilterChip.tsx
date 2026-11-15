import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  size?: 'sm' | 'md';
}

/**
 * The one chip used everywhere. Unselected = white with a soft lift (no beige
 * outline); selected = solid ink. Keeping a single style is what makes
 * filters read as one system across screens.
 */
export default function FilterChip({ label, selected, onPress, icon, size = 'md' }: FilterChipProps) {
  const colors = useColors();
  const fg = selected ? '#FFFFFF' : colors.foreground;
  const sm = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          paddingHorizontal: sm ? 13 : 15,
          paddingVertical: sm ? 7 : 9,
          backgroundColor: selected ? colors.navy : colors.card,
          shadowColor: colors.navy,
          shadowOpacity: selected ? 0.18 : 0.07,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      {icon && <Feather name={icon} size={sm ? 13 : 14} color={selected ? '#FFFFFF' : colors.mutedForeground} />}
      <Text style={[styles.label, { color: fg, fontSize: sm ? 13 : 14 }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  label: { fontFamily: 'Nunito_700Bold' },
});
