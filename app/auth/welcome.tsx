import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
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

const { height: SCREEN_H } = Dimensions.get('window');

const CONFETTI_COLORS = [Colors.purple, Colors.blue, Colors.green, Colors.yellow, Colors.pink, Colors.orange];

const CONFETTI_PIECES = Array.from({ length: 26 }).map((_, i) => ({
  left: `${(i * 41) % 100}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: (i % 9) * 140,
  size: 6 + (i % 3) * 3,
  duration: 2600 + (i % 5) * 260,
}));

function ConfettiPiece({ color, left, delay, size, duration }: { color: string; left: string; delay: number; size: number; duration: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H + 40, duration, delay, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 1, duration, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute', top: 0, left: left as any,
        width: size, height: size * 0.4, borderRadius: 2, backgroundColor: color,
        transform: [{ translateY }, { rotate: spin }],
      }}
    />
  );
}

function Confetti() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {CONFETTI_PIECES.map((p, i) => <ConfettiPiece key={i} {...p} />)}
    </View>
  );
}

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
    const t1 = setTimeout(() => { setTyping(false); setVisibleMsgs(2); setTyping(true); }, 2000);
    const t2 = setTimeout(() => { setTyping(false); setVisibleMsgs(3); setTyping(true); }, 4000);
    const t3 = setTimeout(() => { setTyping(false); setVisibleMsgs(4); }, 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!user) return null;

  const firstName = user.name?.split(' ')[0] || 'there';
  const heyWord = t('welcome_msg1_name');
  const heyCapitalized = heyWord.charAt(0).toUpperCase() + heyWord.slice(1);

  const messages = [
    `${heyWord} ${firstName}! ${t('welcome_msg1')} 😤`,
    t('welcome_msg2'),
    `${t('welcome_msg3')} 💪`,
    `${t('welcome_msg4')} 🔥`,
  ];

  const goToHome = async () => {
    await AsyncStorage.setItem('hm_welcome_shown', 'true');
    dispatch(setUser(user));
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Confetti />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {FLOAT_STARS.map((s, i) => (
            <FloatingStar key={i} size={s.size} delay={s.delay} style={{ position: 'absolute', top: s.top, left: s.left as any }} />
          ))}
          <HomieBot mood="celebrating" size={responsive.mascotSize.lg} />
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
              {visibleMsgs === 3 && typing && <TypingDots />}

              {visibleMsgs >= 4 && (
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{messages[3]}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {visibleMsgs >= 4 && (
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
  content: { paddingBottom: 40, alignItems: 'center', width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  hero: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 24, width: '100%' },
  title: { fontSize: responsive.fontSize.title, fontWeight: '900', color: Colors.white, marginTop: 16, textAlign: 'center' },
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
