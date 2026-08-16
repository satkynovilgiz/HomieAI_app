import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import ContentWrapper from '../../components/ui/ContentWrapper';
import { xpProgress } from '../../lib/utils';
import { checkInToday } from '../../store/slices/streakSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationKey } from '../../constants/translations';
import HomieBot from '../../components/mascot/HomieBot';
import HeartsBar from '../../components/ui/HeartsBar';
import AchievementPopup from '../../components/achievements/AchievementPopup';
import { useAchievements } from '../../hooks/useAchievements';
import {
  ChatBubbleIcon, BookIcon, VideoIcon, GameIcon, TimerIcon,
  DetectorIcon, ShopIcon, TrophyIcon, CalendarIcon, PenIcon, CameraIcon,
  FlameIcon, GemIcon, ArrowRightIcon, LockFocusIcon,
} from '../../components/icons';
import Svg, { Path, Circle } from 'react-native-svg';

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10C6 6.7 8.7 4 12 4C15.3 4 18 6.7 18 10V14L20 17H4L6 14V10Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M9.5 19C9.5 20.4 10.6 21.5 12 21.5C13.4 21.5 14.5 20.4 14.5 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M19.4 15C19.2 15.5 19.3 16.1 19.7 16.5L19.8 16.6C20.5 17.3 20.5 18.4 19.8 19.1C19.1 19.8 18 19.8 17.3 19.1L17.2 19C16.8 18.6 16.2 18.5 15.7 18.7C15.2 18.9 14.9 19.4 14.9 19.9V20.1C14.9 21.1 14.1 21.9 13.1 21.9H10.9C9.9 21.9 9.1 21.1 9.1 20.1V19.9C9.1 19.4 8.8 18.9 8.3 18.7C7.8 18.5 7.2 18.6 6.8 19L6.7 19.1C6 19.8 4.9 19.8 4.2 19.1C3.5 18.4 3.5 17.3 4.2 16.6L4.3 16.5C4.7 16.1 4.8 15.5 4.6 15C4.4 14.5 3.9 14.2 3.4 14.2H3.2C2.2 14.2 1.4 13.4 1.4 12.4V11.6C1.4 10.6 2.2 9.8 3.2 9.8H3.4C3.9 9.8 4.4 9.5 4.6 9C4.8 8.5 4.7 7.9 4.3 7.5L4.2 7.4C3.5 6.7 3.5 5.6 4.2 4.9C4.9 4.2 6 4.2 6.7 4.9L6.8 5C7.2 5.4 7.8 5.5 8.3 5.3C8.8 5.1 9.1 4.6 9.1 4.1V3.9C9.1 2.9 9.9 2.1 10.9 2.1H13.1C14.1 2.1 14.9 2.9 14.9 3.9V4.1C14.9 4.6 15.2 5.1 15.7 5.3C16.2 5.5 16.8 5.4 17.2 5L17.3 4.9C18 4.2 19.1 4.2 19.8 4.9C20.5 5.6 20.5 6.7 19.8 7.4L19.7 7.5C19.3 7.9 19.2 8.5 19.4 9C19.6 9.5 20.1 9.8 20.6 9.8H20.8C21.8 9.8 22.6 10.6 22.6 11.6V12.4C22.6 13.4 21.8 14.2 20.8 14.2H20.6C20.1 14.2 19.6 14.5 19.4 15Z" stroke={color} strokeWidth="1.5" fill="none"/>
    </Svg>
  );
}

type HomieMood = 'happy' | 'sad' | 'thinking' | 'shocked' | 'celebrating' | 'wink' | 'angry' | 'love' | 'cool' | 'sleepy';

// Hero mascot mood and greeting line both key off local time-of-day, independent
// of streak/study state (that's what the old greeting used) — this is a
// deliberate redesign per spec, not a bug carried over from the old version.
// Note: HomieBot's own MOOD_IMAGES map has no 'cool' asset yet, so the
// afternoon slot currently renders the same image as 'happy' until a
// homie-cool.png is added — a pre-existing gap in that shared component.
function getTimeContext(): { greetingKey: TranslationKey; mood: HomieMood } {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return { greetingKey: 'home_greeting_morning', mood: 'happy' };
  if (hour >= 12 && hour < 18) return { greetingKey: 'home_greeting_afternoon', mood: 'cool' };
  if (hour >= 18 && hour < 22) return { greetingKey: 'home_greeting_evening', mood: 'thinking' };
  return { greetingKey: 'home_greeting_night', mood: 'sleepy' };
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const QUICK_ACTIONS: { label: string; key: TranslationKey; route: string; color: string }[] = [
  { label: 'AI Chat',    key: 'qa_ai_chat',       route: '/chat',          color: '#7c3aed' },
  { label: 'Lessons',    key: 'qa_lessons',       route: '/lessons',       color: '#3b82f6' },
  { label: 'Videos',     key: 'more_videos',      route: '/videos',        color: '#f97316' },
  { label: 'Games',      key: 'more_games',       route: '/games',         color: '#10b981' },
  { label: 'Pomodoro',   key: 'more_pomodoro',    route: '/pomodoro',      color: '#ef4444' },
  { label: 'AI Check',   key: 'more_detector',    route: '/detector',      color: '#fbbf24' },
  { label: 'Shop',       key: 'more_shop',        route: '/shop',          color: '#3b82f6' },
  { label: 'Badges',     key: 'more_achievements', route: '/achievements',  color: '#f59e0b' },
  { label: 'Planner',    key: 'more_planner',     route: '/planner',       color: '#8b5cf6' },
  { label: 'Essay',      key: 'more_essay',       route: '/essay',         color: '#84cc16' },
  { label: 'Scan',       key: 'more_scan',        route: '/scanner',       color: '#f43f5e' },
  { label: 'Deep Study', key: 'more_focus',       route: '/focus',         color: '#6366f1' },
];

const QUICK_ACTION_ICONS: Record<string, React.ComponentType<{ color: string; size: number }>> = {
  'AI Chat': ChatBubbleIcon,
  'Lessons': BookIcon,
  'Videos': VideoIcon,
  'Games': GameIcon,
  'Pomodoro': TimerIcon,
  'AI Check': DetectorIcon,
  'Shop': ShopIcon,
  'Badges': TrophyIcon,
  'Planner': CalendarIcon,
  'Essay': PenIcon,
  'Scan': CameraIcon,
  'Deep Study': LockFocusIcon,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_COLS = responsive.columns.actions;
const CARD_SIZE = (Math.min(SCREEN_WIDTH, responsive.maxWidth) - responsive.padding * 2 - 10 * (ACTION_COLS - 1)) / ACTION_COLS;

export default function HomeTab() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
  const gems = useSelector((s: RootState) => s.gems.count);
  const notifUnread = useSelector((s: RootState) => s.notifications.unread);
  const { newlyEarned, dismissNew } = useAchievements();

  useEffect(() => {
    if (!user) { router.replace('/auth/login'); return; }
    dispatch(checkInToday());
  }, []);

  if (!user) return null;

  const { greetingKey, mood } = getTimeContext();
  const todayIdx = new Date().getDay();
  const firstName = user.name?.split(' ')[0];
  const xpPct = xpProgress(user.xp);
  const xpToNext = 100 - (user.xp % 100);

  return (
    <SafeAreaView style={styles.safe}>
      <AchievementPopup achievement={newlyEarned} onDismiss={dismissNew} />

      {/* Top bar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.push('/streak')} style={styles.streakPill}>
          <FlameIcon color={Colors.orange} size={14} />
          <Text style={styles.streakPillText}>{streak.current} {t('home_streak')}</Text>
        </TouchableOpacity>

        <HeartsBar onRefill={() => router.push('/shop')} />

        <View style={styles.topRight}>
          <TouchableOpacity onPress={() => router.push('/shop')} style={styles.gemsPill}>
            <GemIcon color={Colors.blue} size={14} />
            <Text style={styles.gemsPillText}>{gems.toLocaleString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
            <BellIcon color={Colors.muted} />
            {notifUnread > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notifUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
            <SettingsIcon color={Colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
       <ContentWrapper>
        {/* Hero / greeting */}
        <LinearGradient
          colors={['#0d0b22', '#12102a']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <HomieBot mood={mood} size={responsive.mascotSize.sm} />
          <View style={styles.heroText}>
            <Text style={styles.heroGreeting}>{t(greetingKey)}</Text>
            <Text style={styles.heroName}>{firstName}</Text>
            <Text style={styles.heroSub}>Lv.{user.level} · {user.xp} XP</Text>
            <View style={styles.heroXpTrack}>
              <View style={[styles.heroXpFill, { width: `${xpPct * 100}%` }]} />
            </View>
            <Text style={styles.heroXpLabel}>{xpToNext} {t('home_xp_to')} {user.level + 1}</Text>
          </View>
        </LinearGradient>

        <View style={{ height: 12 }} />

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.purpleL }]}>{user.sessions || 0}</Text>
            <Text style={styles.statLabel}>{t('home_sessions')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.green }]}>{user.correct || 0}</Text>
            <Text style={styles.statLabel}>{t('home_correct')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.orange }]}>{streak.current}d</Text>
            <Text style={styles.statLabel}>{t('home_streak_label')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.blue }]}>{gems}</Text>
            <Text style={styles.statLabel}>{t('home_gems')}</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />

        {/* Streak banner */}
        <TouchableOpacity style={styles.streakBanner} onPress={() => router.push('/streak')} activeOpacity={0.85}>
          <View style={styles.streakBannerTop}>
            <View style={styles.streakBannerLeft}>
              <FlameIcon color={Colors.orange} size={18} />
              <Text style={styles.streakBannerTitle}>{streak.current} {t('home_streak')}</Text>
            </View>
            <Text style={styles.streakBannerSub}>{t('home_keep_going')}</Text>
          </View>
          <View style={styles.weekRow}>
            {DAY_LABELS.map((d, i) => {
              const studied = streak.weekActivity[i] === true;
              const isTodayPending = i === todayIdx && !studied;
              return (
                <View key={i} style={styles.dayCol}>
                  <View style={[styles.dayDot, studied && styles.dayDotFilled, isTodayPending && styles.dayDotToday]}>
                    {studied && (
                      <Svg width={14} height={14} viewBox="0 0 24 24">
                        <Path d="M4 12l6 6L20 6" stroke={Colors.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </Svg>
                    )}
                  </View>
                  <Text style={[styles.dayLabel, i === todayIdx && { color: Colors.orange }]}>{d}</Text>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        {/* Daily quest */}
        <View style={styles.questCard}>
          <View style={styles.questDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.questTitle}>{t('home_daily_quest')}</Text>
            <Text style={styles.questSub}>{t('home_daily_quest_sub')}</Text>
          </View>
          <TouchableOpacity style={styles.questBtn} onPress={() => router.push('/lessons')} activeOpacity={0.85}>
            <Text style={styles.questBtnText}>{t('home_go')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 12 }} />

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>{t('home_quick_actions')}</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map(({ label, key, route, color }) => {
            const Icon = QUICK_ACTION_ICONS[label];
            return (
              <TouchableOpacity
                key={label}
                style={styles.actionCard}
                onPress={() => router.push(route as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: color + '26' }]}>
                  <Icon color={color} size={22} />
                </View>
                <Text style={styles.actionLabel}>{t(key)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 12 }} />

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBanner} onPress={() => router.push('/chat')} activeOpacity={0.85}>
          <HomieBot mood="happy" size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>{t('home_ready')}</Text>
            <Text style={styles.ctaSub}>{t('home_waiting')}</Text>
          </View>
          <ArrowRightIcon color={Colors.purple} size={20} />
        </TouchableOpacity>
       </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topbar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: responsive.padding },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(249,115,22,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)' },
  streakPillText: { fontSize: 12, fontWeight: '700', color: Colors.orange },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gemsPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(59,130,246,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)' },
  gemsPillText: { fontSize: 12, fontWeight: '700', color: Colors.blue },
  iconBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontSize: 8, fontWeight: '900', color: 'white' },

  hero: { flexDirection: 'row', gap: 16, marginHorizontal: responsive.padding, padding: 20, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)' },
  heroText: { flex: 1, justifyContent: 'center' },
  heroGreeting: { fontSize: responsive.fontSize.sm, color: Colors.muted },
  heroName: { fontSize: responsive.fontSize.xxl, fontWeight: '900', color: Colors.text, marginTop: 1 },
  heroSub: { fontSize: 13, color: Colors.muted, marginTop: 2, marginBottom: 10 },
  heroXpTrack: { height: 6, borderRadius: 3, backgroundColor: Colors.bg4, overflow: 'hidden' },
  heroXpFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.purple },
  heroXpLabel: { fontSize: 10, color: Colors.muted, marginTop: 5, alignSelf: 'flex-end' },

  statsRow: { flexDirection: 'row', gap: 8, marginHorizontal: responsive.padding },
  statCard: { flex: 1, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: Radius.md, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 9, color: Colors.muted, letterSpacing: 1.5 },

  streakBanner: { marginHorizontal: responsive.padding, padding: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: 'rgba(249,115,22,0.06)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)', borderLeftWidth: 3, borderLeftColor: Colors.orange },
  streakBannerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBannerTitle: { fontSize: 15, fontWeight: '800', color: Colors.orange },
  streakBannerSub: { fontSize: 12, color: Colors.muted },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.bg3, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  dayDotFilled: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  dayDotToday: { borderColor: Colors.orange, borderWidth: 2, backgroundColor: 'transparent' },
  dayLabel: { fontSize: 9, color: Colors.muted, fontWeight: '700' },

  questCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: responsive.padding, padding: 14, paddingHorizontal: 16, backgroundColor: Colors.bg3, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)', borderLeftWidth: 3, borderLeftColor: Colors.purple, gap: 12 },
  questDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.purple },
  questTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  questSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  questBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.purple, borderRadius: 20 },
  questBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.muted, marginLeft: 20, marginBottom: 12, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: responsive.padding, gap: 10 },
  actionCard: { width: CARD_SIZE, height: CARD_SIZE, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  actionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700', color: Colors.white },

  ctaBanner: { flexDirection: 'row', alignItems: 'center', margin: responsive.padding, padding: 16, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', gap: 12 },
  ctaTitle: { fontSize: 16, fontWeight: '900', color: Colors.text },
  ctaSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
});
