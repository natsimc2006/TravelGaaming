import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedPressable from '@/components/AnimatedPressable';
import { GAME_COLORS } from '@/data/gameColors';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import { useColors } from '@/hooks/useColors';

type SituationFilter = GameSetting | 'all';
type EnergyFilter = EnergyLevel | 'all';
type PlayersFilter = 'any' | 'solo' | 'duo' | 'group';
type HostFilter = 'any' | 'app' | 'reader';
type SortMode = 'best' | 'quickest' | 'newest' | 'popular';

const ENERGY_META: Record<string, { label: string; emoji: string }> = {
  Calm: { label: 'Calm', emoji: '😴' },
  Medium: { label: 'Thinky', emoji: '🤔' },
  Chaotic: { label: 'Lively', emoji: '🤪' },
};

function Pill({
  label,
  selected,
  onPress,
  color,
  small,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
  small?: boolean;
}) {
  const colors = useColors();
  const bg = selected ? colors.foreground : colors.card;
  const borderColor = selected ? colors.foreground : colors.border;
  const textColor = selected ? '#FFF' : colors.mutedForeground;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderRadius: 100,
        paddingHorizontal: small ? 12 : 16,
        paddingVertical: small ? 7 : 9,
        borderWidth: 1.5,
        borderColor: borderColor,
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text style={{
        fontFamily: 'Inter_600SemiBold',
        fontSize: small ? 12 : 13,
        color: textColor,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SortPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 100,
        backgroundColor: selected ? colors.foreground : 'transparent',
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={{
        fontFamily: selected ? 'Inter_700Bold' : 'Inter_500Medium',
        fontSize: 13,
        color: selected ? colors.background : colors.mutedForeground,
      }}>{label}</Text>
    </Pressable>
  );
}

function AllGameCard({ game }: { game: GameMeta }) {
  const colors = useColors();
  const gameColor = GAME_COLORS[game.colorKey as keyof typeof GAME_COLORS] ?? colors.primary;
  const energy = ENERGY_META[game.energyLevel];

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

  return (
    <AnimatedPressable
      onPress={() => router.push({ pathname: '/setup', params: { gameId: game.id } })}
      style={[styles.card, {
        backgroundColor: colors.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#15152B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
        marginBottom: 2,
      }]}
      scaleDown={0.97}
    >
      <View style={styles.cardInner}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.iconTile, { backgroundColor: softColor }]}>
            <Feather name={game.iconName as any} size={22} color={gameColor} />
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerRightTop}>
              <Text style={[styles.gameName, { color: colors.foreground }]}>{game.name}</Text>
              <View style={[styles.energyBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.energyBadgeText, { color: colors.mutedForeground }]}>
                  {energy.emoji} {energy.label}
                </Text>
              </View>
            </View>
            {game.soloSupported && (
              <View style={[styles.soloBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.soloBadgeText, { color: colors.mutedForeground }]}>Solo ✓</Text>
              </View>
            )}
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
          <View style={styles.metaItem}>
            <Feather name="user" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Ages {game.ageRange}</Text>
          </View>
        </View>

        {/* Badges row */}
        <View style={styles.badgeRow}>
          <View style={[styles.hostBadge, { backgroundColor: colors.muted }]}>
            <Feather
              name={game.hostType === 'App hosts' ? 'smartphone' : 'mic'}
              size={12}
              color={colors.mutedForeground}
            />
            <Text style={[styles.hostBadgeText, { color: colors.mutedForeground }]}>{game.hostType}</Text>
          </View>
          {game.settings.slice(0, 2).map((s) => (
            <View key={s} style={[styles.settingBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.settingBadgeText, { color: colors.mutedForeground }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Action row */}
        <View style={styles.actionRow}>
          <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.playBtnText}>Play now</Text>
            <Feather name="arrow-right" size={14} color="#FFF" />
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function applySort(games: GameMeta[], sort: SortMode): GameMeta[] {
  const sorted = [...games];
  switch (sort) {
    case 'quickest':
      return sorted.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    case 'popular':
      return sorted.sort((a, b) => (b.maxPlayers - a.maxPlayers));
    default:
      return sorted;
  }
}

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [situation, setSituation] = useState<SituationFilter>('all');
  const [energy, setEnergy] = useState<EnergyFilter>('all');
  const [players, setPlayers] = useState<PlayersFilter>('any');
  const [host, setHost] = useState<HostFilter>('any');
  const [sort, setSort] = useState<SortMode>('best');

  const filtered = GAMES.filter(g => {
    if (situation !== 'all' && !g.settings.includes(situation)) return false;
    if (energy !== 'all' && g.energyLevel !== energy) return false;
    if (players === 'solo' && !g.soloSupported) return false;
    if (players === 'duo' && g.minPlayers > 2) return false;
    if (players === 'group' && g.maxPlayers < 4) return false;
    if (host === 'app' && g.hostType !== 'App hosts') return false;
    if (host === 'reader' && g.hostType !== 'Reader needed') return false;
    return true;
  });

  const sorted = applySort(filtered, sort);

  const hasFilters = situation !== 'all' || energy !== 'all' || players !== 'any' || host !== 'any';

  const clearAll = () => {
    setSituation('all');
    setEnergy('all');
    setPlayers('any');
    setHost('any');
    setSort('best');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>All Games</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Pick a game. We'll do the hosting.
            </Text>
          </View>
        </View>

        {/* Sort bar */}
        <View style={[styles.sortBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
            {([
              { key: 'best', label: 'Best match' },
              { key: 'quickest', label: 'Quickest' },
              { key: 'newest', label: 'Newest' },
              { key: 'popular', label: 'Most popular' },
            ] as { key: SortMode; label: string }[]).map(s => (
              <SortPill
                key={s.key}
                label={s.label}
                selected={sort === s.key}
                onPress={() => setSort(s.key)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Filter rows */}
        <View style={[styles.filterBlock, { borderBottomColor: colors.border }]}>
          {/* Row 1: Situation */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Pill label="All situations" selected={situation === 'all'} onPress={() => setSituation('all')} small />
            <Pill label="🚗 Car" selected={situation === 'Car'} onPress={() => setSituation('Car')} color={colors.primary} small />
            <Pill label="🍽 Dinner" selected={situation === 'Dinner'} onPress={() => setSituation('Dinner')} color={colors.primary} small />
            <Pill label="⏳ Waiting" selected={situation === 'Waiting'} onPress={() => setSituation('Waiting')} color={colors.primary} small />
            <Pill label="😴 Bedtime" selected={situation === 'Bedtime'} onPress={() => setSituation('Bedtime')} color={colors.primary} small />
          </ScrollView>

          {/* Row 2: Energy + Players + Host */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Pill label="Any vibe" selected={energy === 'all'} onPress={() => setEnergy('all')} small />
            <Pill label="😴 Calm" selected={energy === 'Calm'} onPress={() => setEnergy('Calm')} color={colors.secondary} small />
            <Pill label="🤔 Thinky" selected={energy === 'Medium'} onPress={() => setEnergy('Medium')} color={colors.secondary} small />
            <Pill label="🤪 Lively" selected={energy === 'Chaotic'} onPress={() => setEnergy('Chaotic')} color={colors.secondary} small />
            <View style={styles.divider} />
            <Pill label="Solo ok" selected={players === 'solo'} onPress={() => setPlayers(v => v === 'solo' ? 'any' : 'solo')} color={colors.gameCategoryDash} small />
            <Pill label="2 players" selected={players === 'duo'} onPress={() => setPlayers(v => v === 'duo' ? 'any' : 'duo')} color={colors.gameCategoryDash} small />
            <Pill label="Group" selected={players === 'group'} onPress={() => setPlayers(v => v === 'group' ? 'any' : 'group')} color={colors.gameCategoryDash} small />
            <View style={styles.divider} />
            <Pill label="App hosts" selected={host === 'app'} onPress={() => setHost(v => v === 'app' ? 'any' : 'app')} color={colors.gameForbiddenWord} small />
            <Pill label="Reader" selected={host === 'reader'} onPress={() => setHost(v => v === 'reader' ? 'any' : 'reader')} color={colors.gameForbiddenWord} small />
          </ScrollView>
        </View>

        {/* Results list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {sorted.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🤷</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No perfect match.</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Family life remains unreasonable.
              </Text>
              <Pressable onPress={clearAll} style={[styles.showAllBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.showAllBtnText}>Show all games</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.resultMeta}>
                <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                  {sorted.length} game{sorted.length !== 1 ? 's' : ''} ready
                </Text>
                {hasFilters && (
                  <Pressable onPress={clearAll}>
                    <Text style={[styles.clearLink, { color: colors.primary }]}>Clear filters</Text>
                  </Pressable>
                )}
              </View>
              {sorted.map(g => <AllGameCard key={g.id} game={g} />)}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.3 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 2 },

  sortBar: { borderBottomWidth: 1, paddingBottom: 2 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 2,
  },

  filterBlock: { borderBottomWidth: 1, paddingBottom: 6 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 5,
  },
  divider: { width: 1, height: 18, backgroundColor: '#DDD', marginHorizontal: 2 },

  list: { padding: 16, gap: 14 },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultCount: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  clearLink: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },

  card: { overflow: 'hidden' },
  cardInner: {
    padding: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  headerRightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  gameName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  energyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  energyBadgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  soloBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  soloBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },

  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },

  metaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Inter_500Medium', fontSize: 12 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hostBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100,
  },
  hostBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  settingBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  settingBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100,
  },
  playBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#FFF' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 8 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center' },
  showAllBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  showAllBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#FFF' },
});