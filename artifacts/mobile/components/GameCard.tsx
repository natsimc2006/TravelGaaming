import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedPressable from '@/components/AnimatedPressable';
import ChunkyButton from '@/components/ChunkyButton';
import { GameTile } from '@/components/GameGlyph';
import { FadeInUp } from '@/components/Motion';
import { GAME_COLORS, GAME_COLORS_DEEP } from '@/data/gameColors';
import type { GameMeta } from '@/data/games';
import { VIBE_LABEL } from '@/data/taxonomy';
import { useColors } from '@/hooks/useColors';

interface GameCardProps {
  game: GameMeta;
  compact?: boolean;
  /** Dense row for long lists (All Games). */
  variant?: 'card' | 'list';
  /** Position in a list — staggers the entrance animation. */
  index?: number;
}

export default function GameCard({ game, compact = false, variant = 'card', index = 0 }: GameCardProps) {
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
        style={[styles.compactCard, { backgroundColor: colors.card, shadowColor: colors.navy }]}
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

  if (variant === 'list') {
    return (
      <FadeInUp delay={Math.min(index, 8) * 45}>
        <AnimatedPressable
          onPress={handlePress}
          scaleDown={0.98}
          style={[styles.listCard, { backgroundColor: colors.card, shadowColor: colors.navy }]}
        >
          <GameTile gameKey={key} size={58} delay={80 + Math.min(index, 8) * 45} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.listName, { color: colors.foreground }]} numberOfLines={1}>{game.name}</Text>
            <Text style={[styles.listDesc, { color: colors.foreground }]} numberOfLines={1}>
              {game.hook}
            </Text>
            <Text style={[styles.listMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
              {VIBE_LABEL[game.energyLevel]} · {game.ageRange} · {game.estimatedRoundLength}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </AnimatedPressable>
      </FadeInUp>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      scaleDown={0.97}
      style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.navy }]}
    >
      <View style={[styles.band, { backgroundColor: soft }]}>
        <GameTile gameKey={key} size={58} />
        <View style={[styles.energy, { backgroundColor: colors.card }]}>
          <View style={[styles.dot, { backgroundColor: gameColor }]} />
          <Text style={[styles.energyText, { color: deep }]}>{VIBE_LABEL[game.energyLevel]}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{game.name}</Text>
        <Text style={[styles.meta, { color: deep }]} numberOfLines={1}>
          Ages {game.ageRange} · {game.estimatedRoundLength}
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={1}>
          {game.hook}
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
    overflow: 'hidden',
    // overflow:hidden clips iOS shadows, so keep a faint ink hairline for edge definition
    borderWidth: 1,
    borderColor: 'rgba(42, 35, 80, 0.07)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  band: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  energy: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  energyText: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  body: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18, gap: 4 },
  name: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 21, letterSpacing: -0.2 },
  meta: { fontFamily: 'DMSans_700Bold', fontSize: 12.5 },
  description: { fontFamily: 'DMSans_400Regular', fontSize: 13.5, lineHeight: 19, marginTop: 4, minHeight: 38 },
  cta: { alignItems: 'flex-start', marginTop: 12 },
  compactCard: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 14, marginBottom: 10, borderRadius: 20, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  compactName: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 17 },
  compactMeta: { fontFamily: 'DMSans_500Medium', fontSize: 12.5, marginTop: 2 },
  listCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, paddingRight: 14, borderRadius: 22,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  listTileWrap: { borderRadius: 18, padding: 6 },
  listName: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 18, letterSpacing: -0.2 },
  listMeta: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  listDesc: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 19 },
  listPlay: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
