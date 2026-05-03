import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AnimatedPressable from '@/components/AnimatedPressable';
import { GAME_COLORS } from '@/data/gameColors';
import type { GameMeta } from '@/data/games';
import { useColors } from '@/hooks/useColors';

interface GameCardProps {
  game: GameMeta;
  compact?: boolean;
}

const SETTING_ICONS: Record<string, string> = {
  Car: 'navigation',
  Dinner: 'coffee',
  Waiting: 'clock',
  Bedtime: 'moon',
};

const ENERGY_META: Record<string, { label: string; emoji: string }> = {
  Calm: { label: 'Calm', emoji: '😴' },
  Medium: { label: 'Thinky', emoji: '🤔' },
  Chaotic: { label: 'Silly', emoji: '🤪' },
};

const SOFT_COLORS: Record<string, string> = {
  alphabet: '#FFE3D6',
  whatAmI: '#DDF7F4',
  categoryDash: '#ECE5FF',
  forbiddenWord: '#FFF3C4',
};

export default function GameCard({ game, compact = false }: GameCardProps) {
  const colors = useColors();
  const gameColor = GAME_COLORS[game.colorKey as keyof typeof GAME_COLORS] ?? colors.primary;
  const softColor = SOFT_COLORS[game.colorKey] ?? colors.muted;
  const energy = ENERGY_META[game.energyLevel];

  const handlePress = () => {
    router.push({ pathname: '/setup', params: { gameId: game.id } });
  };

  if (compact) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderRadius: 14,
            borderLeftWidth: 4,
            borderLeftColor: gameColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <View style={[styles.compactIcon, { backgroundColor: softColor }]}>
          <Feather name={game.iconName as any} size={20} color={gameColor} />
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: colors.foreground }]}>{game.name}</Text>
          <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>
            {game.settings[0]} · Ages {game.ageRange}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: softColor,
          borderRadius: 20,
          shadowColor: gameColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 4,
        },
      ]}
      scaleDown={0.97}
    >
      {/* Card header row */}
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: gameColor }]}>
          <Feather name={game.iconName as any} size={22} color="#FFF" />
        </View>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: '#FFF' + 'CC' }]}>
            <Text style={[styles.badgeText, { color: gameColor }]}>Ages {game.ageRange}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#FFF' + 'CC' }]}>
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
              {energy.emoji} {energy.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Name + description */}
      <Text style={[styles.gameName, { color: colors.foreground }]}>{game.name}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{game.description}</Text>

      {/* Footer row */}
      <View style={styles.footer}>
        <View style={styles.settingChips}>
          {game.settings.slice(0, 2).map(s => (
            <View key={s} style={[styles.settingChip, { backgroundColor: gameColor + '20' }]}>
              <Feather name={SETTING_ICONS[s] as any} size={10} color={gameColor} />
              <Text style={[styles.settingText, { color: gameColor }]}>{s}</Text>
            </View>
          ))}
          {game.hostType === 'App hosts' ? (
            <View style={[styles.settingChip, { backgroundColor: '#FFF' + 'CC' }]}>
              <Feather name="smartphone" size={10} color={colors.mutedForeground} />
              <Text style={[styles.settingText, { color: colors.mutedForeground }]}>App hosts</Text>
            </View>
          ) : (
            <View style={[styles.settingChip, { backgroundColor: '#FFF' + 'CC' }]}>
              <Feather name="mic" size={10} color={colors.mutedForeground} />
              <Text style={[styles.settingText, { color: colors.mutedForeground }]}>Reader needed</Text>
            </View>
          )}
        </View>
        <View style={[styles.playBtn, { backgroundColor: gameColor }]}>
          <Text style={styles.playBtnText}>Play now</Text>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  gameName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 10,
  },
  settingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  settingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 100,
  },
  settingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 100,
  },
  playBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: '#FFF',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  compactIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  compactMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});
