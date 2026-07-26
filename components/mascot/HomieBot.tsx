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
      {/* Layered ellipses fake a soft blur — RN has no native blur filter for shapes */}
      <View
        style={{
          position: 'absolute',
          bottom: -size * 0.02,
          width: size * 0.78,
          height: size * 0.16,
          borderRadius: size * 0.39,
          backgroundColor: '#7c3aed',
          opacity: 0.1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: size * 0.6,
          height: size * 0.12,
          borderRadius: size * 0.3,
          backgroundColor: '#6d28d9',
          opacity: 0.18,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.02,
          width: size * 0.42,
          height: size * 0.07,
          borderRadius: size * 0.21,
          backgroundColor: '#4c1d95',
          opacity: 0.3,
        }}
      />
      <Image source={source} style={{ width: size, height: size * 1.25 }} resizeMode="contain" />
    </View>
  );
}
