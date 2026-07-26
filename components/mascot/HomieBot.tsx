import React from 'react';
import { Image, View } from 'react-native';

interface Props {
  mood?: 'happy' | 'sad' | 'thinking' | 'shocked' | 'celebrating' | 'wink' | 'angry' | 'love' | 'cool' | 'sleepy';
  size?: number;
}

const MOOD_IMAGES: Record<string, any> = {
  happy: require('../../assets/images/mascot/homie-happy.png'),
  sad: require('../../assets/images/mascot/homie-sad.png'),
  thinking: require('../../assets/images/mascot/homie-thinking.png'),
  celebrating: require('../../assets/images/mascot/homie-celebrating.png'),
  angry: require('../../assets/images/mascot/homie-angry.png'),
  sleepy: require('../../assets/images/mascot/homie-sleepy.png'),
};

export default function HomieBot({ mood = 'happy', size = 80 }: Props) {
  const source = MOOD_IMAGES[mood] || MOOD_IMAGES.happy;

  return (
    <View style={{ width: size, height: size * 1.25, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.02,
          width: size * 0.56,
          height: size * 0.08,
          borderRadius: size * 0.28,
          backgroundColor: '#4c1d95',
          opacity: 0.18,
        }}
      />
      <Image source={source} style={{ width: size, height: size * 1.25 }} resizeMode="contain" />
    </View>
  );
}
