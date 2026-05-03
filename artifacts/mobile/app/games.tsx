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
import GameCard from '@/components/GameCard';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import { useColors } from '@/hooks/useColors';

type AgeFilter = 'all' | 'young' | 'older';

const SITUATION_PILLS: { label: string; value: GameSetting | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '🚗 Car', value: 'Car' },
  { label: '🍽 Dinner', value: 'Dinner' },
  { label: '⏳ Waiting', value: 'Waiting' },
  { label: '😴 Bedtime', value: 'Bedtime' },
];

const ENERGY_PILLS: { label: string; value: EnergyLevel | 'all' }[] = [
  { label: 'Any vibe', value: 'all' },
  { label: '😴 Calm', value: 'Calm' },
  { label: '🤔 Thinky', value: 'Medium' },
  { label: '🤪 Silly', value: 'Chaotic' },
];

function Pill({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const colors = useColors();
  const bg = selected ? (color ?? colors.primary) : colors.card;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        borderRadius: 100,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderWidth: 1.5,
        borderColor: selected ? (color ?? colors.primary) : colors.border,
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text style={{
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: selected ? '#FFF' : colors.mutedForeground,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [situationFilter, setSituationFilter] = useState<GameSetting | 'all'>('all');
  const [energyFilter, setEnergyFilter] = useState<EnergyLevel | 'all'>('all');
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');

  const filtered = GAMES.filter(g => {
    if (situationFilter !== 'all' && !g.settings.includes(situationFilter)) return false;
    if (energyFilter !== 'all' && g.energyLevel !== energyFilter) return false;
    if (ageFilter === 'young' && g.minAge > 6) return false;
    if (ageFilter === 'older' && g.minAge < 8) return false;
    return true;
  });

  const clearAll = () => {
    setSituationFilter('all');
    setEnergyFilter('all');
    setAgeFilter('all');
  };

  const hasFilters = situationFilter !== 'all' || energyFilter !== 'all' || ageFilter !== 'all';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Custom header */}
        <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Pick your rescue mission</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Choose the game. We'll handle the rules, turns and prompts.
            </Text>
          </View>
        </View>

        {/* Filter bar */}
        <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {SITUATION_PILLS.map(p => (
              <Pill
                key={p.value}
                label={p.label}
                selected={situationFilter === p.value}
                onPress={() => setSituationFilter(p.value)}
                color={colors.primary}
              />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {ENERGY_PILLS.map(p => (
              <Pill
                key={p.value}
                label={p.label}
                selected={energyFilter === p.value}
                onPress={() => setEnergyFilter(p.value)}
                color={colors.secondary}
              />
            ))}
            <View style={styles.divider} />
            <Pill label="Ages 4–7" selected={ageFilter === 'young'} onPress={() => setAgeFilter(v => v === 'young' ? 'all' : 'young')} color={colors.gameCategoryDash} />
            <Pill label="Ages 8+" selected={ageFilter === 'older'} onPress={() => setAgeFilter(v => v === 'older' ? 'all' : 'older')} color={colors.gameCategoryDash} />
          </ScrollView>
        </View>

        {/* Results */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🤷</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No perfect match.</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Family life remains unreasonable.
              </Text>
              <Pressable
                onPress={clearAll}
                style={[styles.showAllBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.showAllText}>Show all games</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.resultRow}>
                <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                  {filtered.length} game{filtered.length !== 1 ? 's' : ''} ready
                </Text>
                {hasFilters && (
                  <Pressable onPress={clearAll}>
                    <Text style={[styles.clearLink, { color: colors.primary }]}>Clear filters</Text>
                  </Pressable>
                )}
              </View>
              {filtered.map(g => <GameCard key={g.id} game={g} />)}
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
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 5,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  list: {
    padding: 20,
    paddingTop: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  resultCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  clearLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  showAllBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  showAllText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFF',
  },
});
