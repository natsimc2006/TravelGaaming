import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: PrimaryButtonProps) {
  const colors = useColors();

  const bg: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    ghost: 'transparent',
    danger: colors.destructive,
    success: colors.success,
  };

  const fg: Record<string, string> = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    ghost: colors.foreground,
    danger: colors.destructiveForeground,
    success: '#FFFFFF',
  };

  const borderColor: Record<string, string | undefined> = {
    ghost: colors.border,
  };

  const paddingV: Record<string, number> = { sm: 10, md: 14, lg: 18, xl: 22 };
  const paddingH: Record<string, number> = { sm: 16, md: 20, lg: 28, xl: 36 };
  const fontSize: Record<string, number> = { sm: 14, md: 16, lg: 18, xl: 20 };

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg[variant],
          paddingVertical: paddingV[size],
          paddingHorizontal: paddingH[size],
          borderRadius: colors.radius,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: borderColor[variant],
          alignSelf: fullWidth ? 'stretch' : 'auto',
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={fg[variant]} size="small" />
        ) : (
          <>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text
              style={[
                styles.label,
                { color: fg[variant], fontSize: fontSize[size] },
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    textAlign: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
