import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.navy,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
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
        styles.cardShadow,
        {
          shadowColor: colors.navy,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.09,
          shadowRadius: 20,
          elevation: 5,
          borderRadius: 28,
        },
      ]}
      scaleDown={0.97}
    >
      {/* Card with subtle top-to-bottom gradient for depth */}
      <LinearGradient
        colors={['#FFFFFF', '#FDFAF7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.card,
          {
            borderRadius: 28,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Subtle top-edge highlight */}
        <View style={styles.topHighlight} />

        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconCircle, { backgroundColor: gameColor }]}>
            <Feather name={game.iconName as any} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerMiddle}>
            <Text style={[styles.gameName, { color: colors.foreground }]}>{game.name}</Text>
            <View style={[styles.energyBadge, { backgroundColor: softColor }]}>
              <Text style={[styles.energyBadgeText, { color: gameColor }]}>
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

        {/* Tags row — tinted with game soft colour */}
        <View style={styles.tagsRow}>
          <View style={[styles.tagChip, { backgroundColor: softColor }]}>
            <Feather
              name={game.hostType === 'App hosts' ? 'smartphone' : 'mic'}
              size={10}
              color={gameColor}
            />
            <Text style={[styles.tagText, { color: gameColor }]}>{game.hostType}</Text>
          </View>
          {game.settings.slice(0, 2).map((s) => (
            <View key={s} style={[styles.tagChip, { backgroundColor: softColor }]}>
              <Feather name={SETTING_ICONS[s] as any} size={10} color={gameColor} />
              <Text style={[styles.tagText, { color: gameColor }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* CTA row — gradient play pill */}
        <View style={styles.ctaRow}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playBtn}
          >
            <Text style={styles.playBtnText}>Play</Text>
            <Feather name="arrow-right" size={14} color="#FFF" />
          </LinearGradient>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    // shadow props set inline
  },
  card: {
    padding: 20,
    gap: 12,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMiddle: {
    flex: 1,
    marginLeft: 12,
    alignItems: 'flex-start',
    gap: 5,
  },
  gameName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  energyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  energyBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.1,
  },
  agesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  agesBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.1,
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
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 100,
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.2,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  playBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#FFF',
    letterSpacing: 0.1,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
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
