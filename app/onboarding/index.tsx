import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';

const { width } = Dimensions.get('window');

const SLIDES = [
  { mood: 'celebrating' as const, accent: '#7c3aed', title: 'Meet Homie!', sub: 'Your AI study buddy who actually wants you to succeed. 100% free, always.' },
  { mood: 'happy' as const,       accent: '#10b981', title: 'Study Like a Game', sub: 'Earn XP, maintain streaks, unlock achievements. Learning has never been this fun.' },
  { mood: 'thinking' as const,    accent: '#3b82f6', title: 'AI Chat + Lessons', sub: 'Ask Homie anything, take structured lessons, use voice mode — all in one app.' },
  { mood: 'happy' as const,       accent: '#f97316', title: 'Challenge Friends', sub: 'Add friends, race for XP, climb the leaderboard together.' },
  { mood: 'celebrating' as const, accent: '#7c3aed', title: "Let's Go!", sub: 'Create your free account in seconds. No credit card needed.' },
];

export default function OnboardingScreen() {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: slide.accent + '18' }]}>
      {!isLast && (
        <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <View style={[styles.glow, { backgroundColor: slide.accent }]} />
        <HomieBot mood={slide.mood} size={190} />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.sub}>{slide.sub}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setIdx(i)}>
            <View style={[styles.dot, i === idx && [styles.dotActive, { backgroundColor: slide.accent }]]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          onPress={() => isLast ? router.replace('/auth/signup') : setIdx(i => i + 1)}
          style={[styles.nextBtn, { backgroundColor: slide.accent }]}
          activeOpacity={0.9}
        >
          <Text style={styles.nextBtnText}>{isLast ? 'Create Free Account' : 'Next'}</Text>
        </TouchableOpacity>
        {idx === 0 && (
          <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  skip: { position: 'absolute', top: 52, right: 24, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.1, top: '10%' },
  title: { fontSize: 32, fontWeight: '900', color: Colors.text, textAlign: 'center' },
  sub: { fontSize: 16, color: Colors.muted, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 26 },
  bottom: { padding: 24, gap: 14 },
  nextBtn: { paddingVertical: 16, borderRadius: Radius.lg, alignItems: 'center' },
  nextBtnText: { color: 'white', fontWeight: '900', fontSize: 17 },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: Colors.muted },
});
