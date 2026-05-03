import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Player } from '@/utils/gameEngine';
import { useColors } from '@/hooks/useColors';

interface ScoreBoardProps {
  players: Player[];
  scores: Record<string, number>;
  currentPlayerId?: string;
  compact?: boolean;
  gameColor?: string;
}

export default function ScoreBoard({
  players,
  scores,
  currentPlayerId,
  compact = false,
  gameColor,
}: ScoreBoardProps) {
  const colors = useColors();
  const accentColor = gameColor ?? colors.primary;
  const sorted = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));

  if (compact) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compactRow}>
        {sorted.map((p, i) => {
          const isCurrent = p.id === currentPlayerId;
          const isLeading = i === 0;
          return (
            <View
              key={p.id}
              style={[
                styles.compactItem,
                {
                  backgroundColor: isCurrent ? accentColor : colors.card,
                  borderRadius: 12,
                  borderWidth: isLeading && !isCurrent ? 1.5 : 0,
                  borderColor: accentColor + '50',
                },
              ]}
            >
              {isLeading && <Text style={{ fontSize: 11 }}>🏆</Text>}
              <Text style={[styles.compactName, { color: isCurrent ? '#FFF' : colors.mutedForeground }]} numberOfLines={1}>
                {p.name.length > 8 ? p.name.slice(0, 7) + '…' : p.name}
              </Text>
              <Text style={[styles.compactScore, { color: isCurrent ? '#FFF' : colors.foreground }]}>
                {scores[p.id] ?? 0}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={styles.board}>
      {sorted.map((p, i) => {
        const isCurrent = p.id === currentPlayerId;
        const isWinner = i === 0 && (scores[p.id] ?? 0) > 0;
        const score = scores[p.id] ?? 0;

        return (
          <View
            key={p.id}
            style={[
              styles.row,
              {
                backgroundColor: isCurrent ? accentColor + '18' : i === 0 ? accentColor + '08' : 'transparent',
                borderRadius: 12,
              },
            ]}
          >
            <View style={[styles.rankCircle, { backgroundColor: i === 0 ? accentColor : colors.muted }]}>
              <Text style={[styles.rankText, { color: i === 0 ? '#FFF' : colors.mutedForeground }]}>
                {i === 0 ? '🏆' : `${i + 1}`}
              </Text>
            </View>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.name,
                  { color: colors.foreground },
                  isCurrent && { fontFamily: 'Inter_700Bold', color: accentColor },
                ]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
              {isCurrent && (
                <View style={[styles.youBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.youLabel}>NOW</Text>
                </View>
              )}
            </View>
            <Text style={[styles.score, { color: isWinner ? accentColor : colors.foreground }]}>
              {score}
              <Text style={[styles.pts, { color: colors.mutedForeground }]}> pts</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 12,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    flex: 1,
  },
  score: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    minWidth: 40,
    textAlign: 'right',
  },
  pts: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  youBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  compactRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  compactName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    maxWidth: 60,
  },
  compactScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
});
