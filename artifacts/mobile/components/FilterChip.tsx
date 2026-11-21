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
  /** Share a row equally with sibling chips (e.g. a fixed set of 4). */
  stretch?: boolean;
}

/**
 * The one chip used everywhere. Unselected = white with a soft lift (no beige
 * outline); selected = solid ink. Keeping a single style is what makes
 * filters read as one system across screens.
 */
export default function FilterChip({ label, selected, onPress, icon, size = 'md', stretch = false }: FilterChipProps) {
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
          paddingHorizontal: stretch ? 6 : sm ? 13 : 15,
          ...(stretch ? { flex: 1, justifyContent: 'center' as const, gap: 5 } : null),
          paddingVertical: sm ? 7 : 9,
          backgroundColor: selected ? colors.navy : colors.card,
          shadowColor: colors.navy,
          shadowOpacity: selected ? 0.18 : 0.07,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      {icon && <Feather name={icon} size={sm ? 13 : 14} color={selected ? '#FFFFFF' : colors.mutedForeground} />}
      <Text style={[styles.label, { color: fg, fontSize: sm ? 13 : 14 }]} numberOfLines={1}>{label}</Text>
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
