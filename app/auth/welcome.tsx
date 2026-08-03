import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { addXP, setUser } from '../../store/slices/userSlice';
import { unlock } from '../../store/slices/achievementsSlice';
import { useTranslation } from '../../hooks/useTranslation';
import HomieBot from '../../components/mascot/HomieBot';

function StarIcon({ size = 12, color = '#fbbf24' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L14.5 9H22L16 13.5L18 21L12 16.5L6 21L8 13.5L2 9H9.5L12 2Z" fill={color} />
    </Svg>
  );
}

function FloatingStar({ style, size, delay }: { style: any; size: number; delay: number }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[style, { opacity }]}>
      <StarIcon size={size} />
    </Animated.View>
  );
}

const FLOAT_STARS = [
  { size: 16, top: 10, left: '12%', delay: 0 },
  { size: 8, top: 30, left: '78%', delay: 300 },
  { size: 12, top: 4, left: '48%', delay: 600 },
  { size: 8, top: 90, left: '20%', delay: 900 },
  { size: 16, top: 100, left: '85%', delay: 150 },
  { size: 12, top: 60, left: '5%', delay: 450 },
] as const;

function TypingDots() {
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 150),
        ])
      )
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <View style={styles.typingBubble}>
      <View style={styles.typingDotsRow}>
        {anims.map((v, i) => (
          <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: v }] }]} />
        ))}
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.user.current);
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [typing, setTyping] = useState(false);
  const awardedRef = useRef(false);

  useEffect(() => {
    if (!awardedRef.current) {
      awardedRef.current = true;
      dispatch(addXP(20));
      dispatch(unlock('first_step'));
    }

    setVisibleMsgs(1);
    setTyping(true);
    const t1 = setTimeout(() => { setTyping(false); setVisibleMsgs(2); setTyping(true); }, 1500);
    const t2 = setTimeout(() => { setTyping(false); setVisibleMsgs(3); }, 1500 + 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!user) return null;

  const firstName = user.name?.split(' ')[0] || 'there';
  const heyWord = t('welcome_msg1_name');
  const heyCapitalized = heyWord.charAt(0).toUpperCase() + heyWord.slice(1);

  const messages = [
    `${heyWord} ${firstName}! ${t('welcome_msg1')} 😤`,
    t('welcome_msg2'),
    `${t('welcome_msg3')} 🔥`,
  ];

  const goToHome = async () => {
    await AsyncStorage.setItem('hm_welcome_shown', 'true');
    dispatch(setUser(user));
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {FLOAT_STARS.map((s, i) => (
            <FloatingStar key={i} size={s.size} delay={s.delay} style={{ position: 'absolute', top: s.top, left: s.left as any }} />
          ))}
          <HomieBot mood="celebrating" size={120} />
          <Text style={styles.title}>{t('welcome_title')}</Text>
          <Text style={styles.sub}>{heyCapitalized} {firstName}, {t('welcome_sub')}</Text>

          <View style={styles.pillRow}>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>{t('welcome_xp_badge')}</Text>
            </View>
            <View style={styles.badgePill}>
              <StarIcon size={12} color={Colors.purpleL} />
              <Text style={styles.badgePillText}>{t('welcome_first_step')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.chatSection}>
          <Text style={styles.chatLabel}>{t('welcome_message_label')}</Text>

          <View style={styles.msgGroup}>
            <HomieBot mood="happy" size={32} />
            <View style={styles.bubbleCol}>
              {visibleMsgs >= 1 && (
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{messages[0]}</Text>
                </View>
              )}
              {visibleMsgs === 1 && typing && <TypingDots />}

              {visibleMsgs >= 2 && (
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{messages[1]}</Text>
                </View>
              )}
              {visibleMsgs === 2 && typing && <TypingDots />}

              {visibleMsgs >= 3 && (
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{messages[2]}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {visibleMsgs >= 3 && (
          <TouchableOpacity style={styles.goBtn} onPress={goToHome} activeOpacity={0.9}>
            <Text style={styles.goBtnText}>{t('welcome_btn')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 40, alignItems: 'center' },
  hero: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 24, width: '100%' },
  title: { fontSize: 32, fontWeight: '900', color: Colors.white, marginTop: 16, textAlign: 'center' },
  sub: { fontSize: 16, color: '#9090c0', marginTop: 6, textAlign: 'center' },
  pillRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  xpPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  xpPillText: { color: '#fbbf24', fontWeight: '700', fontSize: 13 },
  badgePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  badgePillText: { color: '#a78bfa', fontWeight: '700', fontSize: 13 },
  divider: { height: 1, backgroundColor: '#1e1e3a', marginVertical: 20, alignSelf: 'stretch', marginHorizontal: 24 },
  chatSection: { width: '100%', paddingHorizontal: 24 },
  chatLabel: { fontSize: 12, color: '#9090c0', letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  msgGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  bubbleCol: { flex: 1, gap: 8 },
  bubble: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, paddingHorizontal: 16, maxWidth: '85%', alignSelf: 'flex-start' },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 21 },
  typingBubble: { backgroundColor: '#12102a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignSelf: 'flex-start' },
  typingDotsRow: { flexDirection: 'row', gap: 4 },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.muted },
  goBtn: { width: 220, height: 56, borderRadius: 28, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 40 },
  goBtnText: { color: Colors.white, fontWeight: '700', fontSize: 18 },
});
