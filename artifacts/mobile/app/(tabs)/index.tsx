import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChunkyButton from '@/components/ChunkyButton';
import FadeScrollRow from '@/components/FadeScrollRow';
import FilterChip from '@/components/FilterChip';
import GameCard from '@/components/GameCard';
import StatusBarScrim from '@/components/StatusBarScrim';
import Mascot from '@/components/Mascot';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import { SITUATIONS, VIBES, VIBE_LABEL } from '@/data/taxonomy';
import { useColors } from '@/hooks/useColors';
import { loadRecentGames } from '@/utils/storage';
import { loadFamilyStats, type FamilyStats } from '@/utils/progression';
import { getNewThisWeekCount } from '@/data/contentRelease';
import { getSeenMap } from '@/utils/contentMemory';

const VIBE_LINES: Record<string, string> = {
  Calm: 'Good choice. Peaceful chaos incoming.',
  Medium: 'The thinking caps are on.',
  Chaotic: 'Manageable chaos. Probably.',
};

function NewPromptsTag() {
  const colors = useColors();
  const count = getNewThisWeekCount();
  if (count === 0) return null;
  return (
    <View style={[newPromptStyles.pill, { backgroundColor: colors.primarySoft }]}>
      <Text style={[newPromptStyles.pillText, { color: colors.primaryText }]}>
        {count} new prompts this week
      </Text>
    </View>
  );
}

const newPromptStyles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
});

function FamilyStatsCard({ stats }: { stats: FamilyStats }) {
  const colors = useColors();
  if (stats.totalGamesPlayed === 0) return null;

  return (
    <View style={[styles.statsCard, { backgroundColor: colors.card, borderRadius: 20, shadowColor: colors.navy }]}>
      <View style={styles.statsHeader}>
        <View style={[styles.statsIconTile, { backgroundColor: colors.primarySoft }]}>
          <Feather name="bar-chart-2" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.statsTitle, { color: colors.foreground }]}>Family Stats</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalGamesPlayed}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Games played</Text>
        </View>
        {stats.favouriteGameName && (
          <View style={[styles.statItem, { flex: 2 }]}>
            <Text style={[styles.statValue, { color: colors.primary }]} numberOfLines={1}>
              {stats.favouriteGameName}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Favourite game</Text>
          </View>
        )}
        {stats.longestStreak > 0 && (
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.longestStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Best streak</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function HorizontalGameRow({ games }: { games: GameMeta[] }) {
  return (
    <FadeScrollRow
      style={styles.hRowBleed}
      contentContainerStyle={styles.hRow}
      snapToInterval={276}
      decelerationRate="fast"
    >
      {games.map(g => (
        <View key={g.id} style={{ width: 260, marginRight: 16 }}>
          <GameCard game={g} />
        </View>
      ))}
    </FadeScrollRow>
  );
}

const PROMPT_COUNTS: Record<string, number> = {
  'what-am-i': 40,
  'alphabet-showdown': 51,
  'category-dash': 40,
  'forbidden-word': 40,
};

function QuickPlayButton() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  const handleQuickPlay = async () => {
    setLoading(true);

    const [recent, seenMap] = await Promise.all([
      loadRecentGames(),
      getSeenMap(),
    ]);

    await new Promise(r => setTimeout(r, 900));

    const lastPlayedId = recent[0];
    const candidates = GAMES.filter(g => g.id !== lastPlayedId);

    const weights = candidates.map(g => {
      const total = PROMPT_COUNTS[g.id] ?? 20;
      const seenCount = Object.values(seenMap).filter(r => r.lastGameId === g.id).length;
      const freshCount = Math.max(1, total - seenCount);
      return freshCount;
    });

    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let rand = Math.random() * totalWeight;
    let pick = candidates[0];
    for (let i = 0; i < candidates.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { pick = candidates[i]; break; }
    }

    setLoading(false);
    router.push({ pathname: '/setup', params: { gameId: pick.id, quick: '1' } });
  };

  return (
    <Pressable
      onPress={handleQuickPlay}
      disabled={loading}
      style={({ pressed }) => [
        styles.saveBtn,
        {
          backgroundColor: colors.card,
          shadowColor: colors.navy,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: loading ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.saveIcon, { backgroundColor: colors.primarySoft }]}>
        <Feather name="zap" size={16} color={colors.primaryText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.saveBtnText, { color: colors.foreground }]}>
          {loading ? 'Finding something fresh…' : 'Save the Moment'}
        </Text>
        <Text style={[styles.saveBtnSub, { color: colors.mutedForeground }]}>Pip picks a game for you, instantly</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);

  useEffect(() => {
    loadRecentGames().then(setRecentGameIds);
    loadFamilyStats().then(setFamilyStats);
  }, []);

  const [situation, setSituation] = useState<GameSetting>('Car');
  const [vibe, setVibe] = useState<EnergyLevel | null>(null);
  const recentGames = recentGameIds
    .map(id => GAMES.find(g => g.id === id))
    .filter(Boolean) as GameMeta[];
  const situationMeta = SITUATIONS.find(s => s.value === situation)!;
  const pickedGames = GAMES.filter(
    g => g.settings.includes(situation) && (!vibe || g.energyLevel === vibe),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header — one clear tagline */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Mascot size={64} mood="cheer" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.appName, { color: colors.foreground }]}>Game Host</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Pip runs the game. You just play.</Text>
          </View>
        </View>
        <NewPromptsTag />
      </View>

      {/* CTAs — one primary, one clearly secondary */}
      <View style={styles.ctas}>
        <ChunkyButton
          label="Start a Game"
          size="lg"
          color={colors.primary}
          deep={colors.primaryDark}
          left={<Feather name="play" size={20} color="#FFF" />}
          onPress={() => router.push('/games')}
        />
        <QuickPlayButton />
      </View>

      {/* Family Stats */}
      {familyStats && <FamilyStatsCard stats={familyStats} />}

      {/* Recent */}
      {recentGames.length > 0 && (
        <View style={styles.section}>
          <SectionHeader label="Recently Played" micro="Back for more? Good taste." />
          {recentGames.slice(0, 2).map(g => (
            <GameCard key={g.id} game={g} compact />
          ))}
        </View>
      )}

      {/* Where are you? + vibe — same names as All Games */}
      <View style={styles.section}>
        <SectionHeader label="Where are you?" micro={situationMeta.micro} onPress={() => router.push('/games')} />
        <View style={styles.chipWrap}>
          {SITUATIONS.map(sit => (
            <FilterChip
              key={sit.value}
              label={sit.label}
              icon={sit.icon as any}
              selected={situation === sit.value}
              onPress={() => setSituation(sit.value)}
            />
          ))}
        </View>
        <View style={styles.vibeRow}>
          <Text style={[styles.vibeLabel, { color: colors.mutedForeground }]}>Vibe</Text>
          {VIBES.map(v => (
            <FilterChip
              key={v.value}
              size="sm"
              label={v.label}
              selected={vibe === v.value}
              onPress={() => setVibe(cur => (cur === v.value ? null : v.value))}
            />
          ))}
        </View>
        {vibe && (
          <Text style={[styles.moodLine, { color: colors.mutedForeground }]}>{VIBE_LINES[vibe]}</Text>
        )}
        {pickedGames.length > 0 ? (
          <HorizontalGameRow games={pickedGames} />
        ) : (
          <Pressable onPress={() => setVibe(null)} style={[styles.emptyRow, { backgroundColor: colors.muted }]}>
            <Text style={[styles.emptyRowText, { color: colors.mutedForeground }]}>
              Nothing {VIBE_LABEL[vibe!].toLowerCase()} for {situationMeta.label.toLowerCase()} yet.{' '}
              <Text style={{ color: colors.primaryText }}>Show all vibes</Text>
            </Text>
          </Pressable>
        )}
      </View>

      {/* Packs teaser */}
      <Pressable
        onPress={() => router.push('/packs')}
        style={({ pressed }) => [
          styles.packTeaser,
          { backgroundColor: colors.card, borderRadius: 20, shadowColor: colors.navy, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.packIconTile, { backgroundColor: colors.primarySoft }]}>
          <Feather name="gift" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.packTitle, { color: colors.foreground }]}>More Games on the Way</Text>
          <Text style={[styles.packSub, { color: colors.mutedForeground }]}>
            Road Trip, Bedtime, Big Family packs coming soon
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>

      {/* View all games */}
      <Pressable
        onPress={() => router.push('/games')}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, alignItems: 'center', paddingVertical: 8 })}
      >
        <Text style={[styles.viewAllText, { color: colors.primaryText }]}>View all games →</Text>
      </Pressable>
    </ScrollView>
    <StatusBarScrim />
    </View>
  );
}

function SectionHeader({
  label,
  micro,
  onPress,
}: {
  label: string;
  micro: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.sectionTitleRow}>
          {/* Decorative accent mark */}
          <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{label}</Text>
        </View>
        {onPress && (
          <Text style={[styles.seeAll, { color: colors.primaryText }]}>See all</Text>
        )}
      </View>
      <Text style={[styles.micro, { color: colors.mutedForeground }]}>{micro}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 28 },

  header: { gap: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tagline: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, marginTop: -2 },
  chipWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  vibeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  vibeLabel: { fontFamily: 'Nunito_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 },
  emptyRow: { borderRadius: 18, padding: 18 },
  emptyRowText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, lineHeight: 20 },
  logoIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  appName: { fontFamily: 'Fredoka_600SemiBold', fontSize: 32, letterSpacing: -0.5 },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },

  ctas: { gap: 10 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 20,
    paddingVertical: 19,
  },
  startBtnText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 18, color: '#FFF', letterSpacing: 0.1 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  saveIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15 },
  saveBtnSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 1 },

  statsCard: { padding: 18, gap: 14, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statsIconTile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statsTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1, gap: 3 },
  statValue: { fontFamily: 'Fredoka_600SemiBold', fontSize: 20 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12 },

  moodLine: { fontFamily: 'Nunito_400Regular', fontSize: 13 },

  section: { gap: 12 },
  sectionHeader: { gap: 4 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 20, borderRadius: 2 },
  sectionTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 19, letterSpacing: -0.1 },
  seeAll: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  micro: { fontFamily: 'Nunito_400Regular', fontSize: 13, paddingLeft: 11 },
  hRowBleed: { marginHorizontal: -20 },
  hRow: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 18 },

  packTeaser: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  packIconTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  packTitle: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  packSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  viewAllText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
