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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.compactRow}>
        {sorted.map((p, i) => {
          const isCurrent = p.id === currentPlayerId;
          return (
            <View
              key={p.id}
              style={[
                styles.compactItem,
                {
                  backgroundColor: isCurrent ? accentColor : colors.muted,
                  borderRadius: 12,
                },
              ]}
            >
              {i === 0 && <Feather name="award" size={10} color={isCurrent ? '#FFF' : colors.mutedForeground} />}
              <Text style={[styles.compactName, { color: isCurrent ? '#FFF' : colors.mutedForeground }]}>
                {p.name.length > 7 ? p.name.slice(0, 7) + '…' : p.name}
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
    <View style={[styles.board, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
      <Text style={[styles.title, { color: colors.mutedForeground }]}>SCORES</Text>
      {sorted.map((p, i) => {
        const isCurrent = p.id === currentPlayerId;
        const isLeading = i === 0 && (scores[p.id] ?? 0) > 0;
        return (
          <View
            key={p.id}
            style={[
              styles.row,
              isCurrent && { backgroundColor: accentColor + '14' },
            ]}
          >
            <Text style={[styles.rank, { color: colors.mutedForeground }]}>{i + 1}</Text>
            <View style={styles.nameRow}>
              {isLeading && <Feather name="award" size={14} color="#F59E0B" />}
              <Text style={[styles.name, { color: colors.foreground }, isCurrent && { fontFamily: 'Inter_700Bold' }]}>
                {p.name}
              </Text>
              {isCurrent && (
                <View style={[styles.youBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.youLabel}>UP</Text>
                </View>
              )}
            </View>
            <Text style={[styles.score, { color: isCurrent ? accentColor : colors.foreground }]}>
              {scores[p.id] ?? 0}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 10,
  },
  rank: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    width: 18,
    textAlign: 'center',
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  score: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    minWidth: 32,
    textAlign: 'right',
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  youLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: '#FFF',
  },
  compactRow: {
    flexGrow: 0,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  compactName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  compactScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
});
