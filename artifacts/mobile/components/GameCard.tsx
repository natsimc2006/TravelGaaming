import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedPressable from '@/components/AnimatedPressable';
import ChunkyButton from '@/components/ChunkyButton';
import { GameTile } from '@/components/GameGlyph';
import { GAME_COLORS, GAME_COLORS_DEEP } from '@/data/gameColors';
import type { GameMeta } from '@/data/games';
import { useColors } from '@/hooks/useColors';

interface GameCardProps {
  game: GameMeta;
  compact?: boolean;
}

const ENERGY_LABEL: Record<string, string> = { Calm: 'Chill', Medium: 'Thinky', Chaotic: 'Silly' };

export default function GameCard({ game, compact = false }: GameCardProps) {
  const colors = useColors();
  const key = game.colorKey as keyof typeof GAME_COLORS;
  const gameColor = GAME_COLORS[key] ?? colors.primary;
  const deep = GAME_COLORS_DEEP[key] ?? colors.primaryDark;
  const soft = (colors as any)['gameSoft' + key.charAt(0).toUpperCase() + key.slice(1)] ?? colors.muted;

  const handlePress = () => router.push({ pathname: '/setup', params: { gameId: game.id } });

  if (compact) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <GameTile gameKey={key} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.compactName, { color: colors.foreground }]} numberOfLines={1}>{game.name}</Text>
          <Text style={[styles.compactMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
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
      scaleDown={0.97}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.navy }]}
    >
      <View style={[styles.band, { backgroundColor: soft }]}>
        <GameTile gameKey={key} size={58} />
        <View style={[styles.energy, { backgroundColor: colors.card }]}>
          <View style={[styles.dot, { backgroundColor: gameColor }]} />
          <Text style={[styles.energyText, { color: deep }]}>{ENERGY_LABEL[game.energyLevel]}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{game.name}</Text>
        <Text style={[styles.meta, { color: deep }]} numberOfLines={1}>
          Ages {game.ageRange} · {game.estimatedRoundLength}
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {game.description}
        </Text>
        <View style={styles.cta}>
          <ChunkyButton label="Play" size="sm" color={gameColor} deep={deep} onPress={handlePress} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  band: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  energy: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  energyText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
  body: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18, gap: 4 },
  name: { fontFamily: 'Fredoka_600SemiBold', fontSize: 21, letterSpacing: -0.2 },
  meta: { fontFamily: 'Nunito_700Bold', fontSize: 12.5 },
  description: { fontFamily: 'Nunito_400Regular', fontSize: 13.5, lineHeight: 19, marginTop: 4, minHeight: 38 },
  cta: { alignItems: 'flex-start', marginTop: 12 },
  compactCard: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 14, marginBottom: 10, borderRadius: 20, borderWidth: 1.5 },
  compactName: { fontFamily: 'Fredoka_600SemiBold', fontSize: 17 },
  compactMeta: { fontFamily: 'Nunito_600SemiBold', fontSize: 12.5, marginTop: 2 },
});
