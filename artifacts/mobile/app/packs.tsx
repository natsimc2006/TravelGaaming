import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_PACKS } from '@/data/packs';
import { useColors } from '@/hooks/useColors';

const TAG_COLORS: Record<string, string> = {
  car: '#FF6B3D',
  dinner: '#4ECDC4',
  calm: '#8B5CF6',
  bedtime: '#6366F1',
  long: '#F59E0B',
  'all-ages': '#10B981',
  waiting: '#F59E0B',
};

export default function PacksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Game Packs</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              New content bundles, expanding the Game Host library.
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {ALL_PACKS.map(pack => {
            const isIncluded = pack.included;
            return (
              <View
                key={pack.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: isIncluded ? colors.primary + '40' : colors.border,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.packIcon,
                    { backgroundColor: isIncluded ? colors.softOrange : colors.muted },
                  ]}>
                    <Text style={{ fontSize: 24 }}>{isIncluded ? '🎮' : '🔒'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.packName, { color: colors.foreground }]}>{pack.name}</Text>
                      {isIncluded && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.badgeText}>Included</Text>
                        </View>
                      )}
                      {pack.comingSoon && (
                        <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                          <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Soon</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.packDesc, { color: colors.mutedForeground }]}>{pack.description}</Text>
                  </View>
                </View>
                <View style={styles.tagRow}>
                  {pack.tags.map(tag => (
                    <View
                      key={tag}
                      style={[styles.tag, { backgroundColor: (TAG_COLORS[tag] ?? colors.secondary) + '20' }]}
                    >
                      <Text style={[styles.tagText, { color: TAG_COLORS[tag] ?? colors.secondary }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          <View style={[styles.comingSoonCard, { backgroundColor: colors.softTeal, borderRadius: 18 }]}>
            <Text style={{ fontSize: 28 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.csTitle, { color: colors.foreground }]}>More packs are being built</Text>
              <Text style={[styles.csSub, { color: colors.mutedForeground }]}>
                Road Trip, Dinner Table, and Calm packs are in the works. They'll unlock automatically when ready.
              </Text>
            </View>
          </View>

          <View style={[styles.futureCard, { backgroundColor: colors.muted, borderRadius: 18 }]}>
            <Text style={[styles.futureTitle, { color: colors.mutedForeground }]}>ON THE HORIZON</Text>
            <View style={styles.futureList}>
              {[
                { icon: '🎙', label: 'Host Voice Styles', sub: 'Calm · Fun · Chaos' },
                { icon: '📦', label: 'Custom Packs', sub: 'Build your own content' },
                { icon: '👥', label: 'Online Multiplayer', sub: 'Play across devices' },
              ].map(item => (
                <View key={item.label} style={styles.futureItem}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                  <View>
                    <Text style={[styles.futureItemLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.futureItemSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.3 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 3, lineHeight: 18 },
  list: { padding: 16, gap: 14 },
  card: { padding: 16, gap: 14 },
  cardHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  packIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  packName: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FFF' },
  packDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  tagText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  comingSoonCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 14 },
  csTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  csSub: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4, lineHeight: 18 },
  futureCard: { padding: 18, gap: 14 },
  futureTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1 },
  futureList: { gap: 16 },
  futureItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  futureItemLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  futureItemSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
});
