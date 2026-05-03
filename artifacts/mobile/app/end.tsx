import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/PrimaryButton';
import ScoreBoard from '@/components/ScoreBoard';
import { GAME_COLORS } from '@/data/gameColors';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';
import { getHostLine, getWinners } from '@/utils/gameEngine';

const WRAP_UP_LINES = [
  'Family peace has been restored. Mostly.',
  "That's a wrap! Well played, everyone.",
  "And that's the game! Not bad at all.",
  'Done! Someone call a trophy company.',
  "Great game. No hard feelings. Probably.",
  "The votes are in. The family has spoken.",
];

function getWrapUp() {
  return WRAP_UP_LINES[Math.floor(Math.random() * WRAP_UP_LINES.length)];
}

export default function EndScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, startGame, resetGame } = useGame();
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!session) {
      router.replace('/');
      return;
    }
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!session) return null;

  const gameColor = GAME_COLORS[session.gameId === 'alphabet-showdown' ? 'alphabet' :
    session.gameId === 'what-am-i' ? 'whatAmI' :
    session.gameId === 'category-dash' ? 'categoryDash' : 'forbiddenWord'];

  const winners = getWinners(session);
  const isTie = winners.length > 1;
  const maxScore = Math.max(...Object.values(session.scores));
  const wrapUp = getWrapUp();

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
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Trophy */}
        <Animated.View style={[styles.trophySection, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.trophyCircle, { backgroundColor: gameColor }]}>
            <Feather name="award" size={52} color="#FFF" />
          </View>
          <Text style={[styles.finishedLabel, { color: colors.mutedForeground }]}>Game Over!</Text>
          <Text style={[styles.winnerText, { color: colors.foreground }]}>
            {isTie
              ? `It's a tie! ${winners.map(w => w.name).join(' & ')}`
              : `${winners[0].name} wins!`}
          </Text>
          {maxScore > 0 && (
            <Text style={[styles.scoreLabel, { color: gameColor }]}>
              {isTie ? `${maxScore} pts each` : `${maxScore} points`}
            </Text>
          )}
          <View style={[styles.wrapUpBox, { backgroundColor: gameColor + '14', borderRadius: 14 }]}>
            <Text style={[styles.wrapUpText, { color: gameColor }]}>{wrapUp}</Text>
          </View>
        </Animated.View>

        {/* Scores */}
        {session.players.length > 1 && (
          <View style={[styles.scoreBoardSection, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Final Scores</Text>
            <ScoreBoard
              players={session.players}
              scores={session.scores}
              gameColor={gameColor}
            />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton label="Play Again" onPress={handlePlayAgain} variant="primary" size="lg" fullWidth />
          <PrimaryButton label="Try Another Game" onPress={handleTryAnother} variant="secondary" size="lg" fullWidth />
          <PrimaryButton label="Home" onPress={handleHome} variant="ghost" size="md" fullWidth />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  trophySection: {
    alignItems: 'center',
    gap: 12,
  },
  trophyCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  finishedLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: 8,
  },
  winnerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  scoreLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
  },
  wrapUpBox: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 4,
    maxWidth: 320,
  },
  wrapUpText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  scoreBoardSection: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  actions: {
    gap: 12,
  },
});
