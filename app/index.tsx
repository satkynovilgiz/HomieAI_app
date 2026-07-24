import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { localAuth } from '../lib/auth';
import { setUser } from '../store/slices/userSlice';
import HomieBot from '../components/mascot/HomieBot';
import { Colors } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const session = await localAuth.getSession();
        if (session) {
          dispatch(setUser(session));
          router.replace('/(tabs)');
          return;
        }
        const seen = await AsyncStorage.getItem('hm_onboarded');
        if (!seen) {
          await AsyncStorage.setItem('hm_onboarded', 'true');
          router.replace('/onboarding');
        } else {
          router.replace('/auth/login');
        }
      } catch {
        router.replace('/auth/login');
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <HomieBot mood="happy" size={180} />
      <Text style={styles.title}>Homie</Text>
      <Text style={styles.sub}>Your AI Study Buddy</Text>
      <Text style={styles.tag}>100% FREE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 380, height: 380, borderRadius: 190, backgroundColor: Colors.purple, opacity: 0.07 },
  title: { fontSize: 48, fontWeight: '900', color: Colors.purpleL, marginTop: 24, letterSpacing: -1 },
  sub: { fontSize: 16, color: Colors.muted, marginTop: 8 },
  tag: { fontSize: 11, color: Colors.purple, marginTop: 14, fontWeight: '700', letterSpacing: 3 },
});
