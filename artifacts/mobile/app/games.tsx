import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FadeScrollRow from '@/components/FadeScrollRow';
import FilterChip from '@/components/FilterChip';
import GameCard from '@/components/GameCard';
import Mascot from '@/components/Mascot';
import { GAMES, type GameMeta, type GameSetting, type EnergyLevel } from '@/data/games';
import { SITUATIONS, VIBES } from '@/data/taxonomy';
import { useColors } from '@/hooks/useColors';

type SituationFilter = GameSetting | 'all';
type EnergyFilter = EnergyLevel | 'all';
type PlayersFilter = 'any' | 'solo' | 'duo' | 'group';
type HostFilter = 'any' | 'app' | 'reader';
type SortMode = 'best' | 'quickest' | 'newest' | 'groups';

const SORTS: { key: SortMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'best', label: 'Best match', icon: 'star' },
  { key: 'quickest', label: 'Quickest', icon: 'zap' },
  { key: 'newest', label: 'Newest', icon: 'gift' },
  { key: 'groups', label: 'Biggest groups', icon: 'users' },
];

function applySort(games: GameMeta[], sort: SortMode): GameMeta[] {
  const sorted = [...games];
  switch (sort) {
    case 'quickest':
      return sorted.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    case 'groups':
      return sorted.sort((a, b) => b.maxPlayers - a.maxPlayers);
    default:
      return sorted;
  }
}

function SortSheet({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: SortMode;
  onSelect: (s: SortMode) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}
          onPress={() => {}}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Sort games</Text>
          {SORTS.map(s => {
            const on = s.key === value;
            return (
              <Pressable
                key={s.key}
                onPress={() => { onSelect(s.key); onClose(); }}
                style={({ pressed }) => [
                  styles.sheetRow,
                  { backgroundColor: on ? colors.muted : pressed ? colors.surfaceWarm : 'transparent' },
                ]}
              >
                <Feather name={s.icon} size={18} color={on ? colors.primaryText : colors.mutedForeground} />
                <Text style={[styles.sheetRowText, { color: colors.foreground }]}>{s.label}</Text>
                {on && <Feather name="check" size={18} color={colors.primaryText} />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [situation, setSituation] = useState<SituationFilter>('all');
  const [energy, setEnergy] = useState<EnergyFilter>('all');
  const [players, setPlayers] = useState<PlayersFilter>('any');
  const [host, setHost] = useState<HostFilter>('any');
  const [sort, setSort] = useState<SortMode>('best');
  const [sortOpen, setSortOpen] = useState(false);

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
  const sortLabel = SORTS.find(s => s.key === sort)!.label;
  const hasFilters = situation !== 'all' || energy !== 'all' || players !== 'any' || host !== 'any';

  const clearAll = () => {
    setSituation('all');
    setEnergy('all');
    setPlayers('any');
    setHost('any');
    setSort('best');
  };

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T, off: T) =>
    () => setter(v => (v === value ? off : value));

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted, borderRadius: 22 }]} accessibilityLabel="Back">
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>All games</Text>
            <Text style={[styles.headerSub, { color: colors.primary }]}>Pick one, Pip does the rest.</Text>
          </View>
        </View>

        {/* Filters — two rows, same names as the home screen */}
        <View style={[styles.filterBlock, { borderBottomColor: colors.border }]}>
          <FadeScrollRow contentContainerStyle={styles.filterRow}>
            <FilterChip size="sm" label="Anywhere" selected={situation === 'all'} onPress={() => setSituation('all')} />
            {SITUATIONS.map(s => (
              <FilterChip
                key={s.value}
                size="sm"
                icon={s.icon as any}
                label={s.label}
                selected={situation === s.value}
                onPress={() => setSituation(s.value)}
              />
            ))}
          </FadeScrollRow>

          <FadeScrollRow contentContainerStyle={styles.filterRow}>
            <FilterChip size="sm" label="Any vibe" selected={energy === 'all'} onPress={() => setEnergy('all')} />
            {VIBES.map(v => (
              <FilterChip
                key={v.value}
                size="sm"
                label={v.label}
                selected={energy === v.value}
                onPress={() => setEnergy(v.value)}
              />
            ))}
            <View style={[styles.divider, { backgroundColor: colors.borderMedium }]} />
            <FilterChip size="sm" icon="user" label="Play solo" selected={players === 'solo'} onPress={toggle<PlayersFilter>(setPlayers, 'solo', 'any')} />
            <FilterChip size="sm" label="2 players" selected={players === 'duo'} onPress={toggle<PlayersFilter>(setPlayers, 'duo', 'any')} />
            <FilterChip size="sm" icon="users" label="Groups" selected={players === 'group'} onPress={toggle<PlayersFilter>(setPlayers, 'group', 'any')} />
            <View style={[styles.divider, { backgroundColor: colors.borderMedium }]} />
            <FilterChip size="sm" label="App hosts" selected={host === 'app'} onPress={toggle<HostFilter>(setHost, 'app', 'any')} />
            <FilterChip size="sm" label="Needs a reader" selected={host === 'reader'} onPress={toggle<HostFilter>(setHost, 'reader', 'any')} />
          </FadeScrollRow>
        </View>

        {/* Results */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultMeta}>
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {sorted.length} game{sorted.length !== 1 ? 's' : ''}
              {hasFilters ? ' match' : ' ready'}
            </Text>
            <View style={styles.resultActions}>
              {hasFilters && (
                <Pressable onPress={clearAll} hitSlop={8}>
                  <Text style={[styles.clearLink, { color: colors.primaryText }]}>Clear</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => setSortOpen(true)}
                style={[styles.sortBtn, { backgroundColor: colors.card, shadowColor: colors.navy }]}
                accessibilityLabel={`Sort: ${sortLabel}`}
              >
                <Feather name="bar-chart-2" size={13} color={colors.mutedForeground} style={{ transform: [{ rotate: '90deg' }] }} />
                <Text style={[styles.sortBtnText, { color: colors.foreground }]}>{sortLabel}</Text>
                <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          {sorted.length === 0 ? (
            <View style={styles.empty}>
              <Mascot size={96} mood="think" />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No perfect match.</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Family life remains unreasonable.
              </Text>
              <Pressable onPress={clearAll} style={[styles.showAllBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.showAllBtnText}>Show all games</Text>
              </Pressable>
            </View>
          ) : (
            sorted.map((g, i) => <GameCard key={g.id} game={g} variant="list" index={i} />)
          )}
        </ScrollView>
      </View>

      <SortSheet visible={sortOpen} value={sort} onSelect={setSort} onClose={() => setSortOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  headerTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 30, letterSpacing: -0.6 },
  headerSub: { fontFamily: 'Caveat_600SemiBold', fontSize: 21, marginTop: 0 },

  filterBlock: { borderBottomWidth: 1, paddingBottom: 6 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 6,
  },
  divider: { width: 1, height: 18, marginHorizontal: 2 },

  list: { padding: 16, gap: 12 },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  resultActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resultCount: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
  clearLink: { fontFamily: 'DMSans_700Bold', fontSize: 14 },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 1,
  },
  sortBtnText: { fontFamily: 'DMSans_700Bold', fontSize: 13 },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(42, 35, 80, 0.35)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingTop: 10, gap: 4 },
  sheetHandle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10 },
  sheetTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 20, paddingHorizontal: 8, marginBottom: 6 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 16 },
  sheetRowText: { flex: 1, fontFamily: 'DMSans_700Bold', fontSize: 16 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22, marginTop: 8 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 15, textAlign: 'center' },
  showAllBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  showAllBtnText: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 16, color: '#FFF' },
});
