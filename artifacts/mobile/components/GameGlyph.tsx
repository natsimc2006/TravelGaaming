import React from 'react';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { GAME_COLORS, GAME_COLORS_DEEP, type GameColorKey } from '@/data/gameColors';
import { View } from 'react-native';

/**
 * Custom illustrated glyphs for each game — replaces generic icon-font icons and emoji.
 * Drawn on a 48×48 grid in white, with a translucent secondary tone for depth.
 */
const W = '#FFFFFF';
const W2 = 'rgba(255,255,255,0.55)';

function Glyph({ k }: { k: GameColorKey }) {
  switch (k) {
    case 'alphabet':
      return (
        <G>
          <Rect x="5" y="9" width="23" height="27" rx="6" fill={W2} transform="rotate(-10 16 22)" />
          <Rect x="17" y="12" width="26" height="28" rx="7" fill={W} />
          <SvgText x="30" y="35" fontSize="24" fontWeight="700" fontFamily="Fredoka_600SemiBold" fill={GAME_COLORS.alphabet} textAnchor="middle">A</SvgText>
        </G>
      );
    case 'whatAmI':
      return (
        <G>
          <Path d="M8 14a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H24l-9 7v-7a8 8 0 0 1-7-8z" fill={W} />
          <SvgText x="24" y="29" fontSize="22" fontWeight="700" fontFamily="Fredoka_600SemiBold" fill={GAME_COLORS.whatAmI} textAnchor="middle">?</SvgText>
        </G>
      );
    case 'categoryDash':
      return (
        <G>
          <Path d="M27 4 10 27h11l-3 17 20-26H26z" fill={W} />
          <Path d="M5 15h8M3 22h8M6 29h6" stroke={W2} strokeWidth="3" strokeLinecap="round" />
        </G>
      );
    case 'forbiddenWord':
      return (
        <G>
          <Path d="M7 12a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H22l-8 7v-7h-1a6 6 0 0 1-6-6z" fill={W2} />
          <Circle cx="24" cy="24" r="12" fill="none" stroke={W} strokeWidth="5" />
          <Path d="M15.5 32.5 32.5 15.5" stroke={W} strokeWidth="5" strokeLinecap="round" />
        </G>
      );
    case 'wouldYouRather':
      return (
        <G>
          <Circle cx="17" cy="24" r="12" fill={W} />
          <Circle cx="31" cy="24" r="12" fill={W2} />
          <SvgText x="17" y="30" fontSize="16" fontFamily="Fredoka_600SemiBold" fill={GAME_COLORS.wouldYouRather} textAnchor="middle">A</SvgText>
          <SvgText x="32" y="30" fontSize="16" fontFamily="Fredoka_600SemiBold" fill={GAME_COLORS_DEEP.wouldYouRather} textAnchor="middle">B</SvgText>
        </G>
      );
    case 'rapidFire':
      return (
        <G>
          <Rect x="19" y="3" width="10" height="5" rx="2" fill={W} />
          <Circle cx="24" cy="27" r="16" fill={W} />
          <Path d="M24 27V16" stroke={GAME_COLORS.rapidFire} strokeWidth="4" strokeLinecap="round" />
          <Path d="M24 27l7 5" stroke={GAME_COLORS.rapidFire} strokeWidth="4" strokeLinecap="round" />
          <Path d="M38 9l3 3" stroke={W2} strokeWidth="4" strokeLinecap="round" />
        </G>
      );
    case 'guessTheSound':
      return (
        <G>
          <Path d="M6 19h8l10-8v26l-10-8H6z" fill={W} />
          <Path d="M31 17a10 10 0 0 1 0 14" stroke={W} strokeWidth="4" strokeLinecap="round" fill="none" />
          <Path d="M37 11a19 19 0 0 1 0 26" stroke={W2} strokeWidth="4" strokeLinecap="round" fill="none" />
        </G>
      );
    case 'thisOrThat':
      return (
        <G>
          <Path d="M10 17h24M27 9l8 8-8 8" stroke={W} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M38 33H14M21 25l-8 8 8 8" stroke={W2} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>
      );
    case 'riddles':
      return (
        <G>
          <Path d="M24 4a14 14 0 0 0-8 25.5V33h16v-3.5A14 14 0 0 0 24 4z" fill={W} />
          <Rect x="17" y="36" width="14" height="4" rx="2" fill={W2} />
          <Rect x="20" y="42" width="8" height="3" rx="1.5" fill={W2} />
          <Path d="M24 14v8M20 22h8" stroke={GAME_COLORS.riddles} strokeWidth="3" strokeLinecap="round" />
        </G>
      );
  }
}

export default function GameGlyph({ gameKey, size = 28 }: { gameKey: GameColorKey; size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Glyph k={gameKey} />
      </Svg>
    </View>
  );
}

/** Rounded game tile with a darker "3D" bottom edge. */
export function GameTile({ gameKey, size = 56 }: { gameKey: GameColorKey; size?: number }) {
  const r = size * 0.3;
  return (
    <View
      style={{
        width: size,
        height: size + 4,
        borderRadius: r,
        backgroundColor: GAME_COLORS_DEEP[gameKey],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: GAME_COLORS[gameKey],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GameGlyph gameKey={gameKey} size={size * 0.72} />
      </View>
    </View>
  );
}
