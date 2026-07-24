import { View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function VoiceTabScreen() {
  useEffect(() => {
    router.push('/voice');
  }, []);
  return <View style={{ flex: 1, backgroundColor: '#07070f' }} />;
}
