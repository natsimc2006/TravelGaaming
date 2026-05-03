import { Feather } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/PrimaryButton';
import { GAME_COLORS } from '@/data/gameColors';
import { GAMES } from '@/data/games';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import type { GameSettings, Player } from '@/utils/gameEngine';
import { loadSettings, savePlayerNames } from '@/utils/storage';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 7);
}

function OptionRow<T extends string>({
  label,
  options,
  value,
  onChange,
  color,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.optionRow}>
      <Text style={[styles.optionLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.optionButtons}>
        {options.map(o => (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              styles.optionBtn,
              {
                backgroundColor: value === o.value ? color : colors.muted,
                borderRadius: 10,
              },
            ]}
          >
            <Text style={[styles.optionBtnText, { color: value === o.value ? '#FFF' : colors.mutedForeground }]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SetupScreen() {
  const { gameId, quick } = useLocalSearchParams<{ gameId: string; quick?: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();
  const isQuick = quick === '1';

  const game = GAMES.find(g => g.id === gameId);
  const gameColor = game ? GAME_COLORS[game.colorKey] : colors.primary;

  const [playerCount, setPlayerCount] = useState(3);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [ageRange, setAgeRange] = useState<GameSettings['ageRange']>('mixed');
  const [roundLength, setRoundLength] = useState<GameSettings['roundLength']>('normal');
  const [difficulty, setDifficulty] = useState<GameSettings['difficulty']>('mixed');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      if (s.playerNames.length > 0) {
        setPlayerNames(s.playerNames.slice(0, Math.max(3, s.playerNames.length)));
        setPlayerCount(Math.max(2, s.playerNames.filter(Boolean).length));
      }
      setAgeRange(s.ageRange as GameSettings['ageRange']);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready && isQuick) {
      doStart('quick', 'mixed');
    }
  }, [ready]);

  const setName = (i: number, name: string) => {
    const updated = [...playerNames];
    while (updated.length <= i) updated.push('');
    updated[i] = name;
    setPlayerNames(updated);
  };

  const doStart = (rl: GameSettings['roundLength'], diff: GameSettings['difficulty']) => {
    const activePlayers: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: genId(),
      name: playerNames[i]?.trim() || `Player ${i + 1}`,
    }));

    const names = activePlayers.map(p => p.name);
    savePlayerNames(names);

    const settings: GameSettings = {
      playerCount,
      players: activePlayers,
      ageRange,
      roundLength: rl,
      difficulty: diff,
      teams: false,
    };

    startGame(gameId ?? '', game?.name ?? 'Game', settings);
    router.replace('/play');
  };

  const handleStart = () => doStart(roundLength, difficulty);

  if (!game) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Game not found.</Text>
      </View>
    );
  }

  if (isQuick && !ready) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading…</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Set Up ${game.name}`,
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.foreground },
          headerTintColor: gameColor,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Game banner */}
        <View style={[styles.banner, { backgroundColor: gameColor + '18', borderRadius: colors.radius }]}>
          <View style={[styles.bannerIcon, { backgroundColor: gameColor }]}>
            <Feather name={game.iconName as any} size={24} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerName, { color: gameColor }]}>{game.name}</Text>
            <Text style={[styles.bannerMeta, { color: colors.mutedForeground }]}>
              {game.estimatedRoundLength} · {game.hostType}
            </Text>
          </View>
        </View>

        {/* Players */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Players</Text>
          <View style={styles.countRow}>
            <Pressable
              onPress={() => setPlayerCount(c => Math.max(2, c - 1))}
              style={[styles.countBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="minus" size={20} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.countNum, { color: gameColor }]}>{playerCount}</Text>
            <Pressable
              onPress={() => setPlayerCount(c => Math.min(10, c + 1))}
              style={[styles.countBtn, { backgroundColor: colors.muted }]}
            >
              <Feather name="plus" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <View style={styles.names}>
            {Array.from({ length: playerCount }, (_, i) => (
              <View key={i} style={[styles.nameInput, { backgroundColor: colors.muted, borderRadius: 10 }]}>
                <Text style={[styles.nameIndex, { color: gameColor }]}>{i + 1}</Text>
                <TextInput
                  style={[styles.nameField, { color: colors.foreground }]}
                  placeholder={`Player ${i + 1}`}
                  placeholderTextColor={colors.mutedForeground}
                  value={playerNames[i] ?? ''}
                  onChangeText={v => setName(i, v)}
                  returnKeyType="next"
                  maxLength={20}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Options */}
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Options</Text>

          <OptionRow
            label="Age range"
            options={[
              { value: 'easy' as GameSettings['ageRange'], label: '4–7' },
              { value: 'mixed' as GameSettings['ageRange'], label: 'Mixed' },
              { value: 'all' as GameSettings['ageRange'], label: '10+' },
            ]}
            value={ageRange}
            onChange={setAgeRange}
            color={gameColor}
          />

          <OptionRow
            label="Round length"
            options={[
              { value: 'quick' as GameSettings['roundLength'], label: 'Quick' },
              { value: 'normal' as GameSettings['roundLength'], label: 'Normal' },
              { value: 'long' as GameSettings['roundLength'], label: 'Long' },
            ]}
            value={roundLength}
            onChange={setRoundLength}
            color={gameColor}
          />

          <OptionRow
            label="Difficulty"
            options={[
              { value: 'easy' as GameSettings['difficulty'], label: 'Easy' },
              { value: 'mixed' as GameSettings['difficulty'], label: 'Mixed' },
              { value: 'spicy' as GameSettings['difficulty'], label: 'Spicy' },
            ]}
            value={difficulty}
            onChange={setDifficulty}
            color={gameColor}
          />
        </View>

        {/* How to play */}
        <HowToPlay game={game} color={gameColor} />

        <PrimaryButton
          label="Let's Play!"
          onPress={handleStart}
          variant="primary"
          size="xl"
          fullWidth
        />
      </ScrollView>
    </>
  );
}

function HowToPlay({ game, color }: { game: (typeof GAMES)[0]; color: string }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  const instructions: Record<string, string> = {
    'alphabet-showdown': 'The app picks a category and a starting letter. Players take turns naming something from the category that starts with that letter. Score a point for every valid answer. Try "Next Letter" or "New Category" to keep things fresh. A timer is optional.',
    'what-am-i': 'The app picks a mystery answer and reveals clues one at a time. Everyone tries to guess what it is. The fewer clues you need, the more points you score — so hold back if you think you know it!',
    'category-dash': 'The app gives you one letter and five categories. Race to think of a word for each category that starts with that letter. Use the score buttons to award points. Hit "New Round" for a fresh set.',
    'forbidden-word': 'One player is the reader. They see a target word and must get others to guess it — without saying any of the forbidden words listed. Use the timer, and tap Got It or Skip.',
  };

  return (
    <Pressable
      onPress={() => setOpen(o => !o)}
      style={[styles.howToPlay, { backgroundColor: colors.card, borderRadius: colors.radius }]}
    >
      <View style={styles.howToHeader}>
        <Feather name="info" size={16} color={color} />
        <Text style={[styles.howToTitle, { color: colors.foreground }]}>How to play</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
      </View>
      {open && (
        <Text style={[styles.howToText, { color: colors.mutedForeground }]}>
          {instructions[game.id] ?? 'Follow the prompts on screen to play.'}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: 'Inter_400Regular', fontSize: 16 },
  container: { padding: 20, gap: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  bannerMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    minWidth: 48,
    textAlign: 'center',
  },
  names: { gap: 8 },
  nameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  nameIndex: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    width: 22,
    textAlign: 'center',
  },
  nameField: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    paddingVertical: 0,
  },
  optionRow: { gap: 8 },
  optionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  howToPlay: {
    padding: 16,
    gap: 10,
  },
  howToHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  howToTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    flex: 1,
  },
  howToText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
  },
});
