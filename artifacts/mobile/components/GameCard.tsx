import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export default function GameCard({ game, compact = false }: GameCardProps) {
  const colors = useColors();
  const gameColor = GAME_COLORS[game.colorKey as keyof typeof GAME_COLORS] ?? colors.primary;
  const energy = ENERGY_META[game.energyLevel];

  const handlePress = () => {
    router.push({ pathname: '/setup', params: { gameId: game.id } });
  };

  const getSoftColor = (key: string) => {
    const colorMap: Record<string, string> = {
      alphabet: colors.gameSoftAlphabet,
      whatAmI: colors.gameSoftWhatAmI,
      categoryDash: colors.gameSoftCategoryDash,
      forbiddenWord: colors.gameSoftForbiddenWord,
      wouldYouRather: colors.gameSoftWouldYouRather,
      rapidFire: colors.gameSoftRapidFire,
      guessTheSound: colors.gameSoftGuessTheSound,
      thisOrThat: colors.gameSoftThisOrThat,
      riddles: colors.gameSoftRiddles,
    };
    return colorMap[key] || colors.muted;
  };

  const softColor = getSoftColor(game.colorKey);

  if (compact) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.compactIcon, { backgroundColor: gameColor }]}>
          <Feather name={game.iconName as any} size={20} color="#FFFFFF" />
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
          backgroundColor: colors.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#0F0F1A',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 12,
          elevation: 3,
        },
      ]}
      scaleDown={0.97}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: gameColor }]}>
          <Feather name={game.iconName as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.headerMiddle}>
          <Text style={[styles.gameName, { color: colors.foreground }]}>{game.name}</Text>
          <View style={[styles.energyBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.energyBadgeText, { color: colors.mutedForeground }]}>
              {energy.emoji} {energy.label}
            </Text>
          </View>
        </View>
        <View style={[styles.agesBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.agesBadgeText, { color: colors.mutedForeground }]}>Ages {game.ageRange}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
        {game.description}
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{game.estimatedRoundLength}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="users" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {game.minPlayers === game.maxPlayers ? `${game.minPlayers}` : `${game.minPlayers}–${game.maxPlayers}`} players
          </Text>
        </View>
      </View>

      {/* Tags row */}
      <View style={styles.tagsRow}>
        <View style={[styles.tagChip, { backgroundColor: colors.muted }]}>
          <Feather
            name={game.hostType === 'App hosts' ? 'smartphone' : 'mic'}
            size={10}
            color={colors.mutedForeground}
          />
          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{game.hostType}</Text>
        </View>
        {game.settings.slice(0, 2).map((s) => (
          <View key={s} style={[styles.tagChip, { backgroundColor: colors.muted }]}>
            <Feather name={SETTING_ICONS[s] as any} size={10} color={colors.mutedForeground} />
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>{s}</Text>
          </View>
        ))}
      </View>

      {/* CTA row */}
      <View style={styles.ctaRow}>
        <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.playBtnText}>Play</Text>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 12,
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMiddle: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-start',
    gap: 4,
  },
  gameName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
  },
  energyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  energyBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  agesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  agesBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  ctaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
  },
  playBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
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
    width: 40,
    height: 40,
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