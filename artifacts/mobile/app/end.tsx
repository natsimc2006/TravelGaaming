import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedPressable from '@/components/AnimatedPressable';
import { GAME_COLORS } from '@/data/gameColors';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import { getWinners, getTotalScore } from '@/utils/gameEngine';
import { recordGameCompleted, getSoloPerformanceMessage } from '@/utils/progression';

const GROUP_END_TITLES = [
  'Game over. Honour mostly intact.',
  'Victory has been claimed.',
  'Family peace restored. Mostly.',
  'Well played. Suspiciously well played.',
  "That's a wrap. Well done, everyone.",
];

const GROUP_RECAP_LINES = [
  'A strong performance. Some answers remain under investigation.',
  "Nobody flipped the table, so technically a success.",
  'The app hosted. The family survived.',
  'Dignity: mostly intact. Score: final.',
  'Results are in. The family remains functional.',
];

const SOLO_END_TITLES = [
  'Solo session complete.',
  'Challenge accepted. Challenge survived.',
  "That's a wrap on your solo run.",
  'And there it is.',
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getGameColor(gameId: string) {
  const map: Record<string, keyof typeof GAME_COLORS> = {
    'alphabet-showdown': 'alphabet',
    'what-am-i': 'whatAmI',
    'category-dash': 'categoryDash',
    'forbidden-word': 'forbiddenWord',
  };
  return GAME_COLORS[map[gameId] ?? 'alphabet'];
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[statStyles.chip, { backgroundColor: color + '12' }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  chip: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 14, gap: 4 },
  value: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 12, textAlign: 'center' },
});

export default function EndScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, startGame, resetGame } = useGame();

  const trophyScale = useRef(new Animated.Value(0.4)).current;
  const trophyOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const endTitle = useRef(
    session?.isSoloMode ? pick(SOLO_END_TITLES) : pick(GROUP_END_TITLES)
  ).current;
  const recapLine = useRef(pick(GROUP_RECAP_LINES)).current;

  useEffect(() => {
    if (!session) { router.replace('/'); return; }
    Animated.sequence([
      Animated.parallel([
        Animated.spring(trophyScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 14 }),
        Animated.timing(trophyOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    const totalScore = getTotalScore(session);
    recordGameCompleted(session.gameId, totalScore, session.round);
  }, []);

  if (!session) return null;

  const gameColor = getGameColor(session.gameId);
  const isSolo = session.isSoloMode;
  const winners = getWinners(session);
  const isTie = winners.length > 1;
  const maxScore = Math.max(...Object.values(session.scores));
  const totalScore = getTotalScore(session);
  const sorted = [...session.players].sort((a, b) => (session.scores[b.id] ?? 0) - (session.scores[a.id] ?? 0));
  const soloScore = isSolo ? (session.scores[session.players[0]?.id] ?? 0) : 0;
  const soloBestStreak = session.alphabetState?.bestStreak ?? 0;
  const performanceMsg = isSolo ? getSoloPerformanceMessage(soloScore, session.round) : '';

  const handlePlayAgain = () => {
    startGame(session.gameId, session.gameName, session.settings);
    router.replace('/play');
  };

  const handleTryAnother = () => {
    resetGame();
    router.replace('/games');
  };

  const handleHome = () => {
    resetGame();
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Trophy / Solo icon */}
        <Animated.View style={[styles.trophySection, { opacity: trophyOpacity }]}>
          <Animated.View style={[styles.trophyCircle, { backgroundColor: gameColor, transform: [{ scale: trophyScale }] }]}>
            <Text style={{ fontSize: 52 }}>{isSolo ? '🎯' : '🏆'}</Text>
          </Animated.View>
          <Text style={[styles.endTitle, { color: colors.foreground }]}>{endTitle}</Text>

          {isSolo ? (
            <>
              <Text style={[styles.winnerName, { color: gameColor }]}>
                {soloScore} <Text style={{ fontSize: 18 }}>pts</Text>
              </Text>
              <Text style={[styles.performanceMsg, { color: colors.mutedForeground }]}>{performanceMsg}</Text>
            </>
          ) : (
            <>
              <Text style={[styles.winnerName, { color: gameColor }]}>
                {isTie
                  ? `${winners.map(w => w.name).join(' & ')} tie!`
                  : `${winners[0].name} wins!`}
              </Text>
              {maxScore > 0 && (
                <Text style={[styles.winnerScore, { color: colors.mutedForeground }]}>
                  {isTie ? `${maxScore} pts each` : `${maxScore} points`}
                </Text>
              )}
            </>
          )}
        </Animated.View>

        {/* Solo stat chips */}
        {isSolo && (
          <Animated.View style={[styles.statRow, { opacity: contentOpacity }]}>
            <StatChip label="Score" value={`${soloScore}`} color={gameColor} />
            <StatChip label="Rounds" value={`${session.round}`} color={gameColor} />
            {soloBestStreak > 0 && (
              <StatChip label="Best streak" value={`${soloBestStreak}`} color={gameColor} />
            )}
          </Animated.View>
        )}

        {/* Recap line */}
        <Animated.View style={[styles.recapBox, { backgroundColor: gameColor + '14', borderRadius: 18, opacity: contentOpacity }]}>
          <Text style={[styles.recapText, { color: gameColor }]}>
            {isSolo ? performanceMsg : recapLine}
          </Text>
        </Animated.View>

        {/* Scoreboard — group only */}
        {!isSolo && (
          <Animated.View style={[styles.scoreSection, { backgroundColor: colors.card, borderRadius: 20, opacity: contentOpacity }]}>
            <Text style={[styles.scoreSectionTitle, { color: colors.foreground }]}>Final Scores</Text>
            <View style={styles.scoreRows}>
              {sorted.map((p, i) => {
                const isWinner = i === 0;
                const score = session.scores[p.id] ?? 0;
                return (
                  <View
                    key={p.id}
                    style={[
                      styles.scoreRow,
                      { backgroundColor: isWinner ? gameColor + '12' : 'transparent', borderRadius: 14 },
                    ]}
                  >
                    <View style={[styles.rankBubble, { backgroundColor: isWinner ? gameColor : colors.muted }]}>
                      <Text style={[styles.rankText, { color: isWinner ? '#FFF' : colors.mutedForeground }]}>
                        {isWinner ? '🏆' : `${i + 1}`}
                      </Text>
                    </View>
                    <Text
                      style={[styles.scoreRowName, { color: colors.foreground, fontFamily: isWinner ? 'Inter_700Bold' : 'Inter_500Medium' }]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <Text style={[styles.scoreRowPoints, { color: isWinner ? gameColor : colors.foreground }]}>
                      {score}
                      <Text style={[styles.ptsLabel, { color: colors.mutedForeground }]}> pts</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Solo detailed card */}
        {isSolo && soloBestStreak > 0 && (
          <Animated.View style={[styles.soloDetailCard, { backgroundColor: colors.card, borderRadius: 20, opacity: contentOpacity }]}>
            <Text style={[styles.scoreSectionTitle, { color: colors.foreground }]}>Your Run</Text>
            <View style={styles.soloStatGrid}>
              <View style={styles.soloStat}>
                <Text style={[styles.soloStatVal, { color: gameColor }]}>{soloScore}</Text>
                <Text style={[styles.soloStatLabel, { color: colors.mutedForeground }]}>Total score</Text>
              </View>
              <View style={styles.soloStat}>
                <Text style={[styles.soloStatVal, { color: gameColor }]}>{session.round}</Text>
                <Text style={[styles.soloStatLabel, { color: colors.mutedForeground }]}>Rounds</Text>
              </View>
              <View style={styles.soloStat}>
                <Text style={[styles.soloStatVal, { color: gameColor }]}>{soloBestStreak}</Text>
                <Text style={[styles.soloStatLabel, { color: colors.mutedForeground }]}>Best streak</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View style={[styles.actions, { opacity: contentOpacity }]}>
          <AnimatedPressable
            onPress={handlePlayAgain}
            style={[styles.btn, styles.btnPrimary, { backgroundColor: gameColor }]}
          >
            <Feather name="rotate-ccw" size={18} color="#FFF" />
            <Text style={styles.btnPrimaryText}>Play Again</Text>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleTryAnother}
            style={[styles.btn, styles.btnSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="grid" size={18} color={colors.foreground} />
            <Text style={[styles.btnSecondaryText, { color: colors.foreground }]}>Try Another Game</Text>
          </AnimatedPressable>

          <Pressable onPress={handleHome} style={styles.backHome}>
            <Text style={[styles.backHomeText, { color: colors.mutedForeground }]}>Back Home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 20, alignItems: 'stretch' },
  trophySection: { alignItems: 'center', gap: 10 },
  trophyCircle: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8, marginBottom: 4,
  },
  endTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, textAlign: 'center', letterSpacing: -0.3 },
  winnerName: { fontFamily: 'Inter_700Bold', fontSize: 30, textAlign: 'center' },
  winnerScore: { fontFamily: 'Inter_500Medium', fontSize: 16 },
  performanceMsg: { fontFamily: 'Inter_400Regular', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  statRow: { flexDirection: 'row', gap: 10 },
  recapBox: { paddingHorizontal: 20, paddingVertical: 16 },
  recapText: { fontFamily: 'Inter_500Medium', fontSize: 15, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
  scoreSection: { padding: 18, gap: 14 },
  scoreSectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  scoreRows: { gap: 4 },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 10,
  },
  rankBubble: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  scoreRowName: { flex: 1, fontSize: 17 },
  scoreRowPoints: { fontFamily: 'Inter_700Bold', fontSize: 22 },
  ptsLabel: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  soloDetailCard: { padding: 18, gap: 14 },
  soloStatGrid: { flexDirection: 'row', gap: 8 },
  soloStat: { flex: 1, alignItems: 'center', gap: 4 },
  soloStatVal: { fontFamily: 'Inter_700Bold', fontSize: 26 },
  soloStatLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  actions: { gap: 12, paddingTop: 4 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 18, paddingVertical: 18,
  },
  btnPrimary: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 5,
  },
  btnPrimaryText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFF' },
  btnSecondary: { borderWidth: 1.5 },
  btnSecondaryText: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  backHome: { alignItems: 'center', paddingVertical: 10 },
  backHomeText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});
