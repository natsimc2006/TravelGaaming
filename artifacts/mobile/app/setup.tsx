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
import AnimatedPressable from '@/components/AnimatedPressable';
import ChunkyButton from '@/components/ChunkyButton';
import { GameTile } from '@/components/GameGlyph';
import { GAME_COLORS, GAME_COLORS_DEEP } from '@/data/gameColors';
import { GAMES } from '@/data/games';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import type { GameSettings, PlayStyle, Player } from '@/utils/gameEngine';
import { loadSettings, savePlayerNames } from '@/utils/storage';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 7);
}

const ROUND_OPTIONS = [
  { value: 'quick' as const, label: 'Quick', sub: '2–3 minutes', icon: 'zap' },
  { value: 'normal' as const, label: 'Normal', sub: '5–8 minutes', icon: 'target' },
  { value: 'long' as const, label: 'Long', sub: 'For brave families', icon: 'flag' },
];

const DIFF_OPTIONS = [
  { value: 'easy' as const, label: 'Easy', sub: 'Little legends', icon: 'smile' },
  { value: 'mixed' as const, label: 'Mixed', sub: 'Everyone in', icon: 'users' },
  { value: 'spicy' as const, label: 'Spicy', sub: 'Still family-safe', icon: 'trending-up' },
];

const AGE_OPTIONS = [
  { value: 'easy' as const, label: 'Ages 4–7', sub: 'Young ones', icon: 'sun' },
  { value: 'mixed' as const, label: 'Mixed ages', sub: 'All welcome', icon: 'users' },
  { value: 'all' as const, label: 'Ages 10+', sub: 'No hints given', icon: 'cpu' },
];

function LargeOptionCard<T extends string>({
  opt,
  selected,
  onPress,
  color,
}: {
  opt: { value: T; label: string; sub: string; icon: string };
  selected: boolean;
  onPress: () => void;
  color: string;
}) {
  const colors = useColors();
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        styles.optCard,
        {
          backgroundColor: selected ? color + '12' : colors.muted,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: selected ? color : 'transparent',
        },
      ]}
      scaleDown={0.96}
    >
      {selected && (
        <View style={{ position: 'absolute', top: 10, right: 10 }}>
          <Feather name="check" size={14} color={color} />
        </View>
      )}
      <Feather name={opt.icon as any} size={22} color={selected ? color : colors.mutedForeground} />
      <Text style={[styles.optLabel, { color: selected ? color : colors.foreground }]}>{opt.label}</Text>
      <Text style={[styles.optSub, { color: colors.mutedForeground }]}>{opt.sub}</Text>
    </AnimatedPressable>
  );
}

function HowToPlay({ game, color }: { game: (typeof GAMES)[0]; color: string }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const instructions: Record<string, string> = {
    'alphabet-showdown': 'The app picks a category and a starting letter. Players take turns naming something from the category that starts with that letter. Score a point for every valid answer. Try New Letter or New Category to keep things fresh.',
    'what-am-i': 'The app picks a mystery answer and reveals clues one at a time. The fewer clues you need, the more points you score. Hold back if you think you know it!',
    'category-dash': 'One letter, five categories. Race to think of a word for each category starting with that letter. Award points and hit New Round for a fresh set.',
    'forbidden-word': 'One player reads the target word and must get others to guess it — without saying any of the forbidden words. Use the timer, and tap Got It or Skip.',
  };
  return (
    <Pressable
      onPress={() => setOpen(o => !o)}
      style={[styles.howToCard, { backgroundColor: colors.card, borderRadius: 16 }]}
    >
      <View style={styles.howToRow}>
        <Feather name="info" size={16} color={color} />
        <Text style={[styles.howToTitle, { color: colors.foreground }]}>How to play</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
      </View>
      {open && (
        <Text style={[styles.howToText, { color: colors.mutedForeground }]}>
          {instructions[game.id] ?? 'Follow the on-screen prompts to play.'}
        </Text>
      )}
    </Pressable>
  );
}

function PlayStyleToggle({
  value,
  onChange,
  color,
}: {
  value: PlayStyle;
  onChange: (v: PlayStyle) => void;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderRadius: 18 }]}>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>Play style</Text>
      <View style={styles.toggleRow}>
        {([
          { value: 'turns' as PlayStyle, label: 'Take turns', sub: 'Rotate players each round', icon: 'repeat' },
          { value: 'free' as PlayStyle, label: 'Free play', sub: 'Anyone can answer', icon: 'shuffle' },
        ] as const).map(opt => (
          <AnimatedPressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.toggleCard,
              {
                backgroundColor: value === opt.value ? color + '18' : colors.muted,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: value === opt.value ? color : 'transparent',
              },
            ]}
            scaleDown={0.96}
          >
            <Feather name={opt.icon as any} size={22} color={value === opt.value ? color : colors.mutedForeground} />
            <Text style={[styles.optLabel, { color: value === opt.value ? color : colors.foreground }]}>{opt.label}</Text>
            <Text style={[styles.optSub, { color: colors.mutedForeground }]}>{opt.sub}</Text>
          </AnimatedPressable>
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
  const [playStyle, setPlayStyle] = useState<PlayStyle>('turns');
  const [ready, setReady] = useState(false);

  const isSolo = playerCount === 1;

  useEffect(() => {
    loadSettings().then(s => {
      if (s.playerNames.length > 0) {
        const names = s.playerNames.slice(0, Math.max(3, s.playerNames.length));
        setPlayerNames(names);
        setPlayerCount(Math.max(2, names.filter(Boolean).length));
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

  const doStart = async (rl: GameSettings['roundLength'], diff: GameSettings['difficulty']) => {
    const activePlayers: Player[] = isSolo
      ? [{ id: genId(), name: playerNames[0]?.trim() || 'Solo Player' }]
      : Array.from({ length: playerCount }, (_, i) => ({
          id: genId(),
          name: playerNames[i]?.trim() || `Player ${i + 1}`,
        }));
    savePlayerNames(activePlayers.map(p => p.name));
    const settings: GameSettings = {
      playerCount,
      players: activePlayers,
      ageRange,
      roundLength: rl,
      difficulty: diff,
      teams: false,
      playStyle: isSolo ? 'turns' : playStyle,
    };
    await startGame(gameId ?? '', game?.name ?? 'Game', settings);
    router.replace('/play');
  };

  if (!game) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Game not found.</Text>
      </View>
    );
  }

  if (isQuick && !ready) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { position: 'absolute', top: insets.top + 10, left: 16 }]}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[{ color: colors.mutedForeground, fontFamily: 'Nunito_400Regular', fontSize: 16, textAlign: 'center' }]}>
            Give me a second{'\n'}picking something good…
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {isSolo ? 'Solo Challenge' : 'Before we unleash the fun…'}
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {isSolo
                ? 'Just you. The app will host your solo session.'
                : 'A few tiny details so the app can host properly.'}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Game banner */}
          <View style={[styles.gameBanner, { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border }]}>
            <GameTile gameKey={game.colorKey} size={50} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerName, { color: gameColor }]}>{game.name}</Text>
              <Text style={[styles.bannerMeta, { color: colors.mutedForeground }]}>
                {game.estimatedRoundLength} · {game.hostType}
              </Text>
            </View>
          </View>

          {/* Solo banner */}
          {isSolo && (
            <View style={[styles.soloBanner, { backgroundColor: gameColor + '14', borderRadius: 16 }]}>
              <Feather name="target" size={28} color={gameColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.soloTitle, { color: gameColor }]}>Solo Challenge Mode</Text>
                <Text style={[styles.soloSub, { color: colors.mutedForeground }]}>
                  Score is based on speed and early guesses. You'll get a performance summary at the end.
                </Text>
              </View>
            </View>
          )}

          {/* Players */}
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: 18 }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {isSolo ? "That's you." : "Who's playing?"}
            </Text>
            <View style={styles.countRow}>
              <Pressable
                onPress={() => setPlayerCount(c => Math.max(1, c - 1))}
                style={[styles.countBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
              >
                <Feather name="minus" size={20} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.countNum, { color: gameColor }]}>{playerCount}</Text>
              <Pressable
                onPress={() => setPlayerCount(c => Math.min(10, c + 1))}
                style={[styles.countBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
              >
                <Feather name="plus" size={20} color={colors.foreground} />
              </Pressable>
            </View>
            {isSolo && (
              <Text style={[styles.soloHint, { color: colors.mutedForeground }]}>
                Playing solo. Add a second player to switch to group mode.
              </Text>
            )}
            <View style={styles.playerChips}>
              {Array.from({ length: playerCount }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.playerChip,
                    {
                      backgroundColor: colors.card,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.playerNum, { backgroundColor: gameColor }]}>
                    <Text style={styles.playerNumText}>{isSolo ? '★' : i + 1}</Text>
                  </View>
                  <TextInput
                    style={[styles.playerInput, { color: colors.foreground }]}
                    placeholder={isSolo ? 'Your name' : `Player ${i + 1}`}
                    placeholderTextColor={colors.mutedForeground}
                    value={playerNames[i] ?? ''}
                    onChangeText={v => setName(i, v)}
                    returnKeyType="next"
                    maxLength={18}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Round length */}
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: 18 }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>How long?</Text>
            <View style={styles.optRow}>
              {ROUND_OPTIONS.map(opt => (
                <LargeOptionCard
                  key={opt.value}
                  opt={opt}
                  selected={roundLength === opt.value}
                  onPress={() => setRoundLength(opt.value)}
                  color={gameColor}
                />
              ))}
            </View>
          </View>

          {/* Age */}
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: 18 }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Who's in the mix?</Text>
            <View style={styles.optRow}>
              {AGE_OPTIONS.map(opt => (
                <LargeOptionCard
                  key={opt.value}
                  opt={opt}
                  selected={ageRange === opt.value}
                  onPress={() => setAgeRange(opt.value)}
                  color={gameColor}
                />
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: 18 }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Difficulty?</Text>
            <View style={styles.optRow}>
              {DIFF_OPTIONS.map(opt => (
                <LargeOptionCard
                  key={opt.value}
                  opt={opt}
                  selected={difficulty === opt.value}
                  onPress={() => setDifficulty(opt.value)}
                  color={gameColor}
                />
              ))}
            </View>
          </View>

          {/* Play style — group only */}
          {!isSolo && (
            <PlayStyleToggle value={playStyle} onChange={setPlayStyle} color={gameColor} />
          )}

          <HowToPlay game={game} color={gameColor} />

          <ChunkyButton
            label={isSolo ? 'Start Solo Challenge' : 'Start Hosting'}
            size="lg"
            color={gameColor}
            deep={game ? GAME_COLORS_DEEP[game.colorKey] : colors.primaryDark}
            left={<Feather name="play" size={20} color="#FFF" />}
            onPress={() => doStart(roundLength, difficulty)}
            style={{ marginTop: 4 }}
          />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  headerTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 20, letterSpacing: -0.3 },
  headerSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 3, lineHeight: 18 },
  container: { padding: 16, gap: 14 },
  gameBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  bannerIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bannerName: { fontFamily: 'Fredoka_600SemiBold', fontSize: 18 },
  bannerMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 2 },
  soloBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 14 },
  soloTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15 },
  soloSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 4, lineHeight: 18 },
  card: { padding: 16, gap: 14 },
  cardTitle: { fontFamily: 'Fredoka_600SemiBold', fontSize: 16 },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  countBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  countNum: { fontFamily: 'Fredoka_600SemiBold', fontSize: 44, minWidth: 52, textAlign: 'center' },
  soloHint: { fontFamily: 'Nunito_400Regular', fontSize: 12, textAlign: 'center', fontStyle: 'italic' },
  playerChips: { gap: 8 },
  playerChip: { flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  playerNum: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  playerNumText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 15, color: '#FFF' },
  playerInput: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optRow: { flexDirection: 'row', gap: 10 },
  optCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    gap: 6,
  },
  optLabel: { fontFamily: 'Fredoka_600SemiBold', fontSize: 14, textAlign: 'center' },
  optSub: { fontFamily: 'Nunito_400Regular', fontSize: 11, textAlign: 'center', lineHeight: 15 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleCard: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6, gap: 6 },
  howToCard: { padding: 16, gap: 10 },
  howToRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  howToTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, flex: 1 },
  howToText: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 21 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 22,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 4,
  },
  startBtnText: { fontFamily: 'Fredoka_600SemiBold', fontSize: 20, color: '#FFF' },
});
