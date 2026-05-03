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
import GameCard from '@/components/GameCard';
import PrimaryButton from '@/components/PrimaryButton';
import { GAMES, type GameMeta } from '@/data/games';
import { useColors } from '@/hooks/useColors';
import { loadRecentGames } from '@/utils/storage';

const CATEGORY_SECTIONS = [
  { label: 'Best for the car', icon: 'navigation', filter: (g: GameMeta) => g.settings.includes('Car') },
  { label: 'Best at the table', icon: 'coffee', filter: (g: GameMeta) => g.settings.includes('Dinner') },
  { label: 'Calm games', icon: 'moon', filter: (g: GameMeta) => g.energyLevel === 'Calm' },
  { label: 'Silly games', icon: 'smile', filter: (g: GameMeta) => g.energyLevel === 'Chaotic' },
];

function QuickPlayCard({ game }: { game: GameMeta }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/setup', params: { gameId: game.id, quick: '1' } })}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderRadius: colors.radius,
        padding: 16,
        marginRight: 12,
        width: 200,
        opacity: pressed ? 0.8 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
      })}
    >
      <Text style={[styles.quickName, { color: colors.foreground }]}>{game.name}</Text>
      <Text style={[styles.quickDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
        {game.description}
      </Text>
      <View style={[styles.quickBadge, { backgroundColor: colors.primary + '18' }]}>
        <Text style={[styles.quickBadgeText, { color: colors.primary }]}>Quick Play</Text>
      </View>
    </Pressable>
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
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.logoRow]}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Feather name="star" size={28} color="#FFF" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>Game Host</Text>
        </View>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Family games, hosted for you.
        </Text>
      </View>

      {/* CTAs */}
      <View style={styles.ctas}>
        <PrimaryButton
          label="Start a Game"
          onPress={() => router.push('/games')}
          variant="primary"
          size="xl"
          fullWidth
        />
        <PrimaryButton
          label="Quick Play"
          onPress={() => {
            const random = GAMES[Math.floor(Math.random() * GAMES.length)];
            router.push({ pathname: '/setup', params: { gameId: random.id, quick: '1' } });
          }}
          variant="ghost"
          size="lg"
          fullWidth
        />
      </View>

      {/* Recent */}
      {recentGames.length > 0 && (
        <View style={styles.section}>
          <SectionHeader label="Recently Played" icon="clock" onPress={() => router.push('/games')} />
          {recentGames.slice(0, 2).map(g => (
            <GameCard key={g.id} game={g} compact />
          ))}
        </View>
      )}

      {/* Category Sections */}
      {CATEGORY_SECTIONS.map(section => {
        const games = GAMES.filter(section.filter);
        if (games.length === 0) return null;
        return (
          <View key={section.label} style={styles.section}>
            <SectionHeader
              label={section.label}
              icon={section.icon}
              onPress={() => router.push('/games')}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {games.map(g => (
                <QuickPlayCard key={g.id} game={g} />
              ))}
            </ScrollView>
          </View>
        );
      })}

      {/* Packs teaser */}
      <Pressable
        onPress={() => router.push('/packs')}
        style={({ pressed }) => [
          styles.packTeaser,
          {
            backgroundColor: colors.accent,
            borderRadius: colors.radius,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="gift" size={20} color={colors.foreground} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.packTitle, { color: colors.foreground }]}>More Games Coming</Text>
          <Text style={[styles.packSub, { color: colors.foreground + 'AA' }]}>
            Road Trip, Bedtime, Big Family packs
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.foreground} />
      </Pressable>
    </ScrollView>
  );
}

function SectionHeader({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Feather name={icon as any} size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{label}</Text>
      </View>
      <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 28,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    textAlign: 'center',
  },
  ctas: {
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  seeAll: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  quickName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    marginBottom: 4,
  },
  quickDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  quickBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  quickBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  packTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
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
