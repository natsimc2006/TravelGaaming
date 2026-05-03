import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import {
  getVoiceGameKey,
  speakHost,
  speakText,
  stopHostVoice,
} from '@/utils/voiceHost';

function getGameColor(gameId: string) {
  const map: Record<string, keyof typeof GAME_COLORS> = {
    'alphabet-showdown': 'alphabet',
    'what-am-i': 'whatAmI',
    'category-dash': 'categoryDash',
    'forbidden-word': 'forbiddenWord',
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
      style={[styles.actionBtn, { backgroundColor: color, paddingVertical: pv, borderRadius: 16 }]}
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
  const { session, addPlayerScore, advanceRound, advancePlayer, newLetter, newCategory, revealClue, finishGame, resetGame } = useGame();
  const [hostMsg, setHostMsg] = useState('');
  const [hostMsgVisible, setHostMsgVisible] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
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

  // X button — go back to games menu (not end screen)
  const handleExitGame = useCallback(() => {
    Alert.alert(
      'Leave Game?',
      'Your progress will be lost.',
      [
        { text: 'Keep Playing', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            stopHostVoice();
            resetGame();
            router.replace('/games');
          },
        },
      ],
    );
  }, [resetGame]);

  if (!session) return null;

  const gameColor = getGameColor(session.gameId);
  const currentPlayer = session.players[session.currentPlayerIndex];
  const voiceKey = getVoiceGameKey(session.gameId);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>

        {/* Header */}
        <View style={[styles.topBar, { backgroundColor: gameColor }]}>
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
          {session.gameId === 'alphabet-showdown' && session.alphabetState && (
            <AlphabetGame
              session={session}
              gameColor={gameColor}
              voiceKey={voiceKey}
              voiceEnabled={voiceEnabled}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => { setTimerRunning(false); showHostMsg('skip'); }}
              onScore={(id: string) => {
                addPlayerScore(id, 1);
                showHostMsg('correct');
                voice('correct');
              }}
              onNextLetter={() => { newLetter(); }}
              onNewCategory={() => { newCategory(); }}
              onNextRound={() => { voice('roundEnd'); advanceRound(); }}
              currentPlayer={currentPlayer}
            />
          )}
          {session.gameId === 'what-am-i' && session.whatAmIState && (
            <WhatAmIGame
              session={session}
              gameColor={gameColor}
              voiceKey={voiceKey}
              voiceEnabled={voiceEnabled}
              timerKey={timerKey}
              onReveal={() => {
                const clueIdx = session.whatAmIState!.cluesRevealed;
                if (voiceEnabled) {
                  speakHost('whatAmI', 'clueReveal', { clueNumber: clueIdx + 1, totalClues: 5, points: session.whatAmIState!.pointsForCorrect });
                  const clueText = session.whatAmIState!.currentClues[clueIdx];
                  if (clueText) setTimeout(() => speakText(clueText), 900);
                }
                revealClue();
              }}
              onCorrect={(id: string) => {
                addPlayerScore(id, session.whatAmIState!.pointsForCorrect);
                showHostMsg('correct');
                voice('correct', { playerName: currentPlayer?.name, points: session.whatAmIState!.pointsForCorrect });
                advanceRound();
              }}
              onSkip={() => {
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
        </ScrollView>
      </View>
    </>
  );
}

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

function ScoreTapGrid({ session, currentPlayer, color }: any) {
  const colors = useColors();
  const { addPlayerScore } = useGame();
  return (
    <View>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Tap to award a point</Text>
      <View style={styles.scoreTapGrid}>
        {session.players.map((p: any) => {
          const isCurrent = p.id === currentPlayer?.id;
          return (
            <AnimatedPressable
              key={p.id}
              onPress={() => addPlayerScore(p.id, 1)}
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

function AlphabetGame({ session, gameColor, voiceKey, voiceEnabled, timerRunning, timerKey, onTimerToggle, onTimerEnd, onScore, onNextLetter, onNewCategory, onNextRound, currentPlayer }: any) {
  const colors = useColors();
  const s = session.alphabetState!;
  return (
    <View style={styles.gameBlock}>
      <PromptFade triggerKey={s.currentCategory.id}>
        <View style={[styles.categoryCard, { backgroundColor: gameColor + '14', borderRadius: 18 }]}>
          <Text style={[styles.categoryHint, { color: colors.mutedForeground }]}>Category</Text>
          <Text style={[styles.categoryName, { color: colors.foreground }]}>{s.currentCategory.name}</Text>
          <Text style={[styles.categoryHint, { color: colors.mutedForeground }]}>Think fast…</Text>
        </View>
      </PromptFade>

      <View style={styles.centeredSection}>
        <BigLetterCard letter={s.currentLetter} color={gameColor} />
      </View>

      <TimerRow timerKey={timerKey} timerSeconds={s.timerSeconds} timerRunning={timerRunning} onToggle={onTimerToggle} onEnd={onTimerEnd} color={gameColor} />
      <ScoreTapGrid session={session} currentPlayer={currentPlayer} color={gameColor} />

      <View style={styles.actionRow}>
        <ActionBtn label="New Letter" icon="refresh-cw" onPress={onNextLetter} color={colors.muted} textColor={colors.foreground} />
        <ActionBtn label="New Category" icon="shuffle" onPress={onNewCategory} color={colors.muted} textColor={colors.foreground} />
        <ActionBtn label="Next Round" icon="arrow-right" onPress={onNextRound} color={gameColor} size="md" />
      </View>
    </View>
  );
}

function WhatAmIGame({ session, gameColor, voiceKey, voiceEnabled, timerKey, onReveal, onCorrect, onSkip, currentPlayer }: any) {
  const colors = useColors();
  const s = session.whatAmIState!;
  const allRevealed = s.cluesRevealed >= 5;
  return (
    <View style={styles.gameBlock}>
      <PlayerTurnCard player={currentPlayer} color={gameColor} />
      <View style={[styles.pointsBanner, { backgroundColor: gameColor, borderRadius: 14 }]}>
        <Text style={styles.pointsBannerText}>Worth {s.pointsForCorrect} {s.pointsForCorrect === 1 ? 'point' : 'points'} right now</Text>
        <Text style={styles.pointsBannerSub}>Clue {s.cluesRevealed} of 5</Text>
      </View>
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
      <View style={styles.actionRow}>
        {!allRevealed && (
          <ActionBtn label="Next Clue" icon="eye" onPress={onReveal} color={colors.muted} textColor={colors.foreground} />
        )}
        <ActionBtn label="We Got It!" icon="check-circle" onPress={() => onCorrect(currentPlayer?.id)} color={gameColor} size="lg" />
        <ActionBtn label="Skip" onPress={onSkip} color={colors.muted} textColor={colors.mutedForeground} />
      </View>
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
});
