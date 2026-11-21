import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedPressable from '@/components/AnimatedPressable';
import ChunkyButton from '@/components/ChunkyButton';
import FilterChip from '@/components/FilterChip';
import GameCard from '@/components/GameCard';
import { GameTile } from '@/components/GameGlyph';
import StatusBarScrim from '@/components/StatusBarScrim';
import Mascot from '@/components/Mascot';
import { FadeInUp } from '@/components/Motion';
import Sticker, { useBob } from '@/components/Sticker';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import type { GameColorKey } from '@/data/gameColors';
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
  pillText: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
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

/** Games for the chosen situation as a sticker sheet. Re-mounts (and re-animates) when the situation changes. */
function StickerGrid({ games }: { games: GameMeta[] }) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const cellW = Math.floor((width - 40) / 3);
  return (
    <View style={styles.stickerGrid}>
      {games.slice(0, 6).map((g, i) => (
        <AnimatedPressable
          key={g.id}
          onPress={() => router.push({ pathname: '/setup', params: { gameId: g.id } })}
          scaleDown={0.92}
          style={[styles.stickerCell, { width: cellW }]}
        >
          <GameTile gameKey={g.colorKey as GameColorKey} size={88} delay={60 + i * 70} />
          <Text style={[styles.stickerName, { color: colors.foreground }]} numberOfLines={2}>{g.name}</Text>
        </AnimatedPressable>
      ))}
    </View>
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

    await new Promise(r => setTimeout(r, 600));

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
    <View style={{ gap: 6 }}>
      <ChunkyButton
        label={loading ? 'Pip is picking…' : 'Gimme a game!'}
        size="lg"
        color={colors.primary}
        deep={colors.primaryDark}
        onPress={handleQuickPlay}
        disabled={loading}
      />
      <Text style={[styles.dockNote, { color: colors.mutedForeground }]}>Pip picks one for wherever you are</Text>
    </View>
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

  const pipBob = useBob(3, 1500);
  const { width } = useWindowDimensions();
  const optionW = Math.floor((width - 40 - 40 - 8) / 2);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 18, paddingBottom: 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <FadeInUp style={styles.header}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.appName, { color: colors.foreground }]}>Gimme a Game</Text>
          <Text style={[styles.tagline, { color: colors.primary }]}>For bored kids and busy parents.</Text>
          <NewPromptsTag />
        </View>
        <Animated.View style={pipBob}>
          <Sticker size={70} fill={colors.sunshineSoft} tilt={6} delay={250}>
            <Mascot size={52} mood="cheer" />
          </Sticker>
        </Animated.View>
      </FadeInUp>

      {/* Where's the family today? */}
      <FadeInUp delay={80} style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={[styles.heroStamp, { borderColor: colors.sunshine }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Feather name={situationMeta.icon as any} size={20} color={colors.sunshine} />
        </View>
        <Text style={styles.heroKicker}>WHERE ARE WE?</Text>
        <Text style={styles.heroTitle}>Where's the family today?</Text>
        <View style={styles.heroGrid}>
          {SITUATIONS.map(sit => {
            const on = situation === sit.value;
            return (
              <AnimatedPressable
                key={sit.value}
                onPress={() => setSituation(sit.value)}
                scaleDown={0.94}
                style={[styles.heroOption, { width: optionW, backgroundColor: on ? colors.sunshine : 'rgba(255,255,255,0.14)' }]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[styles.heroOptionText, { color: on ? colors.foreground : '#FFFFFF' }]}>{sit.homeLabel}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </FadeInUp>

      {/* Games for this situation */}
      <FadeInUp delay={160} style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{situationMeta.goodFor}</Text>
          <Pressable onPress={() => router.push('/games')} hitSlop={10}>
            <Text style={[styles.seeAll, { color: colors.primaryText }]}>See all 9</Text>
          </Pressable>
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
        {vibe && <Text style={[styles.pipNote, { color: colors.primary }]}>{VIBE_LINES[vibe]}</Text>}
        {pickedGames.length > 0 ? (
          <StickerGrid key={`${situation}-${vibe ?? 'any'}`} games={pickedGames} />
        ) : (
          <Pressable onPress={() => setVibe(null)} style={[styles.emptyRow, { backgroundColor: colors.muted }]}>
            <Text style={[styles.emptyRowText, { color: colors.mutedForeground }]}>
              Nothing {VIBE_LABEL[vibe!].toLowerCase()} for {situationMeta.label.toLowerCase()} yet.{' '}
              <Text style={{ color: colors.primaryText }}>Show all vibes</Text>
            </Text>
          </Pressable>
        )}
      </FadeInUp>

      {/* Recent */}
      {recentGames.length > 0 && (
        <FadeInUp delay={240} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Played lately</Text>
          {recentGames.slice(0, 2).map(g => (
            <GameCard key={g.id} game={g} compact />
          ))}
        </FadeInUp>
      )}

      {/* Family Stats */}
      {familyStats && <FamilyStatsCard stats={familyStats} />}

      {/* Packs teaser */}
      <Pressable
        onPress={() => router.push('/packs')}
        style={({ pressed }) => [
          styles.packTeaser,
          { backgroundColor: colors.card, borderRadius: 20, shadowColor: colors.navy, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.packIconTile, { backgroundColor: colors.coralSoft }]}>
          <Feather name="gift" size={18} color={colors.coral} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.packTitle, { color: colors.foreground }]}>More games on the way</Text>
          <Text style={[styles.packSub, { color: colors.mutedForeground }]}>
            Road Trip, Bedtime and Big Family packs coming soon
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Pressable>
    </ScrollView>

    {/* The app's main action is always in reach */}
    <View style={[styles.dock, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
      <QuickPlayButton />
    </View>
    <StatusBarScrim />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 26 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tagline: { fontFamily: 'Caveat_600SemiBold', fontSize: 23, transform: [{ rotate: '-1.5deg' }], marginLeft: 2 },
  pipNote: { fontFamily: 'Caveat_600SemiBold', fontSize: 20 },
  dockNote: { fontFamily: 'Caveat_600SemiBold', fontSize: 18, textAlign: 'center' },
  dock: { paddingHorizontal: 20, paddingTop: 10 },
  heroCard: { borderRadius: 24, padding: 20, gap: 12, overflow: 'hidden' },
  heroStamp: {
    position: 'absolute', top: 16, right: 16, width: 50, height: 58, borderRadius: 8,
    borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }],
  },
  heroKicker: { fontFamily: 'DMSans_700Bold', fontSize: 12, letterSpacing: 2, color: '#CBE3EE' },
  heroTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 28, lineHeight: 30, color: '#FFFFFF', maxWidth: 240, letterSpacing: -0.5 },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  heroOption: { borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  heroOptionText: { fontFamily: 'DMSans_700Bold', fontSize: 15 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18, marginTop: 6 },
  stickerCell: { alignItems: 'center', gap: 10 },
  stickerName: { fontFamily: 'DMSans_700Bold', fontSize: 14, textAlign: 'center', lineHeight: 18, paddingHorizontal: 4 },
  chipWrap: { flexDirection: 'row', gap: 6 },
  vibeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  vibeLabel: { fontFamily: 'DMSans_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, marginRight: 4 },
  emptyRow: { borderRadius: 18, padding: 18 },
  emptyRowText: { fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 20 },
  logoIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  appName: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 34, letterSpacing: -1, lineHeight: 38 },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
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
  startBtnText: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 18, color: '#FFF', letterSpacing: 0.1 },
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
  saveBtnText: { fontFamily: 'DMSans_700Bold', fontSize: 15 },
  saveBtnSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, marginTop: 1 },

  statsCard: { padding: 18, gap: 14, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statsIconTile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statsTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1, gap: 3 },
  statValue: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 20 },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 12 },

  moodLine: { fontFamily: 'DMSans_400Regular', fontSize: 13 },

  section: { gap: 12 },
  sectionHeader: { gap: 4 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 20, borderRadius: 2 },
  sectionTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22, letterSpacing: -0.4 },
  seeAll: { fontFamily: 'DMSans_700Bold', fontSize: 13 },
  micro: { fontFamily: 'DMSans_400Regular', fontSize: 13, paddingLeft: 11 },
  hRowBleed: { marginHorizontal: -20 },
  hRow: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 18 },

  packTeaser: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  packIconTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  packTitle: { fontFamily: 'DMSans_700Bold', fontSize: 14 },
  packSub: { fontFamily: 'DMSans_400Regular', fontSize: 12, marginTop: 2 },
  viewAllText: { fontFamily: 'DMSans_700Bold', fontSize: 14 },
});
