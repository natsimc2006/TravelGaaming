import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { type GameKey, type VoiceEvent, speakHost, stopHostVoice } from '@/utils/voiceHost';
import { useColors } from '@/hooks/useColors';

interface VoiceHostButtonProps {
  gameKey: GameKey;
  event: VoiceEvent;
  context?: Record<string, any>;
  label?: string;
  color?: string;
}

export default function VoiceHostButton({
  gameKey,
  event,
  context = {},
  label = '🔊 Read aloud',
  color,
}: VoiceHostButtonProps) {
  const colors = useColors();
  const [speaking, setSpeaking] = useState(false);

  const handlePress = () => {
    if (speaking) {
      stopHostVoice();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakHost(gameKey, event, context, { rate: 0.92, pitch: 1.03 });
    setTimeout(() => setSpeaking(false), 3000);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: colors.card,
          borderColor: color ?? colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.text, { color: color ?? colors.mutedForeground }]}>
        {speaking ? '🔇 Stop' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
});
