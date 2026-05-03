import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_PACK_PREVIEWS } from '@/data/games';
import { useColors } from '@/hooks/useColors';

const PACK_COLORS = ['#FF6B35', '#4ECDC4', '#F59E0B', '#8B5CF6', '#10B981'];

export default function PacksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Game Packs',
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.foreground },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.banner, { backgroundColor: colors.accent, borderRadius: colors.radius }]}>
          <Feather name="package" size={28} color={colors.foreground} />
          <View>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Coming Soon</Text>
            <Text style={[styles.bannerSub, { color: colors.foreground + 'AA' }]}>
              Themed game packs with exclusive content
            </Text>
          </View>
        </View>

        {GAME_PACK_PREVIEWS.map((pack, i) => (
          <View
            key={pack.id}
            style={[
              styles.packCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderLeftWidth: 4,
                borderLeftColor: PACK_COLORS[i % PACK_COLORS.length],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              },
            ]}
          >
            <View style={[styles.packIcon, { backgroundColor: PACK_COLORS[i % PACK_COLORS.length] + '20' }]}>
              <Feather name={pack.icon as any} size={22} color={PACK_COLORS[i % PACK_COLORS.length]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.packName, { color: colors.foreground }]}>{pack.name}</Text>
              <Text style={[styles.packDesc, { color: colors.mutedForeground }]}>{pack.description}</Text>
            </View>
            <View style={[styles.comingSoonBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.comingSoonText, { color: colors.mutedForeground }]}>Soon</Text>
            </View>
          </View>
        ))}

        <View style={[styles.freeNote, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Feather name="check-circle" size={18} color={colors.success} />
          <Text style={[styles.freeNoteText, { color: colors.foreground }]}>
            All 4 current games are free, forever.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    marginBottom: 4,
  },
  bannerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  bannerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 2,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  packIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  packDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 3,
  },
  comingSoonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  comingSoonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  freeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginTop: 4,
  },
  freeNoteText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    flex: 1,
  },
});
