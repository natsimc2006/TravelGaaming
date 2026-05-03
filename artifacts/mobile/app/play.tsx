import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedPressable from '@/components/AnimatedPressable';
import HostMessageBanner from '@/components/HostMessageBanner';
import ScoreBoard from '@/components/ScoreBoard';
import Timer from '@/components/Timer';
import { GAME_COLORS } from '@/data/gameColors';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import { getHostLine } from '@/utils/gameEngine';
import { saveRecentGame } from '@/utils/storage';
import { recordPromptSeen } from '@/utils/contentMemory';
import { getFreshnessTag, type FreshnessTag } from '@/utils/freshPrompt';
import { generateFreshPrompt } from '@/utils/aiPromptEngine';
import {
  getVoiceGameKey,
  speakHost,
  speakText,
  stopHostVoice,
} from '@/utils/voiceHost';
import { checkSoundAnswer } from '@/data/guessTheSound';
import { checkRiddleAnswer } from '@/data/riddles';

function getGameColor(gameId: string) {
  const map: Record<string, keyof typeof GAME_COLORS> = {
    'alphabet-showdown': 'alphabet',
    'what-am-i': 'whatAmI',
    'category-dash': 'categoryDash',
    'forbidden-word': 'forbiddenWord',
    'would-you-rather': 'wouldYouRather',
    'rapid-fire': 'rapidFire',
    'guess-the-sound': 'guessTheSound',
    'this-or-that': 'thisOrThat',
    'riddles': 'riddles',
  };
  return GAME_COLORS[map[gameId] ?? 'alphabet'];
}

function ActionBtn({
  label,
  icon,
  onPress,
  color,
  textColor,
  size = 'md',
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  color: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const pv = size === 'lg' ? 20 : size === 'sm' ? 9 : 14;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 12 : 15;
  const tc = textColor ?? '#FFF';
  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.actionBtn, { backgroundColor: color, paddingVertical: pv, borderRadius: 20 }]}
      scaleDown={0.95}
    >
      {icon && <Feather name={icon as any} size={fs} color={tc} />}
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: fs, color: tc }}>{label}</Text>
    </AnimatedPressable>
  );
}

function PromptFade({ children, triggerKey }: { children: React.ReactNode; triggerKey: string | number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(12);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 28, bounciness: 3 }),
    ]).start();
  }, [triggerKey]);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function PlayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, addPlayerScore, advanceRound, advancePlayer, newLetter, newCategory, revealClue, finishGame, resetGame, bumpStreak, breakStreak, selectWYROption, bumpTotStreak, addRapidFireCount } = useGame();
  const [hostMsg, setHostMsg] = useState('');
  const [hostMsgVisible, setHostMsgVisible] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [freshnessTag, setFreshnessTag] = useState<FreshnessTag>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [freshPromptLoading, setFreshPromptLoading] = useState(false);
  const [freshPromptError, setFreshPromptError] = useState(false);
  const msgTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartedRef = useRef(false);

  const showHostMsg = useCallback((type: Parameters<typeof getHostLine>[0], name?: string, n?: number) => {
    if (msgTimeout.current) clearTimeout(msgTimeout.current);
    setHostMsg(getHostLine(type, name, n));
    setHostMsgVisible(true);
    msgTimeout.current = setTimeout(() => setHostMsgVisible(false), 3200);
  }, []);

  const voice = useCallback((
    event: Parameters<typeof speakHost>[1],
    ctx?: Parameters<typeof speakHost>[2],
  ) => {
    if (!voiceEnabled || !session) return;
    speakHost(getVoiceGameKey(session.gameId), event, ctx);
  }, [voiceEnabled, session]);

  // Game start — fires once
  useEffect(() => {
    if (!session) { router.replace('/'); return; }
    saveRecentGame(session.gameId);
    showHostMsg('roundStart', undefined, session.round);
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      if (voiceEnabled) {
        speakHost(getVoiceGameKey(session.gameId), 'gameStart', { gameName: session.gameName });
      }
    }
    // Stop voice on unmount
    return () => { stopHostVoice(); };
  }, []);

  // Track freshness tag whenever the current prompt changes
  useEffect(() => {
    if (!session) return;
    const promptId =
      session.alphabetState?.currentCategory.id ??
      session.whatAmIState?.currentItemId ??
      session.categoryDashState?.currentRoundId ??
      session.forbiddenWordState?.currentCardId;
    if (!promptId || !session.seenMap) { setFreshnessTag(null); return; }
    const tag = getFreshnessTag(promptId, session.seenMap);
    setFreshnessTag(tag);
    recordPromptSeen(promptId, session.gameId);

    if (voiceEnabled && gameStartedRef.current) {
      const voiceEvt = tag === 'new' ? 'freshPrompt' : tag === 'returning' ? 'resurface' : tag === 'favourite' ? 'repeat' : null;
      if (voiceEvt) {
        setTimeout(() => {
          speakHost(getVoiceGameKey(session.gameId), voiceEvt);
        }, 1800);
      }
    }
  }, [
    session?.alphabetState?.currentCategory.id,
    session?.whatAmIState?.currentItemId,
    session?.categoryDashState?.currentRoundId,
    session?.forbiddenWordState?.currentCardId,
  ]);

  // Round changes
  useEffect(() => {
    if (!session || !gameStartedRef.current) return;
    showHostMsg('roundStart', undefined, session.round);
    setTimerRunning(false);
    setTimerKey(k => k + 1);

    const s = session;
    if (voiceEnabled) {
      const ctx = {
        round: s.round,
        totalRounds: s.totalRounds,
        category: s.alphabetState?.currentCategory.name ?? s.categoryDashState?.currentCategories[0],
        letter: s.alphabetState?.currentLetter ?? s.categoryDashState?.currentLetter,
        playerName: s.players[s.currentPlayerIndex]?.name,
      };
      speakHost(getVoiceGameKey(s.gameId), 'roundStart', ctx);
    }
  }, [session?.round]);

  // Player turn changes
  useEffect(() => {
    if (!session || !gameStartedRef.current) return;
    const player = session.players[session.currentPlayerIndex];
    if (player && voiceEnabled) {
      setTimeout(() => {
        speakHost(getVoiceGameKey(session.gameId), 'turnStart', { playerName: player.name });
      }, 600);
    }
  }, [session?.currentPlayerIndex]);

  useEffect(() => {
    if (session?.status === 'ended') {
      if (voiceEnabled) speakHost(getVoiceGameKey(session.gameId), 'gameEnd');
      router.replace('/end');
    }
  }, [session?.status]);

  // X button — show in-app confirm overlay
  const handleExitGame = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    stopHostVoice();
    resetGame();
    router.replace('/games');
  }, [resetGame]);

  const handleFreshPrompt = useCallback(async () => {
    if (!session || freshPromptLoading) return;
    setFreshPromptLoading(true);
    setFreshPromptError(false);
    try {
      await generateFreshPrompt({
        gameId: session.gameId,
        ageRange: session.settings.ageRange === 'easy' ? '4-7' : session.settings.ageRange === 'all' ? '10+' : '8-10',
        difficulty: session.settings.difficulty === 'easy' ? 'easy' : session.settings.difficulty === 'spicy' ? 'hard' : 'mixed',
        familySafeOnly: true,
      });
      // Advance the game to the next prompt using the existing seenMap-aware engine
      if (session.gameId === 'alphabet-showdown') {
        newCategory();
      } else if (session.gameId === 'forbidden-word') {
        advanceRound();
        advancePlayer();
      } else {
        advanceRound();
      }
    } catch {
      setFreshPromptError(true);
      setTimeout(() => setFreshPromptError(false), 2800);
      // Fall back to local prompt — advance anyway
      advanceRound();
    } finally {
      setFreshPromptLoading(false);
    }
  }, [session, freshPromptLoading, newCategory, advanceRound, advancePlayer]);

  if (!session) return null;

  const gameColor = getGameColor(session.gameId);
  const currentPlayer = session.players[session.currentPlayerIndex];
  const voiceKey = getVoiceGameKey(session.gameId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>

        {/* Header */}
        <View style={[styles.topBar, { backgroundColor: gameColor + '14', paddingTop: 12, paddingBottom: 12 }]}>
          <View style={styles.topLeft}>
            <Text style={styles.gameName} numberOfLines={1}>{session.gameName}</Text>
            <Text style={styles.roundText}>Round {session.round} of {session.totalRounds}</Text>
          </View>
          <View style={styles.topRight}>
            {/* Voice toggle */}
            <Pressable
              onPress={() => {
                if (voiceEnabled) stopHostVoice();
                setVoiceEnabled(v => !v);
              }}
              style={[styles.headerIconBtn, { backgroundColor: '#FFFFFF22' }]}
            >
              <Text style={{ fontSize: 16 }}>{voiceEnabled ? '🔊' : '🔇'}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowScores(s => !s)}
              style={[styles.headerIconBtn, { backgroundColor: '#FFFFFF22' }]}
            >
              <Feather name="bar-chart-2" size={18} color="#FFF" />
            </Pressable>
            <Pressable
              onPress={handleExitGame}
              style={[styles.headerIconBtn, { backgroundColor: '#FFFFFF22' }]}
            >
              <Feather name="x" size={18} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Scores overlay */}
        {showScores && (
          <View style={[styles.scoresOverlay, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <ScoreBoard
              players={session.players}
              scores={session.scores}
              currentPlayerId={currentPlayer?.id}
              gameColor={gameColor}
            />
          </View>
        )}

        {/* Host message */}
        <HostMessageBanner message={hostMsg} color={gameColor} visible={hostMsgVisible} />

        {/* Game content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Freshness badge */}
          {freshnessTag && <FreshnessBadge tag={freshnessTag} />}

          {/* Fresh prompt button */}
          <FreshPromptButton
            loading={freshPromptLoading}
            error={freshPromptError}
            onPress={handleFreshPrompt}
          />

          {session.gameId === 'alphabet-showdown' && session.alphabetState && (
            <AlphabetGame
              session={session}
              gameColor={gameColor}
              voiceKey={voiceKey}
              voiceEnabled={voiceEnabled}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => { setTimerRunning(false); showHostMsg('skip'); if (session.isSoloMode) breakStreak(); }}
              onScore={(id: string) => {
                addPlayerScore(id, 1);
                showHostMsg('correct');
                voice('correct');
              }}
              onNextLetter={() => { newLetter(); }}
              onNewCategory={() => { newCategory(); }}
              onNextRound={(scored: boolean) => {
                if (session.isSoloMode) {
                  if (scored) bumpStreak(); else breakStreak();
                }
                voice('roundEnd');
                advanceRound();
              }}
              currentPlayer={currentPlayer}
            />
          )}
          {session.gameId === 'what-am-i' && session.whatAmIState && (
            <WhatAmIGame
              session={session}
              gameColor={gameColor}
              voiceEnabled={voiceEnabled}
              onRevealClue={() => {
                const clueIdx = session.whatAmIState!.cluesRevealed;
                if (voiceEnabled) {
                  speakHost('whatAmI', 'clueReveal', { clueNumber: clueIdx + 1, totalClues: 5, points: session.whatAmIState!.pointsForCorrect });
                  const clueText = session.whatAmIState!.currentClues[clueIdx];
                  if (clueText) setTimeout(() => speakText(clueText), 900);
                }
                revealClue();
              }}
              onAwardAndAdvance={(pts: number) => {
                addPlayerScore(currentPlayer.id, pts);
                showHostMsg('correct');
                voice('correct', { playerName: currentPlayer?.name, points: pts });
                advanceRound();
              }}
              onGiveUp={() => {
                showHostMsg('skip');
                voice('skip');
                advanceRound();
              }}
              currentPlayer={currentPlayer}
            />
          )}
          {session.gameId === 'category-dash' && session.categoryDashState && (
            <CategoryDashGame
              session={session}
              gameColor={gameColor}
              voiceKey={voiceKey}
              voiceEnabled={voiceEnabled}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => { setTimerRunning(false); showHostMsg('skip'); voice('roundEnd'); }}
              onScore={(id: string) => {
                addPlayerScore(id, 1);
                showHostMsg('correct');
                voice('correct');
              }}
              onNewRound={() => {
                voice('roundEnd');
                advanceRound();
                setTimerRunning(false);
                setTimerKey(k => k + 1);
              }}
            />
          )}
          {session.gameId === 'forbidden-word' && session.forbiddenWordState && (
            <ForbiddenWordGame
              session={session}
              gameColor={gameColor}
              voiceKey={voiceKey}
              voiceEnabled={voiceEnabled}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => { setTimerRunning(false); showHostMsg('skip'); voice('roundEnd'); }}
              onCorrect={() => {
                addPlayerScore(currentPlayer.id, 1);
                showHostMsg('correct');
                voice('correct', { playerName: currentPlayer?.name });
                advanceRound();
                advancePlayer();
              }}
              onSkip={() => {
                showHostMsg('skip');
                voice('skip');
                advanceRound();
                advancePlayer();
              }}
              currentPlayer={currentPlayer}
            />
          )}

          {session.gameId === 'would-you-rather' && session.wouldYouRatherState && (
            <WouldYouRatherGame
              session={session}
              gameColor={gameColor}
              currentPlayer={currentPlayer}
              onSelectOption={(opt: 'A' | 'B') => {
                selectWYROption(opt);
                voice('correct');
              }}
              onNext={() => {
                showHostMsg('next');
                voice('roundStart');
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
            />
          )}

          {session.gameId === 'rapid-fire' && session.rapidFireState && (
            <RapidFireGame
              session={session}
              gameColor={gameColor}
              currentPlayer={currentPlayer}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => {
                setTimerRunning(false);
                showHostMsg('roundEnd');
                voice('roundEnd');
              }}
              onAddCount={(playerId: string) => {
                addRapidFireCount(playerId);
              }}
              onNextRound={() => {
                setTimerRunning(false);
                setTimerKey(k => k + 1);
                voice('roundStart');
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
            />
          )}

          {session.gameId === 'guess-the-sound' && session.guessSoundState && (
            <GuessSoundGame
              session={session}
              gameColor={gameColor}
              currentPlayer={currentPlayer}
              onCorrect={() => {
                addPlayerScore(currentPlayer?.id ?? session.players[0]?.id, 1);
                showHostMsg('correct');
                voice('correct', { playerName: currentPlayer?.name });
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
              onSkip={() => {
                showHostMsg('skip');
                voice('skip');
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
            />
          )}

          {session.gameId === 'this-or-that' && session.thisOrThatState && (
            <ThisOrThatGame
              session={session}
              gameColor={gameColor}
              currentPlayer={currentPlayer}
              onSelectOption={(_opt: 'A' | 'B') => {
                bumpTotStreak();
                const streak = (session.thisOrThatState?.streak ?? 0) + 1;
                if (streak >= 3) voice('streak', { streak });
              }}
              onNext={() => {
                voice('roundStart');
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
            />
          )}

          {session.gameId === 'riddles' && session.riddleState && (
            <RiddlesGame
              session={session}
              gameColor={gameColor}
              currentPlayer={currentPlayer}
              onCorrect={() => {
                addPlayerScore(currentPlayer?.id ?? session.players[0]?.id, 1);
                showHostMsg('correct');
                voice('correct', { playerName: currentPlayer?.name });
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
              onSkip={() => {
                showHostMsg('skip');
                voice('skip');
                advanceRound();
                if (!session.isSoloMode) advancePlayer();
              }}
            />
          )}
        </ScrollView>
      </View>

      {/* Exit confirm overlay */}
      <Modal visible={showExitConfirm} transparent animationType="fade" onRequestClose={() => setShowExitConfirm(false)}>
        <Pressable style={exitStyles.backdrop} onPress={() => setShowExitConfirm(false)}>
          <Pressable style={[exitStyles.card, { backgroundColor: colors.card }]} onPress={e => e.stopPropagation()}>
            <Text style={[exitStyles.title, { color: colors.foreground }]}>Leave game?</Text>
            <Text style={[exitStyles.sub, { color: colors.mutedForeground }]}>Your progress will be lost.</Text>
            <View style={exitStyles.btnRow}>
              <Pressable
                onPress={() => setShowExitConfirm(false)}
                style={[exitStyles.btn, { backgroundColor: colors.muted, flex: 1 }]}
              >
                <Text style={[exitStyles.btnText, { color: colors.foreground }]}>Keep playing</Text>
              </Pressable>
              <Pressable
                onPress={confirmExit}
                style={[exitStyles.btn, { backgroundColor: colors.destructive, flex: 1 }]}
              >
                <Text style={[exitStyles.btnText, { color: '#FFF' }]}>Leave</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const exitStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  title: { fontFamily: 'Inter_700Bold', fontSize: 20, textAlign: 'center' },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
});

/* ─── Sub-components ─── */

function PlayerTurnCard({ player, color }: { player: { name: string }; color: string }) {
  const bounce = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    Animated.spring(bounce, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
    return () => { bounce.setValue(0.85); };
  }, [player.name]);
  return (
    <Animated.View style={[styles.playerTurnCard, { backgroundColor: color + '14', borderRadius: 16, transform: [{ scale: bounce }] }]}>
      <Text style={{ fontSize: 20 }}>👤</Text>
      <Text style={[styles.playerTurnText, { color }]}>{player.name}, you're up</Text>
    </Animated.View>
  );
}

function TimerRow({ timerKey, timerSeconds, timerRunning, onToggle, onEnd, color }: any) {
  const colors = useColors();
  return (
    <View style={styles.timerRow}>
      <Timer key={timerKey} seconds={timerSeconds} running={timerRunning} onEnd={onEnd} />
      <Pressable
        onPress={onToggle}
        style={[styles.timerToggle, { backgroundColor: timerRunning ? colors.destructive + '14' : color + '14', borderRadius: 14 }]}
      >
        <Feather name={timerRunning ? 'pause' : 'play'} size={18} color={timerRunning ? colors.destructive : color} />
        <Text style={[styles.timerToggleText, { color: timerRunning ? colors.destructive : color }]}>
          {timerRunning ? 'Pause' : 'Start timer'}
        </Text>
      </Pressable>
    </View>
  );
}

function BigLetterCard({ letter, color }: { letter: string; color: string }) {
  return (
    <PromptFade triggerKey={letter}>
      <View style={[styles.bigLetterBox, { backgroundColor: color, borderRadius: 24 }]}>
        <Text style={styles.bigLetter}>{letter}</Text>
      </View>
    </PromptFade>
  );
}

function ScoreTapGrid({ session, currentPlayer, color, onScore }: any) {
  const colors = useColors();
  const { addPlayerScore } = useGame();

  const handleTap = (playerId: string) => {
    if (onScore) {
      onScore(playerId);
    } else {
      addPlayerScore(playerId, 1);
    }
  };

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Tap to award a point</Text>
      <View style={styles.scoreTapGrid}>
        {session.players.map((p: any) => {
          const isCurrent = p.id === currentPlayer?.id;
          return (
            <AnimatedPressable
              key={p.id}
              onPress={() => handleTap(p.id)}
              style={[styles.scoreTapCard, { backgroundColor: isCurrent ? color : colors.muted, borderRadius: 14, flex: 1 }]}
              scaleDown={0.93}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 26, color: isCurrent ? '#FFF' : colors.foreground }}>
                {session.scores[p.id] ?? 0}
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: isCurrent ? '#FFFFFFCC' : colors.mutedForeground }} numberOfLines={1}>
                {p.name}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

function FreshPromptButton({ loading, error, onPress }: { loading: boolean; error: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        alignSelf: 'center',
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 100,
        backgroundColor: error ? colors.destructive + '18' : colors.softTeal,
        borderWidth: 1.5,
        borderColor: error ? colors.destructive + '40' : colors.secondary + '50',
        opacity: pressed || loading ? 0.7 : 1,
        marginBottom: 6,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text style={{ fontSize: 15 }}>
        {loading ? '⏳' : error ? '😓' : '✨'}
      </Text>
      <Text style={{
        fontFamily: 'Inter_600SemiBold',
        fontSize: 13,
        color: error ? colors.destructive : colors.secondary,
      }}>
        {loading ? 'Finding a fresh one…' : error ? 'Used a classic instead' : 'Fresh prompt'}
      </Text>
    </Pressable>
  );
}

function SoloStreakBadge({ streak, best, color }: { streak: number; best: number; color: string }) {
  const colors = useColors();
  if (streak === 0 && best === 0) return null;
  return (
    <View style={[soloStyles.streakRow]}>
      {streak > 0 && (
        <View style={[soloStyles.streakBadge, { backgroundColor: color }]}>
          <Text style={soloStyles.streakText}>
            {streak >= 3 ? '🔥' : '⚡'} {streak} in a row{streak >= 5 ? '!' : ''}
          </Text>
        </View>
      )}
      {best > 0 && (
        <View style={[soloStyles.bestBadge, { backgroundColor: color + '18', borderColor: color + '40', borderWidth: 1 }]}>
          <Text style={[soloStyles.bestText, { color }]}>Best: {best}</Text>
        </View>
      )}
    </View>
  );
}

const soloStyles = StyleSheet.create({
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  streakBadge: { borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8 },
  streakText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#FFF' },
  bestBadge: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 8 },
  bestText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});

const FRESHNESS_CONFIG: Record<NonNullable<FreshnessTag>, { emoji: string; label: string; bg: string; text: string }> = {
  new:       { emoji: '🆕', label: 'New for you',        bg: '#10B981', text: '#FFF' },
  returning: { emoji: '🔁', label: 'Back again',         bg: '#6366F1', text: '#FFF' },
  favourite: { emoji: '🔥', label: 'Family favourite',   bg: '#F59E0B', text: '#FFF' },
};

function FreshnessBadge({ tag }: { tag: NonNullable<FreshnessTag> }) {
  const cfg = FRESHNESS_CONFIG[tag];
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [tag]);
  return (
    <Animated.View style={[freshStyles.badge, { backgroundColor: cfg.bg, transform: [{ scale }], opacity }]}>
      <Text style={freshStyles.badgeText}>{cfg.emoji} {cfg.label}</Text>
    </Animated.View>
  );
}

const freshStyles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFF' },
});

function AlphabetGame({ session, gameColor, voiceKey, voiceEnabled, timerRunning, timerKey, onTimerToggle, onTimerEnd, onScore, onNextLetter, onNewCategory, onNextRound, currentPlayer }: any) {
  const colors = useColors();
  const s = session.alphabetState!;
  const isSolo = session.isSoloMode;
  const [scoredThisRound, setScoredThisRound] = useState(false);

  useEffect(() => {
    setScoredThisRound(false);
  }, [session.round]);

  const handleScore = (id: string) => {
    onScore(id);
    setScoredThisRound(true);
  };

  return (
    <View style={styles.gameBlock}>
      {isSolo && s.soloStreak >= 0 && (
        <SoloStreakBadge streak={s.soloStreak} best={s.bestStreak} color={gameColor} />
      )}

      {!isSolo && currentPlayer && (
        <PlayerTurnCard player={currentPlayer} color={gameColor} />
      )}

      <PromptFade triggerKey={s.currentCategory.id}>
        <View style={[styles.categoryCard, { backgroundColor: gameColor + '14', borderRadius: 18 }]}>
          <Text style={[styles.categoryHint, { color: colors.mutedForeground }]}>Category</Text>
          <Text style={[styles.categoryName, { color: colors.foreground }]}>{s.currentCategory.name}</Text>
          <Text style={[styles.categoryHint, { color: colors.mutedForeground }]}>
            {isSolo ? 'How many can you name?' : 'Think fast…'}
          </Text>
        </View>
      </PromptFade>

      <View style={styles.centeredSection}>
        <BigLetterCard letter={s.currentLetter} color={gameColor} />
      </View>

      <TimerRow timerKey={timerKey} timerSeconds={s.timerSeconds} timerRunning={timerRunning} onToggle={onTimerToggle} onEnd={onTimerEnd} color={gameColor} />
      <ScoreTapGrid session={session} currentPlayer={currentPlayer} color={gameColor} onScore={handleScore} />

      <View style={styles.actionRow}>
        <ActionBtn label="New Letter" icon="refresh-cw" onPress={onNextLetter} color={colors.muted} textColor={colors.foreground} />
        <ActionBtn label="New Category" icon="shuffle" onPress={onNewCategory} color={colors.muted} textColor={colors.foreground} />
        <ActionBtn label="Next Round" icon="arrow-right" onPress={() => onNextRound(scoredThisRound)} color={gameColor} size="md" />
      </View>
    </View>
  );
}

type GuessResult = 'correct' | 'wrong' | null;
type PeekPhase = 'closed' | 'confirm' | 'revealed';

function WhatAmIGame({ session, gameColor, voiceEnabled, onRevealClue, onAwardAndAdvance, onGiveUp, currentPlayer }: any) {
  const colors = useColors();
  const s = session.whatAmIState!;
  const allRevealed = s.cluesRevealed >= 5;

  // Guess flow
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [guessResult, setGuessResult] = useState<GuessResult>(null);

  // Peek flow
  const [peekPhase, setPeekPhase] = useState<PeekPhase>('closed');

  // Revealed answer (give up / success)
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [roundDone, setRoundDone] = useState(false);

  // Reset local state when the mystery changes
  useEffect(() => {
    setGuessOpen(false);
    setGuessText('');
    setGuessResult(null);
    setPeekPhase('closed');
    setRevealedAnswer(null);
    setRoundDone(false);
  }, [s.currentItemId]);

  const normalise = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const handleCheckGuess = () => {
    Keyboard.dismiss();
    const norm = normalise(guessText);
    const answer = normalise(s.currentAnswer);
    if (!norm) return;
    if (norm === answer || answer.includes(norm) || norm.includes(answer)) {
      setGuessResult('correct');
      setRevealedAnswer(s.currentAnswer);
      setRoundDone(true);
    } else {
      setGuessResult('wrong');
    }
  };

  const handleConfirmCorrect = () => {
    onAwardAndAdvance(s.pointsForCorrect);
  };

  const handleGiveUp = () => {
    Alert.alert(
      'Reveal the answer?',
      'This ends the round with no points awarded.',
      [
        { text: 'Keep playing', style: 'cancel' },
        {
          text: 'Give up',
          style: 'destructive',
          onPress: () => {
            setRevealedAnswer(s.currentAnswer);
            setRoundDone(true);
            onGiveUp();
          },
        },
      ],
    );
  };

  const handlePeekTheyGotIt = () => {
    setPeekPhase('closed');
    onAwardAndAdvance(s.pointsForCorrect);
  };

  const handlePeekEndRound = () => {
    setPeekPhase('closed');
    setRevealedAnswer(s.currentAnswer);
    setRoundDone(true);
    onGiveUp();
  };

  return (
    <View style={styles.gameBlock}>
      <PlayerTurnCard player={currentPlayer} color={gameColor} />

      {/* Points banner */}
      <View style={[styles.pointsBanner, { backgroundColor: gameColor, borderRadius: 14 }]}>
        <Text style={styles.pointsBannerText}>
          Worth {s.pointsForCorrect} {s.pointsForCorrect === 1 ? 'point' : 'points'} right now
        </Text>
        <Text style={styles.pointsBannerSub}>Clue {s.cluesRevealed} of 5</Text>
      </View>

      {/* Clues list */}
      <View style={styles.cluesList}>
        {Array.from({ length: s.cluesRevealed }, (_, i) => {
          const isLatest = i === s.cluesRevealed - 1;
          return (
            <PromptFade key={i} triggerKey={`${i}-${s.currentItemId}`}>
              <View style={[styles.clueCard, {
                backgroundColor: isLatest ? gameColor + '18' : colors.muted,
                borderRadius: 14,
                borderLeftWidth: isLatest ? 3 : 0,
                borderLeftColor: gameColor,
                opacity: isLatest ? 1 : 0.65,
              }]}>
                <Text style={[styles.clueNum, { color: gameColor }]}>Clue {i + 1}</Text>
                <Text style={[styles.clueText, { color: colors.foreground, fontFamily: isLatest ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                  {s.currentClues[i]}
                </Text>
              </View>
            </PromptFade>
          );
        })}
      </View>

      {/* Revealed answer banner */}
      {revealedAnswer && (
        <View style={[styles.answerRevealCard, { backgroundColor: colors.success + '18', borderRadius: 14, borderLeftColor: colors.success }]}>
          <Text style={[styles.answerRevealLabel, { color: colors.success }]}>The answer was</Text>
          <Text style={[styles.answerRevealText, { color: colors.success }]}>{revealedAnswer}</Text>
        </View>
      )}

      {/* ── Guess panel (inline) ── */}
      {guessOpen && !roundDone && (
        <View style={[styles.guessPanel, { backgroundColor: colors.card, borderRadius: 18, borderColor: gameColor + '40', borderWidth: 1.5 }]}>
          <Text style={[styles.guessPanelTitle, { color: colors.foreground }]}>Make a Guess</Text>
          <TextInput
            style={[styles.guessInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: guessResult === 'wrong' ? colors.destructive : guessResult === 'correct' ? colors.success : colors.border }]}
            placeholder="Type your guess…"
            placeholderTextColor={colors.mutedForeground}
            value={guessText}
            onChangeText={t => { setGuessText(t); setGuessResult(null); }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCheckGuess}
          />
          {guessResult === 'wrong' && (
            <Text style={[styles.guessResultText, { color: colors.destructive }]}>Not quite. Try again!</Text>
          )}
          {guessResult === 'correct' && (
            <Text style={[styles.guessResultText, { color: colors.success }]}>Correct! The answer was {revealedAnswer}.</Text>
          )}
          <View style={styles.guessBtnRow}>
            <Pressable
              onPress={() => { setGuessOpen(false); setGuessText(''); setGuessResult(null); }}
              style={[styles.guessBtn, { backgroundColor: colors.muted, flex: 1 }]}
            >
              <Text style={[styles.guessBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
            </Pressable>
            {guessResult === 'correct' ? (
              <Pressable onPress={handleConfirmCorrect} style={[styles.guessBtn, { backgroundColor: colors.success, flex: 2 }]}>
                <Text style={[styles.guessBtnText, { color: '#FFF' }]}>Next Mystery →</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleCheckGuess} style={[styles.guessBtn, { backgroundColor: gameColor, flex: 2 }]}>
                <Text style={[styles.guessBtnText, { color: '#FFF' }]}>Check Guess</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ── Peek modal ── */}
      <Modal visible={peekPhase !== 'closed'} transparent animationType="fade" onRequestClose={() => setPeekPhase('closed')}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPeekPhase('closed')}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.card, borderRadius: 24 }]} onPress={e => e.stopPropagation()}>
            {peekPhase === 'confirm' ? (
              <>
                <Text style={{ fontSize: 36, textAlign: 'center' }}>🔍</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Peek at the answer?</Text>
                <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
                  This won't end the round. Don't let the others see.
                </Text>
                <View style={styles.modalBtnRow}>
                  <Pressable onPress={() => setPeekPhase('closed')} style={[styles.modalBtn, { backgroundColor: colors.muted, flex: 1 }]}>
                    <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={() => setPeekPhase('revealed')} style={[styles.modalBtn, { backgroundColor: gameColor, flex: 1 }]}>
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Peek</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalHint, { color: colors.mutedForeground }]}>Answer (judge only)</Text>
                <Text style={[styles.modalAnswer, { color: gameColor }]}>{s.currentAnswer}</Text>
                <View style={styles.modalBtnCol}>
                  <Pressable onPress={() => setPeekPhase('closed')} style={[styles.modalBtn, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Hide Answer — keep playing</Text>
                  </Pressable>
                  <Pressable onPress={handlePeekTheyGotIt} style={[styles.modalBtn, { backgroundColor: colors.success }]}>
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>They Got It! (+{s.pointsForCorrect} pts)</Text>
                  </Pressable>
                  <Pressable onPress={handlePeekEndRound} style={[styles.modalBtn, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.modalBtnText, { color: colors.destructive }]}>End Round (0 pts)</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Action buttons ── */}
      {!roundDone && !guessOpen && (
        <>
          <View style={styles.actionRow}>
            <ActionBtn
              label="Make a Guess"
              icon="edit-3"
              onPress={() => { setGuessOpen(true); setGuessResult(null); setGuessText(''); }}
              color={gameColor}
              size="lg"
            />
            {!allRevealed ? (
              <ActionBtn label="Next Clue" icon="eye" onPress={onRevealClue} color={colors.muted} textColor={colors.foreground} size="lg" />
            ) : (
              <ActionBtn
                label="Reveal Answer"
                icon="unlock"
                onPress={() => { setRevealedAnswer(s.currentAnswer); setRoundDone(true); onGiveUp(); }}
                color={colors.muted}
                textColor={colors.foreground}
                size="lg"
              />
            )}
          </View>
          <View style={styles.secondaryRow}>
            <Pressable onPress={handleGiveUp} style={[styles.secondaryBtn, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>I Give Up</Text>
            </Pressable>
            <Pressable onPress={() => setPeekPhase('confirm')} style={[styles.secondaryBtn, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>🔍 Peek Answer</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* ── Next Mystery button (after round done) ── */}
      {roundDone && !guessOpen && (
        <ActionBtn
          label="Next Mystery →"
          icon="arrow-right"
          onPress={() => onAwardAndAdvance(0)}
          color={gameColor}
          size="lg"
        />
      )}
    </View>
  );
}

function CategoryDashGame({ session, gameColor, voiceKey, voiceEnabled, timerRunning, timerKey, onTimerToggle, onTimerEnd, onScore, onNewRound }: any) {
  const colors = useColors();
  const s = session.categoryDashState!;
  return (
    <View style={styles.gameBlock}>
      <View style={styles.centeredSection}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Name one for each category starting with…</Text>
        <BigLetterCard letter={s.currentLetter} color={gameColor} />
      </View>
      <PromptFade triggerKey={s.currentRoundId}>
        <View style={[styles.categoriesCard, { backgroundColor: gameColor + '14', borderRadius: 18 }]}>
          {s.currentCategories.map((cat: string, i: number) => (
            <View key={i} style={[styles.catRow, { borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: gameColor + '30' }]}>
              <View style={[styles.catNum, { backgroundColor: gameColor }]}>
                <Text style={styles.catNumText}>{i + 1}</Text>
              </View>
              <Text style={[styles.catText, { color: colors.foreground }]}>{cat}</Text>
            </View>
          ))}
        </View>
      </PromptFade>
      <TimerRow timerKey={timerKey} timerSeconds={s.timerSeconds} timerRunning={timerRunning} onToggle={onTimerToggle} onEnd={onTimerEnd} color={gameColor} />
      <ScoreTapGrid session={session} currentPlayer={null} color={gameColor} />
      <View style={styles.actionRow}>
        <ActionBtn label="New Round" icon="refresh-cw" onPress={onNewRound} color={gameColor} size="lg" />
      </View>
    </View>
  );
}

function ForbiddenWordGame({ session, gameColor, voiceKey, voiceEnabled, timerRunning, timerKey, onTimerToggle, onTimerEnd, onCorrect, onSkip, currentPlayer }: any) {
  const colors = useColors();
  const s = session.forbiddenWordState!;
  return (
    <View style={styles.gameBlock}>
      <PlayerTurnCard player={currentPlayer} color={gameColor} />
      <PromptFade triggerKey={s.currentCardId}>
        <View style={[styles.targetCard, { backgroundColor: gameColor, borderRadius: 22 }]}>
          <Text style={styles.targetHint}>Secret word — reader only</Text>
          <Text style={styles.targetWord}>{s.targetWord}</Text>
          <Text style={styles.targetNote}>Don't show the others!</Text>
        </View>
      </PromptFade>
      <PromptFade triggerKey={`f-${s.currentCardId}`}>
        <View style={[styles.forbiddenCard, { backgroundColor: colors.card, borderRadius: 18 }]}>
          <Text style={[styles.forbiddenHeader, { color: colors.destructive }]}>🚫 Forbidden words</Text>
          {s.forbiddenWords.map((w: string, i: number) => (
            <View key={i} style={[styles.forbiddenRow, { borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: colors.border }]}>
              <View style={[styles.forbiddenDot, { backgroundColor: colors.destructive + '20' }]}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: colors.destructive }}>✕</Text>
              </View>
              <Text style={[styles.forbiddenWord, { color: colors.destructive }]}>{w}</Text>
            </View>
          ))}
        </View>
      </PromptFade>
      <TimerRow timerKey={timerKey} timerSeconds={s.timerSeconds} timerRunning={timerRunning} onToggle={onTimerToggle} onEnd={onTimerEnd} color={gameColor} />
      <View style={styles.actionRow}>
        <ActionBtn label="Got It!" icon="check-circle" onPress={onCorrect} color={colors.success} size="lg" />
        <ActionBtn label="Skip" icon="skip-forward" onPress={onSkip} color={colors.muted} textColor={colors.mutedForeground} size="lg" />
      </View>
    </View>
  );
}

/* ─── Would You Rather ─── */
function WouldYouRatherGame({ session, gameColor, onNext, onSelectOption, currentPlayer }: any) {
  const colors = useColors();
  const s = session.wouldYouRatherState!;
  const isSolo = session.isSoloMode;
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => { setWhyOpen(false); }, [s.currentCardId]);

  const modeLabel: Record<string, string> = { silly: '😄 Silly', thoughtful: '🤔 Thoughtful', chaos: '🤪 Chaos' };

  return (
    <View style={styles.gameBlock}>
      {!isSolo && currentPlayer && <PlayerTurnCard player={currentPlayer} color={gameColor} />}

      <PromptFade triggerKey={s.currentCardId}>
        <View style={[wyrStyles.modeBadge, { backgroundColor: gameColor + '18', borderRadius: 100, alignSelf: 'center' }]}>
          <Text style={[wyrStyles.modeText, { color: gameColor }]}>{modeLabel[s.mode] ?? s.mode}</Text>
        </View>
        <Text style={[wyrStyles.question, { color: colors.foreground }]}>Would you rather…</Text>
        <View style={wyrStyles.optionsCol}>
          <AnimatedPressable
            onPress={() => { onSelectOption('A'); setWhyOpen(true); }}
            style={[wyrStyles.optionBtn, {
              backgroundColor: s.selectedOption === 'A' ? gameColor : colors.muted,
              borderRadius: 20,
              borderWidth: s.selectedOption === 'A' ? 0 : 2,
              borderColor: gameColor + '40',
            }]}
            scaleDown={0.97}
          >
            <Text style={[wyrStyles.optionLabel, { color: s.selectedOption === 'A' ? '#FFF' : gameColor }]}>Option A</Text>
            <Text style={[wyrStyles.optionText, { color: s.selectedOption === 'A' ? '#FFF' : colors.foreground }]}>{s.optionA}</Text>
          </AnimatedPressable>

          <View style={wyrStyles.orDivider}>
            <View style={[wyrStyles.orLine, { backgroundColor: colors.border }]} />
            <Text style={[wyrStyles.orText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[wyrStyles.orLine, { backgroundColor: colors.border }]} />
          </View>

          <AnimatedPressable
            onPress={() => { onSelectOption('B'); setWhyOpen(true); }}
            style={[wyrStyles.optionBtn, {
              backgroundColor: s.selectedOption === 'B' ? gameColor : colors.muted,
              borderRadius: 20,
              borderWidth: s.selectedOption === 'B' ? 0 : 2,
              borderColor: gameColor + '40',
            }]}
            scaleDown={0.97}
          >
            <Text style={[wyrStyles.optionLabel, { color: s.selectedOption === 'B' ? '#FFF' : gameColor }]}>Option B</Text>
            <Text style={[wyrStyles.optionText, { color: s.selectedOption === 'B' ? '#FFF' : colors.foreground }]}>{s.optionB}</Text>
          </AnimatedPressable>
        </View>
      </PromptFade>

      {s.selectedOption && whyOpen && (
        <View style={[wyrStyles.whyCard, { backgroundColor: gameColor + '12', borderRadius: 16, borderColor: gameColor + '30', borderWidth: 1 }]}>
          <Text style={[wyrStyles.whyText, { color: colors.mutedForeground }]}>
            {isSolo ? 'Why did you choose that? (think it through!)' : 'Defend your choice!'}
          </Text>
        </View>
      )}

      {s.selectedOption && (
        <ActionBtn label="Next Question" icon="arrow-right" onPress={onNext} color={gameColor} size="lg" />
      )}
      {!s.selectedOption && (
        <ActionBtn label="Skip" icon="skip-forward" onPress={onNext} color={colors.muted} textColor={colors.mutedForeground} size="lg" />
      )}
    </View>
  );
}

const wyrStyles = StyleSheet.create({
  modeBadge: { paddingHorizontal: 16, paddingVertical: 6, marginBottom: 6 },
  modeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  question: { fontFamily: 'Inter_700Bold', fontSize: 22, textAlign: 'center', marginBottom: 16 },
  optionsCol: { gap: 0 },
  optionBtn: { padding: 22, gap: 6, minHeight: 90, justifyContent: 'center' },
  optionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  optionText: { fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 24 },
  orDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  whyCard: { padding: 16 },
  whyText: { fontFamily: 'Inter_500Medium', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});

/* ─── Rapid Fire ─── */
function RapidFireGame({ session, gameColor, timerRunning, timerKey, onTimerToggle, onTimerEnd, onAddCount, onNextRound, currentPlayer }: any) {
  const colors = useColors();
  const s = session.rapidFireState!;
  const isSolo = session.isSoloMode;

  return (
    <View style={styles.gameBlock}>
      {!isSolo && currentPlayer && <PlayerTurnCard player={currentPlayer} color={gameColor} />}

      <PromptFade triggerKey={s.currentPromptId}>
        <View style={[rfStyles.promptCard, { backgroundColor: gameColor, borderRadius: 22 }]}>
          <Text style={rfStyles.promptHint}>Your challenge</Text>
          <Text style={rfStyles.promptText}>{s.currentPrompt}</Text>
          <Text style={rfStyles.promptSub}>As fast as you can!</Text>
        </View>
      </PromptFade>

      <TimerRow timerKey={timerKey} timerSeconds={s.timerSeconds} timerRunning={timerRunning} onToggle={onTimerToggle} onEnd={onTimerEnd} color={gameColor} />

      {isSolo ? (
        <View style={rfStyles.soloTally}>
          <Text style={[rfStyles.tallyLabel, { color: colors.mutedForeground }]}>Answers given</Text>
          <Text style={[rfStyles.tallyCount, { color: gameColor }]}>{s.playerAnswerCount[session.players[0]?.id] ?? 0}</Text>
          <View style={styles.actionRow}>
            <ActionBtn label="+ One more" icon="plus" onPress={() => onAddCount(session.players[0]?.id)} color={gameColor} size="lg" />
          </View>
        </View>
      ) : (
        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Tap to count answers</Text>
          <View style={styles.scoreTapGrid}>
            {session.players.map((p: any) => (
              <AnimatedPressable
                key={p.id}
                onPress={() => onAddCount(p.id)}
                style={[styles.scoreTapCard, { backgroundColor: p.id === currentPlayer?.id ? gameColor : colors.muted, borderRadius: 14, flex: 1 }]}
                scaleDown={0.93}
              >
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 26, color: p.id === currentPlayer?.id ? '#FFF' : colors.foreground }}>
                  {s.playerAnswerCount[p.id] ?? 0}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: p.id === currentPlayer?.id ? '#FFFFFFCC' : colors.mutedForeground }} numberOfLines={1}>
                  {p.name}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      )}

      <ActionBtn label="Next Prompt" icon="arrow-right" onPress={onNextRound} color={gameColor} size="lg" />
    </View>
  );
}

const rfStyles = StyleSheet.create({
  promptCard: { padding: 28, alignItems: 'center', gap: 10 },
  promptHint: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFFAA' },
  promptText: { fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FFF', textAlign: 'center', lineHeight: 34 },
  promptSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFFFFFCC' },
  soloTally: { alignItems: 'center', gap: 8 },
  tallyLabel: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  tallyCount: { fontFamily: 'Inter_700Bold', fontSize: 72, lineHeight: 80 },
});

/* ─── Guess the Sound ─── */
function GuessSoundGame({ session, gameColor, onCorrect, onSkip, currentPlayer }: any) {
  const colors = useColors();
  const s = session.guessSoundState!;
  const isSolo = session.isSoloMode;
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setAnswer('');
    setResult(null);
    setRevealed(false);
  }, [s.currentItemId]);

  const handleCheck = () => {
    Keyboard.dismiss();
    if (!answer.trim()) return;
    const ok = checkSoundAnswer(answer, { acceptedAnswers: s.acceptedAnswers, answer: s.currentAnswer } as any);
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setTimeout(() => onCorrect(), 800);
  };

  return (
    <View style={styles.gameBlock}>
      {!isSolo && currentPlayer && <PlayerTurnCard player={currentPlayer} color={gameColor} />}

      <PromptFade triggerKey={s.currentItemId}>
        <View style={[gsStyles.soundCard, { backgroundColor: gameColor, borderRadius: 22 }]}>
          <Text style={gsStyles.soundHint}>What makes this sound?</Text>
          <Text style={gsStyles.soundText}>{s.currentSoundText}</Text>
        </View>
      </PromptFade>

      {!revealed && (
        <View style={[styles.guessPanel, { backgroundColor: colors.card, borderRadius: 18, borderColor: gameColor + '40', borderWidth: 1.5 }]}>
          <Text style={[styles.guessPanelTitle, { color: colors.foreground }]}>Your answer</Text>
          <TextInput
            style={[styles.guessInput, {
              backgroundColor: colors.muted,
              color: colors.foreground,
              borderColor: result === 'wrong' ? colors.destructive : result === 'correct' ? colors.success : colors.border,
            }]}
            placeholder="Type what makes this sound…"
            placeholderTextColor={colors.mutedForeground}
            value={answer}
            onChangeText={t => { setAnswer(t); setResult(null); }}
            returnKeyType="done"
            onSubmitEditing={handleCheck}
          />
          {result === 'wrong' && (
            <Text style={[styles.guessResultText, { color: colors.destructive }]}>Not quite — try again!</Text>
          )}
          {result === 'correct' && (
            <Text style={[styles.guessResultText, { color: colors.success }]}>Correct! Well done.</Text>
          )}
          <View style={styles.guessBtnRow}>
            <Pressable onPress={() => { setRevealed(true); }} style={[styles.guessBtn, { backgroundColor: colors.muted, flex: 1 }]}>
              <Text style={[styles.guessBtnText, { color: colors.mutedForeground }]}>Reveal</Text>
            </Pressable>
            <Pressable onPress={handleCheck} style={[styles.guessBtn, { backgroundColor: gameColor, flex: 2 }]}>
              <Text style={[styles.guessBtnText, { color: '#FFF' }]}>Check Answer</Text>
            </Pressable>
          </View>
        </View>
      )}

      {revealed && (
        <View style={[styles.answerRevealCard, { backgroundColor: colors.success + '18', borderRadius: 14, borderLeftColor: colors.success }]}>
          <Text style={[styles.answerRevealLabel, { color: colors.success }]}>The answer was</Text>
          <Text style={[styles.answerRevealText, { color: colors.success }]}>{s.currentAnswer}</Text>
        </View>
      )}

      {!isSolo && (
        <ScoreTapGrid session={session} currentPlayer={currentPlayer} color={gameColor} />
      )}

      <View style={styles.actionRow}>
        <ActionBtn label="Next Sound" icon="arrow-right" onPress={onSkip} color={gameColor} size="lg" />
      </View>
    </View>
  );
}

const gsStyles = StyleSheet.create({
  soundCard: { padding: 28, alignItems: 'center', gap: 14 },
  soundHint: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFFAA' },
  soundText: { fontFamily: 'Inter_700Bold', fontSize: 44, color: '#FFF', textAlign: 'center', lineHeight: 52 },
});

/* ─── This or That ─── */
function ThisOrThatGame({ session, gameColor, onSelectOption, onNext, currentPlayer }: any) {
  const colors = useColors();
  const s = session.thisOrThatState!;
  const isSolo = session.isSoloMode;
  const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
  const pulseA = useRef(new Animated.Value(1)).current;
  const pulseB = useRef(new Animated.Value(1)).current;

  useEffect(() => { setChosen(null); }, [s.currentCardId]);

  const handlePick = (opt: 'A' | 'B') => {
    setChosen(opt);
    const anim = opt === 'A' ? pulseA : pulseB;
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.04, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onSelectOption(opt);
    setTimeout(() => onNext(), 600);
  };

  return (
    <View style={styles.gameBlock}>
      {!isSolo && currentPlayer && <PlayerTurnCard player={currentPlayer} color={gameColor} />}

      {(s.streak > 0 || s.bestStreak > 0) && (
        <SoloStreakBadge streak={s.streak} best={s.bestStreak} color={gameColor} />
      )}

      <PromptFade triggerKey={s.currentCardId}>
        <View style={totStyles.promptRow}>
          <Text style={[totStyles.promptLabel, { color: colors.mutedForeground }]}>This or That?</Text>
        </View>
        <View style={totStyles.optionsRow}>
          <Animated.View style={{ flex: 1, transform: [{ scale: pulseA }] }}>
            <AnimatedPressable
              onPress={() => handlePick('A')}
              style={[totStyles.totBtn, {
                backgroundColor: chosen === 'A' ? gameColor : colors.muted,
                borderRadius: 20,
              }]}
              scaleDown={0.96}
            >
              <Text style={[totStyles.totText, { color: chosen === 'A' ? '#FFF' : colors.foreground }]} numberOfLines={3}>{s.optionA}</Text>
            </AnimatedPressable>
          </Animated.View>

          <View style={totStyles.vsDivider}>
            <Text style={[totStyles.vsText, { color: gameColor }]}>VS</Text>
          </View>

          <Animated.View style={{ flex: 1, transform: [{ scale: pulseB }] }}>
            <AnimatedPressable
              onPress={() => handlePick('B')}
              style={[totStyles.totBtn, {
                backgroundColor: chosen === 'B' ? gameColor : colors.muted,
                borderRadius: 20,
              }]}
              scaleDown={0.96}
            >
              <Text style={[totStyles.totText, { color: chosen === 'B' ? '#FFF' : colors.foreground }]} numberOfLines={3}>{s.optionB}</Text>
            </AnimatedPressable>
          </Animated.View>
        </View>
      </PromptFade>

      <Pressable onPress={onNext} style={{ alignSelf: 'center' }}>
        <Text style={[totStyles.skipText, { color: colors.mutedForeground }]}>Skip →</Text>
      </Pressable>
    </View>
  );
}

const totStyles = StyleSheet.create({
  promptRow: { alignItems: 'center', marginBottom: 8 },
  promptLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  optionsRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10, minHeight: 140 },
  totBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18, height: '100%' },
  totText: { fontFamily: 'Inter_700Bold', fontSize: 18, textAlign: 'center', lineHeight: 24 },
  vsDivider: { alignItems: 'center', justifyContent: 'center', width: 36 },
  vsText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  skipText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, paddingVertical: 8 },
});

/* ─── Riddles ─── */
function RiddlesGame({ session, gameColor, onCorrect, onSkip, currentPlayer }: any) {
  const colors = useColors();
  const s = session.riddleState!;
  const isSolo = session.isSoloMode;
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setAnswer('');
    setResult(null);
    setRevealed(false);
  }, [s.currentRiddleId]);

  const handleCheck = () => {
    Keyboard.dismiss();
    if (!answer.trim()) return;
    const ok = checkRiddleAnswer(answer, { acceptedAnswers: s.acceptedAnswers, answer: s.currentAnswer } as any);
    setResult(ok ? 'correct' : 'wrong');
    if (ok) setTimeout(() => onCorrect(), 800);
  };

  return (
    <View style={styles.gameBlock}>
      {!isSolo && currentPlayer && <PlayerTurnCard player={currentPlayer} color={gameColor} />}

      <PromptFade triggerKey={s.currentRiddleId}>
        <View style={[rdStyles.riddleCard, { backgroundColor: gameColor + '14', borderRadius: 22, borderColor: gameColor + '30', borderWidth: 1.5 }]}>
          <Text style={[rdStyles.riddleLabel, { color: gameColor }]}>Riddle</Text>
          <Text style={[rdStyles.riddleText, { color: colors.foreground }]}>{s.currentQuestion}</Text>
        </View>
      </PromptFade>

      {!revealed && (
        <View style={[styles.guessPanel, { backgroundColor: colors.card, borderRadius: 18, borderColor: gameColor + '40', borderWidth: 1.5 }]}>
          <Text style={[styles.guessPanelTitle, { color: colors.foreground }]}>Your answer</Text>
          <TextInput
            style={[styles.guessInput, {
              backgroundColor: colors.muted,
              color: colors.foreground,
              borderColor: result === 'wrong' ? colors.destructive : result === 'correct' ? colors.success : colors.border,
            }]}
            placeholder="What's the answer?"
            placeholderTextColor={colors.mutedForeground}
            value={answer}
            onChangeText={t => { setAnswer(t); setResult(null); }}
            returnKeyType="done"
            onSubmitEditing={handleCheck}
          />
          {result === 'wrong' && (
            <Text style={[styles.guessResultText, { color: colors.destructive }]}>Not quite — think harder!</Text>
          )}
          {result === 'correct' && (
            <Text style={[styles.guessResultText, { color: colors.success }]}>Correct! Well solved.</Text>
          )}
          <View style={styles.guessBtnRow}>
            <Pressable onPress={() => setRevealed(true)} style={[styles.guessBtn, { backgroundColor: colors.muted, flex: 1 }]}>
              <Text style={[styles.guessBtnText, { color: colors.mutedForeground }]}>Reveal</Text>
            </Pressable>
            <Pressable onPress={handleCheck} style={[styles.guessBtn, { backgroundColor: gameColor, flex: 2 }]}>
              <Text style={[styles.guessBtnText, { color: '#FFF' }]}>Check Answer</Text>
            </Pressable>
          </View>
        </View>
      )}

      {revealed && (
        <View style={[styles.answerRevealCard, { backgroundColor: colors.success + '18', borderRadius: 14, borderLeftColor: colors.success }]}>
          <Text style={[styles.answerRevealLabel, { color: colors.success }]}>The answer is</Text>
          <Text style={[styles.answerRevealText, { color: colors.success }]}>{s.currentAnswer}</Text>
        </View>
      )}

      {!isSolo && (
        <ScoreTapGrid session={session} currentPlayer={currentPlayer} color={gameColor} />
      )}

      <View style={styles.actionRow}>
        {revealed || result === 'correct' ? (
          <ActionBtn label="Next Riddle →" icon="arrow-right" onPress={onSkip} color={gameColor} size="lg" />
        ) : (
          <ActionBtn label="Give Up" icon="skip-forward" onPress={onSkip} color={colors.muted} textColor={colors.mutedForeground} size="lg" />
        )}
      </View>
    </View>
  );
}

const rdStyles = StyleSheet.create({
  riddleCard: { padding: 24, gap: 12 },
  riddleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.2 },
  riddleText: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topLeft: { gap: 2, flex: 1 },
  gameName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FFF' },
  roundText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#FFFFFFCC' },
  topRight: { flexDirection: 'row', gap: 8 },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoresOverlay: {
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
    paddingTop: 10,
    gap: 18,
  },
  gameBlock: { gap: 18 },
  centeredSection: { alignItems: 'center', gap: 12 },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, textAlign: 'center' },
  categoryCard: { padding: 20, alignItems: 'center', gap: 6 },
  categoryHint: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  categoryName: { fontFamily: 'Inter_700Bold', fontSize: 28, textAlign: 'center' },
  bigLetterBox: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  bigLetter: { fontFamily: 'Inter_700Bold', fontSize: 80, color: '#FFF' },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  timerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  timerToggleText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  scoreTapGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  scoreTapCard: { minWidth: 70, padding: 14, alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
    minWidth: 0,
  },
  playerTurnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  playerTurnText: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  pointsBanner: { padding: 16, alignItems: 'center', gap: 4 },
  pointsBannerText: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#FFF' },
  pointsBannerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#FFFFFFCC' },
  cluesList: { gap: 8 },
  clueCard: { padding: 14, gap: 4 },
  clueNum: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  clueText: { fontSize: 16, lineHeight: 22 },
  categoriesCard: { overflow: 'hidden' },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  catNum: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catNumText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#FFF' },
  catText: { fontFamily: 'Inter_500Medium', fontSize: 16, flex: 1 },
  targetCard: { padding: 28, alignItems: 'center', gap: 10 },
  targetHint: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#FFFFFFAA' },
  targetWord: { fontFamily: 'Inter_700Bold', fontSize: 48, color: '#FFF', textAlign: 'center', letterSpacing: -0.5 },
  targetNote: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#FFFFFFAA' },
  forbiddenCard: { overflow: 'hidden' },
  forbiddenHeader: { fontFamily: 'Inter_700Bold', fontSize: 14, padding: 14, paddingBottom: 10 },
  forbiddenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  forbiddenDot: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  forbiddenWord: { fontFamily: 'Inter_600SemiBold', fontSize: 18 },

  // What Am I – guess panel
  guessPanel: {
    padding: 16,
    gap: 12,
  },
  guessPanelTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  guessInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  guessResultText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  guessBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guessBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guessBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },

  // What Am I – answer reveal
  answerRevealCard: {
    padding: 16,
    gap: 4,
    borderLeftWidth: 3,
  },
  answerRevealLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  answerRevealText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
  },

  // What Am I – secondary buttons row
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },

  // Peek / modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    gap: 16,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  modalSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textAlign: 'center',
  },
  modalAnswer: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnCol: {
    gap: 10,
  },
  modalBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
});
