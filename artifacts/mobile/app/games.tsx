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
import FilterChip from '@/components/FilterChip';
import GameCard from '@/components/GameCard';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import { useColors } from '@/hooks/useColors';

type AgeFilter = 'all' | '4-6' | '7-9' | '10+';
type PlayerFilter = 'all' | '2' | '3-4' | '5+';

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');
  const [situationFilter, setSituationFilter] = useState<GameSetting | 'all'>('all');
  const [energyFilter, setEnergyFilter] = useState<EnergyLevel | 'all'>('all');
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>('all');

  const filtered = GAMES.filter(g => {
    if (situationFilter !== 'all' && !g.settings.includes(situationFilter)) return false;
    if (energyFilter !== 'all' && g.energyLevel !== energyFilter) return false;
    if (ageFilter === '4-6' && g.minAge > 6) return false;
    if (ageFilter === '7-9' && g.minAge > 9) return false;
    if (playerFilter === '2' && g.minPlayers > 2) return false;
    if (playerFilter === '5+' && g.maxPlayers < 5) return false;
    return true;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Choose a Game',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.foreground },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Filters */}
        <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>Situation</Text>
            {(['all', 'Car', 'Dinner', 'Waiting', 'Bedtime'] as const).map(s => (
              <FilterChip
                key={s}
                label={s === 'all' ? 'All' : s}
                selected={situationFilter === s}
                onPress={() => setSituationFilter(s)}
              />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>Energy</Text>
            {(['all', 'Calm', 'Medium', 'Chaotic'] as const).map(e => (
              <FilterChip key={e} label={e === 'all' ? 'Any energy' : e} selected={energyFilter === e} onPress={() => setEnergyFilter(e)} />
            ))}
            <Text style={[styles.filterLabel, { color: colors.mutedForeground, marginLeft: 8 }]}>Age</Text>
            {(['all', '4-6', '7-9', '10+'] as const).map(a => (
              <FilterChip key={a} label={a === 'all' ? 'Any age' : a} selected={ageFilter === a} onPress={() => setAgeFilter(a)} />
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="search" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No games match</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try adjusting the filters above</Text>
              <Pressable onPress={() => {
                setAgeFilter('all');
                setSituationFilter('all');
                setEnergyFilter('all');
                setPlayerFilter('all');
              }}>
                <Text style={[styles.clearFilters, { color: colors.primary }]}>Clear all filters</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
                {filtered.length} game{filtered.length !== 1 ? 's' : ''} available
              </Text>
              {filtered.map(g => <GameCard key={g.id} game={g} />)}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  filterLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginRight: 2,
  },
  list: {
    padding: 20,
    paddingTop: 12,
  },
  resultCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginBottom: 12,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  clearFilters: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginTop: 8,
  },
});
