import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession } from '../lib/authService';
import { setUser } from '../store/slices/userSlice';
import HomieBot from '../components/mascot/HomieBot';
import { Colors } from '../constants/theme';

const SPLASH_MS = 2500;

function LoadingDots() {
  const values = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 150),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {values.map((v, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: v }]} />
      ))}
    </View>
  );
}

export default function SplashScreen() {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, SPLASH_MS));
      try {
        const onboardingDone = await AsyncStorage.getItem('hm_onboarding_done');
        if (!onboardingDone) {
          router.replace('/onboarding');
          return;
        }
        const session = await getSession();
        if (session) {
          dispatch(setUser(session));
          router.replace('/(tabs)');
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
      <HomieBot mood="happy" size={120} />
      <Text style={styles.title}>Homie</Text>
      <Text style={styles.sub}>your AI study buddy</Text>
      <View style={styles.dotsWrap}>
        <LoadingDots />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 42, fontWeight: '900', color: '#a78bfa', letterSpacing: -1, marginTop: 20 },
  sub: { fontSize: 16, color: '#9090c0', marginTop: 8 },
  dotsWrap: { position: 'absolute', bottom: 60 },
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c3aed' },
});
