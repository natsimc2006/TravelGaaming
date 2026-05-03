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

const SUBTITLES = [
  "Ready to rescue the next 'I'm bored' moment?",
  'Press play. We\'ll run the brain.',
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
    label: '🚗 Perfect for the car',
    icon: 'navigation',
    micro: 'Minimal props. Maximum distraction.',
    filter: g => g.settings.includes('Car' as GameSetting),
  },
  {
    label: '🍽 Dinner table lifesavers',
    icon: 'coffee',
    micro: 'For when everyone is technically still at the table.',
    filter: g => g.settings.includes('Dinner' as GameSetting),
  },
  {
    label: '⏳ Waiting room winners',
    icon: 'clock',
    micro: 'Because queues build character. Apparently.',
    filter: g => g.settings.includes('Waiting' as GameSetting),
  },
  {
    label: '😴 Calm wind-down games',
    icon: 'moon',
    micro: 'Still fun. Just less feral.',
    filter: g => g.energyLevel === ('Calm' as EnergyLevel),
  },
];

const MOODS = [
  { label: '😴 Calm', value: 'Calm', color: '#4ECDC4', line: 'Good choice. Peaceful chaos incoming.' },
  { label: '😄 Fun', value: 'Fun', color: '#FF6B3D', line: 'Fun mode: engaged. Hold on.' },
  { label: '⚡ Focused', value: 'Medium', color: '#F59E0B', line: 'The thinking caps are on.' },
  { label: '🤪 Chaos', value: 'Chaotic', color: '#8B5CF6', line: 'Good choice. We\'ll keep the chaos at a manageable level.' },
];

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
        {MOODS.map(m => {
          const isSelected = selected === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setSelected(v => v === m.value ? null : m.value)}
              style={({ pressed }) => [
                styles.moodPill,
                {
                  backgroundColor: isSelected ? m.color : colors.card,
                  borderColor: isSelected ? m.color : colors.border,
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

function HorizontalGameRow({ games }: { games: GameMeta[] }) {
  const colors = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
      {games.map(g => (
        <View key={g.id} style={{ width: 300, marginRight: 14 }}>
          <GameCard game={g} />
        </View>
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [recentGameIds, setRecentGameIds] = useState<string[]>([]);

  useEffect(() => {
    loadRecentGames().then(setRecentGameIds);
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
      <View style={[styles.heroBg, { backgroundColor: colors.softOrange, borderRadius: 28 }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Feather name="star" size={26} color="#FFF" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Game Host</Text>
        </View>
        <RotatingSubtitle />
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
        <Pressable
          onPress={() => {
            const random = GAMES[Math.floor(Math.random() * GAMES.length)];
            router.push({ pathname: '/setup', params: { gameId: random.id, quick: '1' } });
          }}
          style={({ pressed }) => [
            styles.saveBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Feather name="zap" size={18} color={colors.primary} />
          <Text style={[styles.saveBtnText, { color: colors.foreground }]}>Save the Moment</Text>
        </Pressable>
      </View>

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
          {
            backgroundColor: colors.softTeal,
            borderRadius: 20,
            opacity: pressed ? 0.85 : 1,
          },
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
  container: {
    paddingHorizontal: 20,
    gap: 24,
  },
  heroBg: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  ctas: {
    gap: 12,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    paddingVertical: 20,
    shadowColor: '#FF6B3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  startBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    color: '#FFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  saveBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  moodSection: {
    gap: 10,
  },
  moodTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  moodPill: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 100,
  },
  moodPillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  moodLine: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    fontStyle: 'italic',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    gap: 3,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  seeAll: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  micro: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    fontStyle: 'italic',
  },
  hRow: {
    paddingBottom: 4,
  },
  packTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  packTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  packSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});
