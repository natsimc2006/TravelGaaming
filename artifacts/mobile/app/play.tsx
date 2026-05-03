import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScoreBoard from '@/components/ScoreBoard';
import Timer from '@/components/Timer';
import { GAME_COLORS } from '@/data/gameColors';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import { getHostLine } from '@/utils/gameEngine';
import { saveRecentGame } from '@/utils/storage';

export default function PlayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, addPlayerScore, advanceRound, advancePlayer, newLetter, newCategory, revealClue, finishGame } = useGame();
  const [hostLine, setHostLine] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showScores, setShowScores] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace('/');
      return;
    }
    saveRecentGame(session.gameId);
    setHostLine(getHostLine('roundStart', undefined, session.round));
  }, []);

  useEffect(() => {
    if (session?.status === 'ended') {
      router.replace('/end');
    }
  }, [session?.status]);

  useEffect(() => {
    if (session) {
      setHostLine(getHostLine('roundStart', undefined, session.round));
      setTimerRunning(false);
      setTimerKey(k => k + 1);
    }
  }, [session?.round]);

  const handleEndGame = useCallback(() => {
    Alert.alert('End Game?', 'Are you sure you want to end the current game?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Game', style: 'destructive', onPress: () => finishGame() },
    ]);
  }, [finishGame]);

  if (!session) return null;

  const gameColor = GAME_COLORS[session.gameId === 'alphabet-showdown' ? 'alphabet' :
    session.gameId === 'what-am-i' ? 'whatAmI' :
    session.gameId === 'category-dash' ? 'categoryDash' : 'forbiddenWord'];

  const currentPlayer = session.players[session.currentPlayerIndex];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: gameColor }]}>
          <View style={styles.topLeft}>
            <Text style={styles.gameName}>{session.gameName}</Text>
            <Text style={styles.roundText}>Round {session.round} of {session.totalRounds}</Text>
          </View>
          <View style={styles.topRight}>
            <Pressable onPress={() => setShowScores(s => !s)} style={styles.iconBtn}>
              <Feather name="bar-chart-2" size={20} color="#FFF" />
            </Pressable>
            <Pressable onPress={handleEndGame} style={styles.iconBtn}>
              <Feather name="x-circle" size={20} color="#FFF" />
            </Pressable>
          </View>
        </View>

        {/* Host line */}
        {hostLine ? (
          <View style={[styles.hostLine, { backgroundColor: gameColor + '18' }]}>
            <Text style={[styles.hostLineText, { color: gameColor }]}>{hostLine}</Text>
          </View>
        ) : null}

        {/* Scores drawer */}
        {showScores && (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <ScoreBoard
              players={session.players}
              scores={session.scores}
              currentPlayerId={currentPlayer?.id}
              gameColor={gameColor}
            />
          </View>
        )}

        {/* Game content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {session.gameId === 'alphabet-showdown' && session.alphabetState && (
            <AlphabetGame
              session={session}
              gameColor={gameColor}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => setTimerRunning(false)}
              onScore={(id) => {
                addPlayerScore(id, 1);
                setHostLine(getHostLine('correct'));
              }}
              onNextLetter={() => { newLetter(); setHostLine('New letter coming in…'); }}
              onNewCategory={() => { newCategory(); setHostLine('Fresh category loaded.'); }}
              onNextRound={advanceRound}
              currentPlayer={currentPlayer}
            />
          )}
          {session.gameId === 'what-am-i' && session.whatAmIState && (
            <WhatAmIGame
              session={session}
              gameColor={gameColor}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onReveal={revealClue}
              onCorrect={(playerId) => {
                addPlayerScore(playerId, session.whatAmIState!.pointsForCorrect);
                setHostLine(getHostLine('correct'));
                advanceRound();
              }}
              onSkip={() => {
                setHostLine(getHostLine('skip'));
                advanceRound();
              }}
              currentPlayer={currentPlayer}
            />
          )}
          {session.gameId === 'category-dash' && session.categoryDashState && (
            <CategoryDashGame
              session={session}
              gameColor={gameColor}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => setTimerRunning(false)}
              onScore={(playerId) => addPlayerScore(playerId, 1)}
              onNewRound={() => {
                advanceRound();
                setHostLine(getHostLine('roundStart', undefined, session.round + 1));
              }}
            />
          )}
          {session.gameId === 'forbidden-word' && session.forbiddenWordState && (
            <ForbiddenWordGame
              session={session}
              gameColor={gameColor}
              timerRunning={timerRunning}
              timerKey={timerKey}
              onTimerToggle={() => setTimerRunning(r => !r)}
              onTimerEnd={() => { setTimerRunning(false); setHostLine("Time's up!"); }}
              onCorrect={() => {
                addPlayerScore(currentPlayer.id, 1);
                setHostLine(getHostLine('correct'));
                advanceRound();
                advancePlayer();
              }}
              onSkip={() => {
                setHostLine(getHostLine('skip'));
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

function BigLetter({ letter, color }: { letter: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.bigLetterBox, { backgroundColor: color, borderRadius: 24 }]}>
      <Text style={styles.bigLetter}>{letter}</Text>
    </View>
  );
}

function ActionRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.actionRow}>{children}</View>;
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
  const colors = useColors();
  const tc = textColor ?? '#FFF';
  const pv = size === 'lg' ? 18 : size === 'sm' ? 8 : 13;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 13 : 15;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: color,
        borderRadius: 14,
        paddingVertical: pv,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon && <Feather name={icon as any} size={fs} color={tc} />}
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: fs, color: tc }}>{label}</Text>
    </Pressable>
  );
}

function PlayerTurnBadge({ player, color }: { player: { name: string }; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.playerBadge, { backgroundColor: color + '18', borderRadius: 12 }]}>
      <Feather name="user" size={14} color={color} />
      <Text style={[styles.playerBadgeText, { color }]}>{player.name}'s turn</Text>
    </View>
  );
}

function AlphabetGame({ session, gameColor, timerRunning, timerKey, onTimerToggle, onTimerEnd, onScore, onNextLetter, onNewCategory, onNextRound, currentPlayer }: any) {
  const colors = useColors();
  const s = session.alphabetState!;
  return (
    <View style={styles.gameBlock}>
      <View style={styles.centeredSection}>
        <Text style={[styles.categoryLabel, { color: colors.mutedForeground }]}>Category</Text>
        <Text style={[styles.categoryName, { color: colors.foreground }]}>{s.currentCategory.name}</Text>
        <Text style={[styles.letterHint, { color: colors.mutedForeground }]}>Name something starting with…</Text>
        <BigLetter letter={s.currentLetter} color={gameColor} />
      </View>

      <View style={styles.timerRow}>
        <Timer key={timerKey} seconds={s.timerSeconds} running={timerRunning} onEnd={onTimerEnd} />
        <Pressable onPress={onTimerToggle} style={[styles.timerToggle, { backgroundColor: timerRunning ? colors.destructive + '18' : gameColor + '18', borderRadius: 10 }]}>
          <Feather name={timerRunning ? 'pause' : 'play'} size={18} color={timerRunning ? colors.destructive : gameColor} />
          <Text style={[styles.timerToggleText, { color: timerRunning ? colors.destructive : gameColor }]}>{timerRunning ? 'Pause' : 'Start timer'}</Text>
        </Pressable>
      </View>

      <View style={styles.scoreSection}>
        <Text style={[styles.scoreSectionLabel, { color: colors.mutedForeground }]}>Tap to award a point</Text>
        <View style={styles.scoreButtons}>
          {session.players.map((p: any) => (
            <Pressable
              key={p.id}
              onPress={() => onScore(p.id)}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: p.id === currentPlayer?.id ? gameColor : colors.muted,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 20, color: p.id === currentPlayer?.id ? '#FFF' : colors.foreground }}>
                {session.scores[p.id] ?? 0}
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: p.id === currentPlayer?.id ? '#FFF' : colors.mutedForeground }} numberOfLines={1}>
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ActionRow>
        <ActionBtn label="New Letter" icon="refresh-cw" onPress={onNextLetter} color={colors.muted} textColor={colors.foreground} />
        <ActionBtn label="New Category" icon="shuffle" onPress={onNewCategory} color={colors.muted} textColor={colors.foreground} />
        <ActionBtn label="Next Round" icon="arrow-right" onPress={onNextRound} color={gameColor} size="md" />
      </ActionRow>
    </View>
  );
}

function WhatAmIGame({ session, gameColor, onReveal, onCorrect, onSkip, currentPlayer }: any) {
  const colors = useColors();
  const s = session.whatAmIState!;
  const allRevealed = s.cluesRevealed >= 5;

  return (
    <View style={styles.gameBlock}>
      <PlayerTurnBadge player={currentPlayer} color={gameColor} />
      <View style={styles.centeredSection}>
        <Text style={[styles.clueCounter, { color: colors.mutedForeground }]}>
          Clue {s.cluesRevealed} of 5
        </Text>
        <Text style={[styles.pointsLabel, { color: gameColor }]}>
          {s.pointsForCorrect} {s.pointsForCorrect === 1 ? 'point' : 'points'} for getting it now
        </Text>
      </View>

      <View style={styles.cluesBox}>
        {Array.from({ length: s.cluesRevealed }, (_, i) => (
          <View key={i} style={[styles.clueCard, { backgroundColor: i === s.cluesRevealed - 1 ? gameColor + '18' : colors.muted, borderRadius: 12 }]}>
            <Text style={[styles.clueNum, { color: gameColor }]}>Clue {i + 1}</Text>
            <Text style={[styles.clueText, { color: colors.foreground, fontFamily: i === s.cluesRevealed - 1 ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
              {s.currentClues[i]}
            </Text>
          </View>
        ))}
      </View>

      <ActionRow>
        {!allRevealed && (
          <ActionBtn label="Reveal Next Clue" icon="eye" onPress={onReveal} color={colors.muted} textColor={colors.foreground} />
        )}
        <ActionBtn label="We Got It!" icon="check-circle" onPress={() => onCorrect(currentPlayer?.id)} color={gameColor} size="md" />
        <ActionBtn label="Skip" icon="skip-forward" onPress={onSkip} color={colors.muted} textColor={colors.mutedForeground} />
      </ActionRow>
    </View>
  );
}

function CategoryDashGame({ session, gameColor, timerRunning, timerKey, onTimerToggle, onTimerEnd, onScore, onNewRound }: any) {
  const colors = useColors();
  const s = session.categoryDashState!;
  return (
    <View style={styles.gameBlock}>
      <View style={styles.centeredSection}>
        <Text style={[styles.letterHint, { color: colors.mutedForeground }]}>Letter</Text>
        <BigLetter letter={s.currentLetter} color={gameColor} />
      </View>

      <View style={[styles.categoriesBox, { backgroundColor: colors.card, borderRadius: 14 }]}>
        <Text style={[styles.scoreSectionLabel, { color: colors.mutedForeground, paddingBottom: 4 }]}>Think of something for each…</Text>
        {s.currentCategories.map((cat: string, i: number) => (
          <View key={i} style={[styles.categoryRow, { borderBottomColor: colors.border, borderBottomWidth: i < 4 ? 1 : 0 }]}>
            <View style={[styles.catNum, { backgroundColor: gameColor + '22' }]}>
              <Text style={[styles.catNumText, { color: gameColor }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.catText, { color: colors.foreground }]}>{cat}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timerRow}>
        <Timer key={timerKey} seconds={s.timerSeconds} running={timerRunning} onEnd={onTimerEnd} />
        <Pressable onPress={onTimerToggle} style={[styles.timerToggle, { backgroundColor: timerRunning ? colors.destructive + '18' : gameColor + '18', borderRadius: 10 }]}>
          <Feather name={timerRunning ? 'pause' : 'play'} size={18} color={timerRunning ? colors.destructive : gameColor} />
          <Text style={[styles.timerToggleText, { color: timerRunning ? colors.destructive : gameColor }]}>{timerRunning ? 'Pause' : 'Start timer'}</Text>
        </Pressable>
      </View>

      <View style={styles.scoreSection}>
        <Text style={[styles.scoreSectionLabel, { color: colors.mutedForeground }]}>Tap to award points</Text>
        <View style={styles.scoreButtons}>
          {session.players.map((p: any) => (
            <Pressable
              key={p.id}
              onPress={() => onScore(p.id)}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.muted,
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: colors.foreground }}>
                {session.scores[p.id] ?? 0}
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.mutedForeground }} numberOfLines={1}>
                {p.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ActionRow>
        <ActionBtn label="New Round" icon="refresh-cw" onPress={onNewRound} color={gameColor} size="lg" />
      </ActionRow>
    </View>
  );
}

function ForbiddenWordGame({ session, gameColor, timerRunning, timerKey, onTimerToggle, onTimerEnd, onCorrect, onSkip, currentPlayer }: any) {
  const colors = useColors();
  const s = session.forbiddenWordState!;
  return (
    <View style={styles.gameBlock}>
      <PlayerTurnBadge player={currentPlayer} color={gameColor} />

      <View style={[styles.targetBox, { backgroundColor: gameColor, borderRadius: 20 }]}>
        <Text style={styles.targetLabel}>Target Word</Text>
        <Text style={styles.targetWord}>{s.targetWord}</Text>
        <Text style={styles.targetHint}>(Reader only — don't show the others!)</Text>
      </View>

      <View style={[styles.forbiddenBox, { backgroundColor: colors.card, borderRadius: 14 }]}>
        <Text style={[styles.scoreSectionLabel, { color: colors.destructive }]}>Do NOT say these words:</Text>
        {s.forbiddenWords.map((w: string, i: number) => (
          <View key={i} style={[styles.forbiddenRow, { borderBottomColor: colors.border, borderBottomWidth: i < 4 ? 1 : 0 }]}>
            <Feather name="slash" size={14} color={colors.destructive} />
            <Text style={[styles.forbiddenWord, { color: colors.destructive }]}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timerRow}>
        <Timer key={timerKey} seconds={s.timerSeconds} running={timerRunning} onEnd={onTimerEnd} />
        <Pressable onPress={onTimerToggle} style={[styles.timerToggle, { backgroundColor: timerRunning ? colors.destructive + '18' : gameColor + '18', borderRadius: 10 }]}>
          <Feather name={timerRunning ? 'pause' : 'play'} size={18} color={timerRunning ? colors.destructive : gameColor} />
          <Text style={[styles.timerToggleText, { color: timerRunning ? colors.destructive : gameColor }]}>{timerRunning ? 'Pause' : 'Start timer'}</Text>
        </Pressable>
      </View>

      <ActionRow>
        <ActionBtn label="Got It!" icon="check-circle" onPress={onCorrect} color={colors.success} size="lg" />
        <ActionBtn label="Skip" icon="skip-forward" onPress={onSkip} color={colors.muted} textColor={colors.mutedForeground} size="lg" />
      </ActionRow>
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
    paddingVertical: 12,
  },
  topLeft: { gap: 2 },
  gameName: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#FFF' },
  roundText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#FFFFFFCC' },
  topRight: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 6 },
  hostLine: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  hostLineText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    fontStyle: 'italic',
  },
  content: {
    padding: 16,
    gap: 20,
  },
  gameBlock: { gap: 18 },
  centeredSection: { alignItems: 'center', gap: 8 },
  categoryLabel: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  categoryName: { fontFamily: 'Inter_700Bold', fontSize: 26, textAlign: 'center' },
  letterHint: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  bigLetterBox: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  bigLetter: {
    fontFamily: 'Inter_700Bold',
    fontSize: 72,
    color: '#FFF',
  },
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timerToggleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  scoreSection: { gap: 8 },
  scoreSectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  scoreButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  clueCounter: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  pointsLabel: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  cluesBox: { gap: 8 },
  clueCard: { padding: 14, gap: 4 },
  clueNum: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  clueText: { fontSize: 16, lineHeight: 22 },
  targetBox: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  targetLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FFFFFFCC' },
  targetWord: { fontFamily: 'Inter_700Bold', fontSize: 42, color: '#FFF', textAlign: 'center' },
  targetHint: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#FFFFFFAA', marginTop: 4 },
  forbiddenBox: { padding: 14, gap: 0 },
  forbiddenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  forbiddenWord: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  categoriesBox: { padding: 12 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  catNum: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catNumText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  catText: { fontFamily: 'Inter_500Medium', fontSize: 15, flex: 1 },
  playerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  playerBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
