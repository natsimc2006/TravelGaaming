import { Feather } from '@expo/vector-icons';
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
import GameCard from '@/components/GameCard';
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
  filter: (g: GameMeta) => boolean;
}[] = [
  {
    label: 'Perfect for the car',
    icon: 'navigation',
    micro: 'Minimal props. Maximum distraction.',
    filter: g => g.settings.includes('Car' as GameSetting),
  },
  {
    label: 'Dinner table games',
    icon: 'coffee',
    micro: 'For when everyone is technically still at the table.',
    filter: g => g.settings.includes('Dinner' as GameSetting),
  },
  {
    label: 'Waiting room games',
    icon: 'clock',
    micro: 'Because queues build character. Apparently.',
    filter: g => g.settings.includes('Waiting' as GameSetting),
  },
  {
    label: 'Wind-down games',
    icon: 'moon',
    micro: 'Still fun. Just less feral.',
    filter: g => g.energyLevel === ('Calm' as EnergyLevel),
  },
];

const MOODS = [
  { label: '😴 Calm', value: 'Calm', color: '#4ECDC4', line: 'Good choice. Peaceful chaos incoming.' },
  { label: '😄 Fun', value: 'Fun', color: '#FF6B3D', line: 'Fun mode: engaged. Hold on.' },
  { label: '⚡ Focused', value: 'Medium', color: '#F59E0B', line: 'The thinking caps are on.' },
  { label: '🤪 Chaos', value: 'Chaotic', color: '#8B5CF6', line: "Good choice. We'll keep the chaos at a manageable level." },
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
    <View style={[newPromptStyles.pill, { backgroundColor: colors.primary + '18' }]}>
      <Text style={[newPromptStyles.pillText, { color: colors.primary }]}>
        ✨ {count} new prompts this week
      </Text>
    </View>
  );
}

const newPromptStyles = StyleSheet.create({
  line: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' },
  pill: { borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
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
        contentContainerStyle={[styles.moodRow, { paddingHorizontal: 6 }]}
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
                  backgroundColor: isSelected ? colors.foreground : colors.card,
                  borderColor: isSelected ? colors.foreground : colors.border,
                  borderWidth: 1.5,
                  opacity: pressed ? 0.82 : 1,
                  transform: [{ scale: pressed ? 0.96 : isSelected ? 1.04 : 1 }],
                  shadowColor: isSelected ? m.color : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: isSelected ? 3 : 0,
                },
              ]}
            >
              <Text style={[styles.moodPillText, { color: isSelected ? '#FFF' : colors.foreground }]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {selectedMood && (
        <Text style={[styles.moodLine, { color: selectedMood.color }]}>
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
        { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.88 : 1, overflow: 'hidden' },
      ]}
    >
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.secondary, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }} />
      <View style={freshnessCardStyles.row}>
        <Text style={{ fontSize: 24 }}>✨</Text>
        <View style={{ flex: 1 }}>
          <Text style={[freshnessCardStyles.title, { color: colors.foreground }]}>Fresh prompts</Text>
          <Text style={[freshnessCardStyles.sub, { color: colors.mutedForeground }]}>
            New ideas are mixed in so games never feel recycled.
          </Text>
        </View>
        <View style={[freshnessCardStyles.pill, { backgroundColor: colors.secondary }]}>
          <Text style={freshnessCardStyles.pillText}>{stats.total}</Text>
          <Text style={freshnessCardStyles.pillLabel}>ready</Text>
        </View>
      </View>
    </Pressable>
  );
}

const freshnessCardStyles = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2, lineHeight: 17 },
  pill: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, minWidth: 52 },
  pillText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFF' },
  pillLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: '#FFF', opacity: 0.85 },
});

function AISettingsHint() {
  const colors = useColors();
  return (
    <View style={[aiStyles.card, { backgroundColor: colors.card, borderRadius: 18, borderColor: colors.border, borderWidth: 1 }]}>
      <View style={aiStyles.row}>
        <View style={[aiStyles.icon, { backgroundColor: colors.gameCategoryDash + '18' }]}>
          <Text style={{ fontSize: 18 }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[aiStyles.title, { color: colors.foreground }]}>AI fresh prompts</Text>
          <Text style={[aiStyles.sub, { color: colors.mutedForeground }]}>
            Coming soon: fresh AI-generated rounds, family-safe only.
          </Text>
        </View>
        <View style={[aiStyles.badge, { backgroundColor: colors.gameCategoryDash + '18' }]}>
          <Text style={[aiStyles.badgeText, { color: colors.gameCategoryDash }]}>Soon</Text>
        </View>
      </View>
    </View>
  );
}

const aiStyles = StyleSheet.create({
  card: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2, lineHeight: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  badgeText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
});

function FamilyStatsCard({ stats }: { stats: FamilyStats }) {
  const colors = useColors();
  if (stats.totalGamesPlayed === 0) return null;

  return (
    <View style={[styles.statsCard, { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border }]}>
      <View style={styles.statsHeader}>
        <Text style={{ fontSize: 20 }}>📊</Text>
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
        <View key={g.id} style={{ width: 252, marginRight: 16 }}>
          <GameCard game={g} />
        </View>
      ))}
    </ScrollView>
  );
}

// Prompt counts per game — kept in sync with getLocalPromptStats()
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

    // Avoid replaying the same game twice in a row
    const lastPlayedId = recent[0];
    const candidates = GAMES.filter(g => g.id !== lastPlayedId);

    // Weight each game by how many unseen prompts it has left
    // (more fresh prompts = higher chance of being picked)
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
      <Feather name="zap" size={18} color={colors.primary} />
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

  const recentGames = recentGameIds
    .map(id => GAMES.find(g => g.id === id))
    .filter(Boolean) as GameMeta[];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.heroBg, { backgroundColor: colors.card, borderRadius: 28, borderWidth: 1, borderColor: colors.border }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Feather name="star" size={26} color="#FFF" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Game Host</Text>
        </View>
        <RotatingSubtitle />
        <NewPromptsTag />
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <Pressable
          onPress={() => router.push('/games')}
          style={({ pressed }) => [
            styles.startBtn,
            {
              backgroundColor: pressed ? colors.primaryDark : colors.primary,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Feather name="play-circle" size={20} color="#FFF" />
          <Text style={styles.startBtnText}>Start a Game</Text>
        </Pressable>
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

      {/* Category sections */}
      {SECTIONS.map(section => {
        const games = GAMES.filter(section.filter);
        if (games.length === 0) return null;
        return (
          <View key={section.label} style={styles.section}>
            <SectionHeader
              label={section.label}
              micro={section.micro}
              onPress={() => router.push('/games')}
            />
            <HorizontalGameRow games={games} />
          </View>
        );
      })}

      {/* Packs teaser */}
      <Pressable
        onPress={() => router.push('/packs')}
        style={({ pressed }) => [
          styles.packTeaser,
          { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ fontSize: 28 }}>🎁</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.packTitle, { color: colors.foreground }]}>More Games on the Way</Text>
          <Text style={[styles.packSub, { color: colors.mutedForeground }]}>
            Road Trip, Bedtime, Big Family packs coming soon
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.secondaryDark} />
      </Pressable>

      {/* AI settings hint */}
      <AISettingsHint />

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
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{label}</Text>
        {onPress && (
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        )}
      </View>
      <Text style={[styles.micro, { color: colors.mutedForeground }]}>{micro}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 24 },
  heroBg: { padding: 24, alignItems: 'center', gap: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  appName: { fontFamily: 'Inter_700Bold', fontSize: 34, letterSpacing: -0.5 },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  ctas: { gap: 12 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 22,
    paddingVertical: 20,
    shadowColor: '#FF6B3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  startBtnText: { fontFamily: 'Inter_700Bold', fontSize: 19, color: '#FFF' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 22,
    paddingVertical: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  statsCard: { padding: 18, gap: 14 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statsTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flex: 1, gap: 3 },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  moodSection: { gap: 10 },
  moodTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  moodRow: { flexDirection: 'row', gap: 10, paddingBottom: 4, paddingHorizontal: 2 },
  moodPill: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 100 },
  moodPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  moodLine: { fontFamily: 'Inter_500Medium', fontSize: 13, fontStyle: 'italic' },
  section: { gap: 12 },
  sectionHeader: { gap: 3 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  seeAll: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  micro: { fontFamily: 'Inter_400Regular', fontSize: 13, fontStyle: 'italic' },
  hRow: { paddingBottom: 4, paddingHorizontal: 2 },
  packTeaser: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  packTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  packSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  viewAllText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
