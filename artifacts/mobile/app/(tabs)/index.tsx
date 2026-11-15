import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChunkyButton from '@/components/ChunkyButton';
import GameCard from '@/components/GameCard';
import Mascot from '@/components/Mascot';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import { useColors } from '@/hooks/useColors';
import { loadRecentGames } from '@/utils/storage';
import { loadFamilyStats, type FamilyStats } from '@/utils/progression';
import { getNewThisWeekCount } from '@/data/contentRelease';
import { getLocalPromptStats } from '@/utils/aiPromptEngine';
import { getSeenMap } from '@/utils/contentMemory';

const SUBTITLES = [
  "Ready to rescue the next 'I'm bored' moment?",
  "Press play. We'll run the brain.",
  'Car trip about to get competitive.',
  'Family games, hosted for you.',
  'Rules handled. Fun unlocked.',
  'No screen required. Just this one.',
];

const SECTIONS: {
  label: string;
  icon: string;
  micro: string;
  short: string;
  filter: (g: GameMeta) => boolean;
}[] = [
  {
    label: 'Perfect for the car',
    short: 'Car',
    icon: 'navigation',
    micro: 'Minimal props. Maximum distraction.',
    filter: g => g.settings.includes('Car' as GameSetting),
  },
  {
    label: 'Dinner table games',
    short: 'Dinner',
    icon: 'coffee',
    micro: 'For when everyone is technically still at the table.',
    filter: g => g.settings.includes('Dinner' as GameSetting),
  },
  {
    label: 'Waiting room games',
    short: 'Waiting',
    icon: 'clock',
    micro: 'Because queues build character. Apparently.',
    filter: g => g.settings.includes('Waiting' as GameSetting),
  },
  {
    label: 'Wind-down games',
    short: 'Wind-down',
    icon: 'moon',
    micro: 'Still fun. Just less feral.',
    filter: g => g.energyLevel === ('Calm' as EnergyLevel),
  },
];

const MOODS = [
  { label: 'Calm', value: 'Calm', color: '#35BDB2', line: 'Good choice. Peaceful chaos incoming.' },
  { label: 'Fun', value: 'Fun', color: '#FF6B3D', line: 'Fun mode: engaged. Hold on.' },
  { label: 'Focused', value: 'Medium', color: '#F7B731', line: 'The thinking caps are on.' },
  { label: 'Chaos', value: 'Chaotic', color: '#8B6EF6', line: "Manageable chaos. Probably." },
];

function NewPromptsTag() {
  const colors = useColors();
  const count = getNewThisWeekCount();
  if (count === 0) {
    return (
      <Text style={[newPromptStyles.line, { color: colors.mutedForeground }]}>
        New prompts added regularly
      </Text>
    );
  }
  return (
    <View style={[newPromptStyles.pill, { backgroundColor: colors.primarySoft }]}>
      <Text style={[newPromptStyles.pillText, { color: colors.primary }]}>
        {count} new prompts this week
      </Text>
    </View>
  );
}

const newPromptStyles = StyleSheet.create({
  line: { fontFamily: 'Nunito_400Regular', fontSize: 13 },
  pill: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
});

function RotatingSubtitle() {
  const colors = useColors();
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIndex(i => (i + 1) % SUBTITLES.length);
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Animated.Text style={[styles.subtitle, { color: colors.mutedForeground, opacity }]}>
      {SUBTITLES[index]}
    </Animated.Text>
  );
}

function MoodStrip() {
  const colors = useColors();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedMood = MOODS.find(m => m.value === selected);

  return (
    <View style={styles.moodSection}>
      <Text style={[styles.moodTitle, { color: colors.foreground }]}>What's the mood?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodRow}
      >
        {MOODS.map(m => {
          const isSelected = selected === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setSelected(v => v === m.value ? null : m.value)}
              style={({ pressed }) => [
                styles.moodPill,
                {
                  backgroundColor: isSelected ? colors.navy : colors.card,
                  borderColor: isSelected ? colors.navy : colors.border,
                  borderWidth: 1.5,
                  opacity: pressed ? 0.82 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <Text style={[styles.moodPillText, { color: isSelected ? '#FFF' : colors.mutedForeground }]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {selectedMood && (
        <Text style={[styles.moodLine, { color: colors.mutedForeground }]}>
          {selectedMood.line}
        </Text>
      )}
    </View>
  );
}

function FreshnessCard() {
  const colors = useColors();
  const stats = getLocalPromptStats();
  return (
    <Pressable
      onPress={() => router.push('/games')}
      style={({ pressed }) => [
        freshnessCardStyles.card,
        {
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.88 : 1,
          overflow: 'hidden',
        },
      ]}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.secondary, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />
      <View style={freshnessCardStyles.row}>
        <View style={[freshnessCardStyles.iconTile, { backgroundColor: colors.secondarySoft }]}>
          <Feather name="refresh-cw" size={16} color={colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[freshnessCardStyles.title, { color: colors.foreground }]}>Fresh prompts</Text>
          <Text style={[freshnessCardStyles.sub, { color: colors.mutedForeground }]}>
            New ideas mixed in so games stay varied.
          </Text>
        </View>
        <View style={[freshnessCardStyles.badge, { backgroundColor: colors.muted }]}>
          <Text style={[freshnessCardStyles.badgeNum, { color: colors.foreground }]}>{stats.total}</Text>
          <Text style={[freshnessCardStyles.badgeLabel, { color: colors.mutedForeground }]}>ready</Text>
        </View>
      </View>
    </Pressable>
  );
}

const freshnessCardStyles = StyleSheet.create({
  card: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2, lineHeight: 17 },
  badge: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 7, paddingHorizontal: 11, minWidth: 48 },
  badgeNum: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  badgeLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 10 },
});

function FamilyStatsCard({ stats }: { stats: FamilyStats }) {
  const colors = useColors();
  if (stats.totalGamesPlayed === 0) return null;

  return (
    <View style={[styles.statsCard, { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border }]}>
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hRow}
      snapToInterval={268}
      decelerationRate="fast"
    >
      {games.map(g => (
        <View key={g.id} style={{ width: 260, marginRight: 16 }}>
          <GameCard game={g} />
        </View>
      ))}
    </ScrollView>
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
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: loading ? 0.8 : 1,
        },
      ]}
    >
      <Feather name="zap" size={17} color={colors.primary} />
      <Text style={[styles.saveBtnText, { color: colors.foreground }]}>
        {loading ? 'Finding something fresh…' : 'Save the Moment'}
      </Text>
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

  const [sectionIdx, setSectionIdx] = useState(0);
  const recentGames = recentGameIds
    .map(id => GAMES.find(g => g.id === id))
    .filter(Boolean) as GameMeta[];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Open integrated header — no card box */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Mascot size={64} mood="cheer" />
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>Game Host</Text>
            <Text style={[styles.tagline, { color: colors.primary }]}>Pip runs the game. You just play.</Text>
          </View>
        </View>
        <RotatingSubtitle />
        <NewPromptsTag />
      </View>

      {/* CTAs */}
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

      {/* Freshness signal */}
      <FreshnessCard />

      {/* Family Stats */}
      {familyStats && <FamilyStatsCard stats={familyStats} />}

      {/* Mood strip */}
      <MoodStrip />

      {/* Recent */}
      {recentGames.length > 0 && (
        <View style={styles.section}>
          <SectionHeader label="Recently Played" micro="Back for more? Good taste." />
          {recentGames.slice(0, 2).map(g => (
            <GameCard key={g.id} game={g} compact />
          ))}
        </View>
      )}

      {/* Where are you? — one row, switchable, instead of four repeats */}
      <View style={styles.section}>
        <SectionHeader label="Where are you?" micro={SECTIONS[sectionIdx].micro} onPress={() => router.push('/games')} />
        <View style={styles.whereRow}>
          {SECTIONS.map((sec, i) => {
            const on = i === sectionIdx;
            return (
              <Pressable
                key={sec.label}
                onPress={() => setSectionIdx(i)}
                style={[styles.wherePill, { backgroundColor: on ? colors.navy : colors.card, borderColor: on ? colors.navy : colors.border }]}
              >
                <Feather name={sec.icon as any} size={14} color={on ? '#FFF' : colors.mutedForeground} />
                <Text style={[styles.wherePillText, { color: on ? '#FFF' : colors.mutedForeground }]}>{sec.short}</Text>
              </Pressable>
            );
          })}
        </View>
        <HorizontalGameRow games={GAMES.filter(SECTIONS[sectionIdx].filter)} />
      </View>

      {/* Packs teaser */}
      <Pressable
        onPress={() => router.push('/packs')}
        style={({ pressed }) => [
          styles.packTeaser,
          { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
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
        <Text style={[styles.viewAllText, { color: colors.primary }]}>View all games →</Text>
      </Pressable>
    </ScrollView>
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
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
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
  tagline: { fontFamily: 'Nunito_700Bold', fontSize: 13, marginTop: -2 },
  whereRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  wherePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, borderWidth: 1.5 },
  wherePillText: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
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
    paddingVertical: 15,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 16 },

  statsCard: { padding: 18, gap: 14 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statsIconTile: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statsTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1, gap: 3 },
  statValue: { fontFamily: 'Fredoka_600SemiBold', fontSize: 20 },
  statLabel: { fontFamily: 'Nunito_400Regular', fontSize: 12 },

  moodSection: { gap: 10 },
  moodTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
    paddingRight: 20,
  },
  moodPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  moodPillText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13 },
  moodLine: { fontFamily: 'Nunito_400Regular', fontSize: 13 },

  section: { gap: 12 },
  sectionHeader: { gap: 4 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 20, borderRadius: 2 },
  sectionTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 19, letterSpacing: -0.1 },
  seeAll: { fontFamily: 'Nunito_700Bold', fontSize: 13 },
  micro: { fontFamily: 'Nunito_400Regular', fontSize: 13, paddingLeft: 11 },
  hRow: { paddingBottom: 4, paddingRight: 4 },

  packTeaser: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  packIconTile: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  packTitle: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
  packSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  viewAllText: { fontFamily: 'Nunito_700Bold', fontSize: 14 },
});
