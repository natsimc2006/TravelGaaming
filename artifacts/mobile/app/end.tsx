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
import ChunkyButton from '@/components/ChunkyButton';
import Mascot from '@/components/Mascot';
import { FadeInUp, Stamp, useCountUp } from '@/components/Motion';
import Sticker from '@/components/Sticker';
import StatusBarScrim from '@/components/StatusBarScrim';
import { GAME_COLORS } from '@/data/gameColors';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import { getWinners, getTotalScore } from '@/utils/gameEngine';
import { LEVEL_NAMES } from '@/utils/director';
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
  value: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 24 },
  label: { fontFamily: 'DMSans_500Medium', fontSize: 12, textAlign: 'center' },
});

const AVATAR_TONES = ['#D45A3E', '#1D5C78', '#2F8C7E', '#B5832A', '#123E52', '#A9432C'];

function CountUp({ value, delay, style }: { value: number; delay: number; style: any }) {
  const shown = useCountUp(value, 700, delay);
  return <Text style={style}>{shown}</Text>;
}

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
        {isSolo ? (
          <>
            {/* Solo: Pip cheers your score */}
            <Animated.View style={[styles.trophySection, { opacity: trophyOpacity }]}>
              <Animated.View style={{ transform: [{ scale: trophyScale }] }}>
                <Sticker size={120} fill={colors.sunshineSoft} tilt={-4}>
                  <Mascot size={92} mood="cheer" />
                </Sticker>
              </Animated.View>
              <Text style={[styles.endTitle, { color: colors.foreground }]}>{endTitle}</Text>
              <CountUp value={soloScore} delay={300} style={[styles.winnerName, { color: colors.primary }]} />
              <Text style={[styles.pipNote, { color: colors.primary, textAlign: 'center' }]}>{performanceMsg}</Text>
            </Animated.View>
            <Animated.View style={[styles.statRow, { opacity: contentOpacity }]}>
              <StatChip label="Score" value={`${soloScore}`} color={colors.primary} />
              <StatChip label="Rounds" value={`${session.round}`} color={colors.primary} />
              {soloBestStreak > 0 && (
                <StatChip label="Best streak" value={`${soloBestStreak}`} color={colors.primary} />
              )}
            </Animated.View>
          </>
        ) : (
          <>
            {/* Group: results on a postcard, winner stamped on */}
            <FadeInUp>
              <Text style={[styles.kicker, { color: colors.mutedForeground }]}>
                {session.gameName.toUpperCase()} · {session.round} ROUNDS
              </Text>
              <Text style={[styles.wrapTitle, { color: colors.foreground }]}>{endTitle}</Text>
            </FadeInUp>

            <FadeInUp delay={120} style={[styles.postcard, { shadowColor: colors.navy }]}>
              <Stamp delay={650} tilt={10} style={[styles.stamp, { borderColor: colors.coral }]}>
                <Text style={[styles.stampLabel, { color: colors.coral }]}>{isTie ? "IT'S A" : 'WINNER'}</Text>
                <Text style={[styles.stampName, { color: colors.coral }]} numberOfLines={1} adjustsFontSizeToFit>
                  {isTie ? 'TIE!' : winners[0].name}
                </Text>
              </Stamp>
              <Text style={[styles.postcardGreeting, { color: colors.primary }]}>Greetings from round {session.round}!</Text>
              {sorted.map((p, i) => {
                const score = session.scores[p.id] ?? 0;
                return (
                  <View
                    key={p.id}
                    style={[styles.postRow, { borderBottomWidth: i === sorted.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}
                  >
                    <Text style={[styles.postRank, { color: colors.coral }]}>{i + 1}</Text>
                    <View style={[styles.avatar, { backgroundColor: AVATAR_TONES[i % AVATAR_TONES.length] }]}>
                      <Text style={styles.avatarText}>{(p.name || '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.postName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                    <CountUp value={score} delay={250 + i * 120} style={[styles.postScore, { color: colors.foreground }]} />
                  </View>
                );
              })}
            </FadeInUp>

            {/* Pip's handwritten recap */}
            <FadeInUp delay={300} style={styles.pipRecap}>
              <Sticker size={56} fill={colors.sunshineSoft} tilt={-6} delay={900}>
                <Mascot size={42} mood="cheer" />
              </Sticker>
              <Text style={[styles.pipNote, { color: colors.foreground, flex: 1 }]}>{recapLine}</Text>
            </FadeInUp>
          </>
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

        {/* Level-ups */}
        {session.director.events.some(e => e.to > e.from) && (
          <Animated.View style={[styles.soloDetailCard, { backgroundColor: colors.card, borderRadius: 20, opacity: contentOpacity }]}>
            <Text style={[styles.scoreSectionTitle, { color: colors.foreground }]}>Levelled up</Text>
            {Object.entries(
              session.director.events.reduce<Record<string, { name: string; to: number }>>((acc, e) => {
                acc[e.playerId] = { name: e.playerName, to: e.to };
                return acc;
              }, {}),
            ).map(([id, v]) => (
              <Text key={id} style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: gameColor }}>
                {session.director.levels[id] > 0 ? `${v.name} is now a ${LEVEL_NAMES[session.director.levels[id]]}` : v.name}
              </Text>
            ))}
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View style={[styles.actions, { opacity: contentOpacity }]}>
          <ChunkyButton label="Play again" size="lg" color={colors.primary} deep={colors.primaryDark} onPress={handlePlayAgain} />
          <ChunkyButton
            label="Gimme a different game"
            color={colors.sunshine}
            deep={colors.sunshineDark}
            textColor={colors.foreground}
            onPress={handleTryAnother}
          />
          <Pressable onPress={handleHome} style={styles.backHome}>
            <Text style={[styles.backHomeText, { color: colors.primary }]}>Back home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      <StatusBarScrim />
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
  endTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22, textAlign: 'center', letterSpacing: -0.3 },
  winnerName: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 44, textAlign: 'center', fontVariant: ['tabular-nums'] },
  winnerScore: { fontFamily: 'DMSans_500Medium', fontSize: 16 },
  performanceMsg: { fontFamily: 'DMSans_400Regular', fontSize: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 },
  statRow: { flexDirection: 'row', gap: 10 },
  recapBox: { paddingHorizontal: 20, paddingVertical: 16 },
  recapText: { fontFamily: 'DMSans_500Medium', fontSize: 15, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
  kicker: { fontFamily: 'DMSans_700Bold', fontSize: 12, letterSpacing: 2 },
  wrapTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 30, letterSpacing: -0.6, lineHeight: 34, marginTop: 2 },
  postcard: {
    backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 18, paddingTop: 22, paddingBottom: 8,
    transform: [{ rotate: '-1deg' }],
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 4,
  },
  postcardGreeting: { fontFamily: 'Caveat_600SemiBold', fontSize: 26, marginBottom: 4, paddingRight: 90 },
  stamp: {
    position: 'absolute', top: -18, right: 12, zIndex: 2, width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderStyle: 'dashed', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  stampLabel: { fontFamily: 'DMSans_700Bold', fontSize: 10, letterSpacing: 1.5 },
  stampName: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 19, maxWidth: 74, textAlign: 'center' },
  postRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  postRank: { fontFamily: 'Caveat_600SemiBold', fontSize: 26, width: 18, textAlign: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 15, color: '#FFFFFF' },
  postName: { flex: 1, fontFamily: 'DMSans_700Bold', fontSize: 17 },
  postScore: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 24, fontVariant: ['tabular-nums'] },
  pipRecap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pipNote: { fontFamily: 'Caveat_600SemiBold', fontSize: 21, lineHeight: 24 },
  scoreSection: { padding: 18, gap: 14 },
  scoreSectionTitle: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 18 },
  scoreRows: { gap: 4 },
  scoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 10,
  },
  rankBubble: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 13 },
  scoreRowName: { flex: 1, fontSize: 17 },
  scoreRowPoints: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 22 },
  ptsLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13 },
  soloDetailCard: { padding: 18, gap: 14 },
  soloStatGrid: { flexDirection: 'row', gap: 8 },
  soloStat: { flex: 1, alignItems: 'center', gap: 4 },
  soloStatVal: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 26 },
  soloStatLabel: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  actions: { gap: 12, paddingTop: 4 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 18, paddingVertical: 18,
  },
  btnPrimary: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 5,
  },
  btnPrimaryText: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 18, color: '#FFF' },
  btnSecondary: { borderWidth: 1.5 },
  btnSecondaryText: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 17 },
  backHome: { alignItems: 'center', paddingVertical: 10 },
  backHomeText: { fontFamily: 'DMSans_700Bold', fontSize: 15 },
});
