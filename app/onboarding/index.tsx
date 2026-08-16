import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Animated,
  NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationKey } from '../../constants/translations';
import HomieBot from '../../components/mascot/HomieBot';
import { MicIcon, VideoIcon, GameIcon, CameraIcon, CalendarIcon, GemIcon, TrophyIcon, FlameIcon } from '../../components/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

async function markOnboardingDone() {
  try { await AsyncStorage.setItem('hm_onboarding_done', 'true'); } catch {}
}

function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L14.5 9H22L16 13.5L18 21L12 16.5L6 21L8 13.5L2 9H9.5L12 2Z" fill="#fbbf24" />
    </Svg>
  );
}

function HeartIconSmall() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21C12 21 3 15 3 8.5C3 5.4 5.4 3 8.5 3C10.2 3 11.7 3.8 12 4.5C12.3 3.8 13.8 3 15.5 3C18.6 3 21 5.4 21 8.5C21 15 12 21 12 21Z" fill="#ef4444" />
    </Svg>
  );
}

// Floats down from just above the mascot, loops back to the top, staggered by `delay`.
function ConfettiPiece({ color, left, delay }: { color: string; left: number; delay: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 170, duration: 3200, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration: 3200, useNativeDriver: true }),
        ]),
        Animated.timing(translateY, { toValue: -20, duration: 0, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[styles.confetti, { left, backgroundColor: color, transform: [{ translateY }, { rotate: spin }] }]}
    />
  );
}

const CONFETTI = [
  { color: '#7c3aed', left: 10, delay: 0 },
  { color: '#f97316', left: 55, delay: 300 },
  { color: '#10b981', left: 100, delay: 600 },
  { color: '#3b82f6', left: 150, delay: 150 },
  { color: '#fda4af', left: 195, delay: 450 },
  { color: '#7c3aed', left: 235, delay: 750 },
  { color: '#f97316', left: 275, delay: 200 },
  { color: '#10b981', left: 30, delay: 900 },
];

function PulsingStar({ style }: { style: any }) {
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.85, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <StarIcon size={18} />
    </Animated.View>
  );
}

function Slide1() {
  return (
    <View style={styles.topHalf}>
      <View style={styles.purpleGlow} />
      <View style={styles.confettiWrap} pointerEvents="none">
        {CONFETTI.map((c, i) => <ConfettiPiece key={i} {...c} />)}
      </View>
      <HomieBot mood="celebrating" size={responsive.mascotSize.xl} />
    </View>
  );
}

function Slide2() {
  return (
    <View style={[styles.topHalf, styles.slide2Row]}>
      <HomieBot mood="happy" size={responsive.mascotSize.md} />
      <View style={styles.bubbleCol}>
        <View style={[styles.bubble, styles.bubbleDark]}>
          <Text style={styles.bubbleTextDark}>explain derivatives bro</Text>
        </View>
        <View style={[styles.bubble, styles.bubblePurple]}>
          <Text style={styles.bubbleTextLight}>okay so a derivative is basically how fast something changes. think of your car speedometer. fr.</Text>
        </View>
        <View style={[styles.bubble, styles.bubbleDark]}>
          <Text style={styles.bubbleTextDark}>quiz me on it</Text>
        </View>
        <View style={[styles.bubble, styles.bubblePurple]}>
          <Text style={styles.bubbleTextLight}>bet, here is a question...</Text>
        </View>
      </View>
    </View>
  );
}

function Slide3() {
  const { t } = useTranslation();
  const barAnim = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: 0.8, duration: 1200, useNativeDriver: false }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.topHalf}>
      <Animated.Text style={[styles.xpBig, { opacity: shimmer }]}>+50 XP</Animated.Text>
      <View style={styles.xpTrack}>
        <Animated.View style={[styles.xpFill, { width: barWidth }]} />
      </View>
      <View style={styles.statsInlineRow}>
        {[0, 1, 2, 3, 4].map(i => <HeartIconSmall key={i} />)}
        <View style={{ width: 12 }} />
        <GemIcon color={Colors.blue} size={16} />
        <Text style={styles.statsInlineText}>500</Text>
      </View>
      <View style={styles.streakPillOnboard}>
        <FlameIcon color={Colors.orange} size={14} />
        <Text style={styles.streakPillOnboardText}>7 {t('home_streak')}</Text>
      </View>
      <View style={styles.achievementCard}>
        <TrophyIcon color={Colors.yellow} size={22} />
        <View style={{ flex: 1 }}>
          <Text style={styles.achievementTitle}>{t('onboarding_achievement_title')}</Text>
          <Text style={styles.achievementDesc}>{t('onboarding_achievement_desc')}</Text>
        </View>
      </View>
    </View>
  );
}

const FEATURES: { key: TranslationKey; Icon: any; color: string }[] = [
  { key: 'onboarding_feature_voice', Icon: MicIcon, color: '#22d3ee' },
  { key: 'onboarding_feature_video', Icon: VideoIcon, color: '#f97316' },
  { key: 'more_games',    Icon: GameIcon, color: '#10b981' },
  { key: 'more_scan',     Icon: CameraIcon, color: '#f43f5e' },
  { key: 'more_planner',  Icon: CalendarIcon, color: '#3b82f6' },
  { key: 'more_recorder', Icon: MicIcon, color: '#ef4444' },
];

function Slide4() {
  const { t } = useTranslation();
  return (
    <View style={[styles.topHalf, styles.featureGridWrap]}>
      <View style={styles.featureGrid}>
        {FEATURES.map(({ key, Icon, color }) => (
          <View key={key} style={styles.featureBox}>
            <Icon color={color} size={22} />
            <Text style={styles.featureLabel}>{t(key)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Slide5() {
  const { t } = useTranslation();
  return (
    <View style={styles.topHalf}>
      <View style={styles.mascotStarsWrap}>
        <PulsingStar style={styles.starTL} />
        <PulsingStar style={styles.starTR} />
        <PulsingStar style={styles.starBL} />
        <PulsingStar style={styles.starBR} />
        <HomieBot mood="celebrating" size={responsive.mascotSize.lg} />
      </View>
      <View style={styles.statsFinalRow}>
        <View style={styles.statFinal}>
          <Text style={styles.statFinalValue}>100%</Text>
          <Text style={styles.statFinalLabel}>{t('onboarding_stat_free')}</Text>
        </View>
        <View style={styles.statFinal}>
          <Text style={styles.statFinalValue}>9+</Text>
          <Text style={styles.statFinalLabel}>{t('onboarding_stat_subjects')}</Text>
        </View>
        <View style={styles.statFinal}>
          <Text style={styles.statFinalValue}>10+</Text>
          <Text style={styles.statFinalLabel}>{t('onboarding_stat_tools')}</Text>
        </View>
      </View>
    </View>
  );
}

const SLIDES: { key: string; Top: any; titleKey: TranslationKey; subKey: TranslationKey }[] = [
  { key: '1', Top: Slide1, titleKey: 'onboarding_slide1_title', subKey: 'onboarding_slide1_sub' },
  { key: '2', Top: Slide2, titleKey: 'onboarding_slide2_title', subKey: 'onboarding_slide2_sub' },
  { key: '3', Top: Slide3, titleKey: 'onboarding_slide3_title', subKey: 'onboarding_slide3_sub' },
  { key: '4', Top: Slide4, titleKey: 'onboarding_slide4_title', subKey: 'onboarding_slide4_sub' },
  { key: '5', Top: Slide5, titleKey: 'onboarding_slide5_title', subKey: 'onboarding_slide5_sub' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const listRef = useRef<FlatList>(null);
  const isLast = idx === SLIDES.length - 1;

  // scrollToIndex/getItemLayout are unreliable on react-native-web (the page
  // often doesn't actually move even though it reports success), so slides
  // are paged with a plain pixel offset instead — that works everywhere.
  const goTo = (i: number) => {
    listRef.current?.scrollToOffset({ offset: i * screenWidth, animated: true });
    setIdx(i);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setIdx(newIdx);
  };

  const finish = async (dest: '/auth/signup' | '/auth/login') => {
    await markOnboardingDone();
    router.replace(dest);
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[number] }) => {
    const { Top, titleKey, subKey } = item;
    return (
      <View style={{ width: screenWidth }}>
        <Top />
        <View style={styles.bottomHalf}>
          <Text style={styles.slideTitle}>{t(titleKey)}</Text>
          <Text style={styles.slideSub}>{t(subKey)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        {!isLast ? (
          <TouchableOpacity onPress={() => goTo(SLIDES.length - 1)}>
            <Text style={styles.skipText}>{t('onboarding_skip')}</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
        <Text style={styles.counterText}>{idx + 1} {t('onboarding_of')} {SLIDES.length}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={s => s.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        style={{ flex: 1 }}
      />

      <View style={styles.pageDotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.pageDot, i === idx && styles.pageDotActive]} />
        ))}
      </View>

      <View style={styles.bottomBtnArea}>
        {!isLast ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => goTo(idx + 1)} activeOpacity={0.9}>
            <Text style={styles.nextBtnText}>{t('onboarding_next')}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.ctaPrimary} onPress={() => finish('/auth/signup')} activeOpacity={0.9}>
              <Text style={styles.ctaPrimaryText}>{t('onboarding_get_started')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaSecondary} onPress={() => finish('/auth/login')} activeOpacity={0.85}>
              <Text style={styles.ctaSecondaryText}>{t('onboarding_have_account')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 44 },
  skipText: { fontSize: 14, color: '#9090c0' },
  counterText: { fontSize: 13, color: '#9090c0' },

  topHalf: { flex: 1.2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  bottomHalf: { paddingHorizontal: 28, paddingBottom: 8, alignItems: 'center', width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  slideTitle: { fontSize: responsive.fontSize.title, fontWeight: '900', color: Colors.white, textAlign: 'center' },
  slideSub: { fontSize: responsive.fontSize.lg, color: '#9090c0', textAlign: 'center', lineHeight: 24, marginTop: 10 },

  purpleGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(124,58,237,0.15)' },
  confettiWrap: { position: 'absolute', width: '100%', height: 200, top: -20 },
  confetti: { position: 'absolute', top: 0, width: 8, height: 12, borderRadius: 2 },

  slide2Row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bubbleCol: { flex: 1, gap: 8 },
  bubble: { maxWidth: '100%', padding: 10, borderRadius: 14 },
  bubbleDark: { backgroundColor: Colors.bg3, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubblePurple: { backgroundColor: Colors.purple, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleTextDark: { fontSize: 12, color: Colors.text },
  bubbleTextLight: { fontSize: 12, color: Colors.white },

  xpBig: { fontSize: 64, fontWeight: '900', color: '#fbbf24' },
  xpTrack: { width: '80%', height: 10, borderRadius: 5, backgroundColor: Colors.bg4, overflow: 'hidden', marginTop: 16 },
  xpFill: { height: '100%', borderRadius: 5, backgroundColor: Colors.purple },
  statsInlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 3 },
  statsInlineText: { fontSize: 14, fontWeight: '800', color: Colors.blue, marginLeft: 4 },
  streakPillOnboard: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)', marginTop: 14 },
  streakPillOnboardText: { fontSize: 12, fontWeight: '700', color: Colors.orange },
  achievementCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bg2, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)', padding: 12, marginTop: 16, width: '100%' },
  achievementTitle: { fontSize: 12, fontWeight: '900', color: Colors.text },
  achievementDesc: { fontSize: 11, color: Colors.muted, marginTop: 2 },

  featureGridWrap: { paddingHorizontal: 8 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  featureBox: { width: (Math.min(SCREEN_WIDTH, responsive.maxWidth) - 48 - 10) / 2, backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: 12, padding: 14, alignItems: 'center', gap: 8 },
  featureLabel: { fontSize: 12, fontWeight: '700', color: Colors.white, textAlign: 'center' },

  mascotStarsWrap: { alignItems: 'center', justifyContent: 'center', width: 200, height: 180 },
  starTL: { position: 'absolute', top: 4, left: 10 },
  starTR: { position: 'absolute', top: 4, right: 10 },
  starBL: { position: 'absolute', bottom: 10, left: 20 },
  starBR: { position: 'absolute', bottom: 10, right: 20 },
  statsFinalRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 8 },
  statFinal: { alignItems: 'center' },
  statFinalValue: { fontSize: 22, fontWeight: '900', color: Colors.purpleL },
  statFinalLabel: { fontSize: 11, color: '#9090c0', marginTop: 3, textAlign: 'center' },

  pageDotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 16 },
  pageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  pageDotActive: { width: 24, height: 8, borderRadius: 4, backgroundColor: '#7c3aed' },

  bottomBtnArea: { paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  nextBtn: { width: 160, height: 52, borderRadius: 26, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  ctaPrimary: { width: '100%', height: 56, borderRadius: 28, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  ctaPrimaryText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  ctaSecondary: { width: '100%', height: 48, borderRadius: 24, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#555', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  ctaSecondaryText: { color: '#9090c0', fontSize: 14 },
});
