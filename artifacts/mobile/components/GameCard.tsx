import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

const ENERGY_BADGE: Record<string, { label: string; color: string }> = {
  Calm: { label: 'Calm', color: '#10B981' },
  Medium: { label: 'Medium', color: '#F59E0B' },
  Chaotic: { label: 'Chaotic', color: '#EF4444' },
};

export default function GameCard({ game, compact = false }: GameCardProps) {
  const colors = useColors();
  const gameColor = GAME_COLORS[game.colorKey as keyof typeof GAME_COLORS] ?? colors.primary;
  const energy = ENERGY_BADGE[game.energyLevel];

  const handlePress = () => {
    router.push({ pathname: '/setup', params: { gameId: game.id } });
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderLeftWidth: 4,
            borderLeftColor: gameColor,
            opacity: pressed ? 0.8 : 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        <View style={[styles.compactIcon, { backgroundColor: gameColor + '18' }]}>
          <Feather name={game.iconName as any} size={20} color={gameColor} />
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: colors.foreground }]}>{game.name}</Text>
          <Text style={[styles.compactMeta, { color: colors.mutedForeground }]}>
            {game.settings[0]} · {game.ageRange}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius + 4,
          opacity: pressed ? 0.82 : 1,
          shadowColor: gameColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 3,
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: gameColor + '14' }]}>
        <View style={[styles.iconCircle, { backgroundColor: gameColor }]}>
          <Feather name={game.iconName as any} size={24} color="#FFF" />
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.energyBadge, { backgroundColor: energy.color + '22' }]}>
            <Text style={[styles.energyLabel, { color: energy.color }]}>{energy.label}</Text>
          </View>
          {game.hostType === 'App hosts' && (
            <View style={[styles.hostBadge, { backgroundColor: colors.primary + '18' }]}>
              <Feather name="smartphone" size={10} color={colors.primary} />
              <Text style={[styles.hostLabel, { color: colors.primary }]}>App hosts</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.gameName, { color: colors.foreground }]}>{game.name}</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{game.description}</Text>

        <View style={styles.chips}>
          {game.settings.map(s => (
            <View key={s} style={[styles.chip, { backgroundColor: colors.muted }]}>
              <Feather name={SETTING_ICONS[s] as any} size={10} color={colors.mutedForeground} />
              <Text style={[styles.chipText, { color: colors.mutedForeground }]}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}–${game.maxPlayers}`} players
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{game.estimatedRoundLength}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="user" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Ages {game.ageRange}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  energyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  energyLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  hostLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  body: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  gameName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  compactMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});
