import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type MascotMood = 'happy' | 'cheer' | 'think' | 'sleepy';

/** "Pip" — the app's host mascot. Original character: a round little traveller with a pointy cap. */
export default function Mascot({ size = 72, mood = 'happy' }: { size?: number; mood?: MascotMood }) {
  const eyeY = 46;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* cap */}
      <Path d="M30 34 52 6l20 28z" fill="#F26B38" />
      <Path d="M30 34h42a4 4 0 0 1 0 8H30a4 4 0 0 1 0-8z" fill="#C94E1F" />
      <Circle cx="52" cy="6" r="5" fill="#FFE6A8" />
      {/* body */}
      <Ellipse cx="50" cy="64" rx="34" ry="30" fill="#FFC857" />
      <Ellipse cx="50" cy="72" rx="24" ry="18" fill="#FFE29A" />
      {/* cheeks */}
      <Circle cx="29" cy="62" r="6" fill="#FF9B7A" opacity="0.7" />
      <Circle cx="71" cy="62" r="6" fill="#FF9B7A" opacity="0.7" />
      {/* eyes */}
      {mood === 'sleepy' ? (
        <G stroke="#2A2350" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <Path d="M32 52q6 5 12 0M56 52q6 5 12 0" />
        </G>
      ) : mood === 'cheer' ? (
        <G stroke="#2A2350" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <Path d="M32 54q6-9 12 0M56 54q6-9 12 0" />
        </G>
      ) : (
        <G fill="#2A2350">
          <Circle cx="38" cy={eyeY + 6} r="5" />
          <Circle cx="62" cy={eyeY + 6} r="5" />
          <Circle cx="40" cy={eyeY + 4} r="1.8" fill="#FFF" />
          <Circle cx="64" cy={eyeY + 4} r="1.8" fill="#FFF" />
        </G>
      )}
      {/* mouth */}
      {mood === 'think' ? (
        <Path d="M44 70h12" stroke="#2A2350" strokeWidth="3.5" strokeLinecap="round" />
      ) : mood === 'cheer' ? (
        <Path d="M40 66q10 16 20 0z" fill="#2A2350" />
      ) : (
        <Path d="M42 67q8 9 16 0" stroke="#2A2350" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}
    </Svg>
  );
}
