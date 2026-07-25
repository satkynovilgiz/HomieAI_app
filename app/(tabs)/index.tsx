import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { DAILY_TIPS } from '../../constants/subjects';
import { checkInToday } from '../../store/slices/streakSlice';
import HomieBot from '../../components/mascot/HomieBot';
import XPBar from '../../components/ui/XPBar';
import StatCard from '../../components/ui/StatCard';
import StreakBanner from '../../components/streak/StreakBanner';
import HeartsBar from '../../components/ui/HeartsBar';
import GemsCounter from '../../components/ui/GemsCounter';
import AchievementPopup from '../../components/achievements/AchievementPopup';
import { useAchievements } from '../../hooks/useAchievements';
import {
  ChatBubbleIcon, BookIcon, VideoIcon, GameIcon, TimerIcon,
  DetectorIcon, ShopIcon, TrophyIcon, CalendarIcon, PenIcon, CameraIcon,
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

const QUICK_ACTIONS = [
  { label: 'AI Chat',   route: '/chat',         color: '#7c3aed', Icon: ChatBubbleIcon },
  { label: 'Lessons',   route: '/lessons',      color: '#3b82f6', Icon: BookIcon },
  { label: 'Videos',    route: '/videos',       color: '#f97316', Icon: VideoIcon },
  { label: 'Games',     route: '/games',        color: '#10b981', Icon: GameIcon },
  { label: 'Pomodoro',  route: '/pomodoro',     color: '#ef4444', Icon: TimerIcon },
  { label: 'AI Check',  route: '/detector',     color: '#fbbf24', Icon: DetectorIcon },
  { label: 'Shop',      route: '/shop',         color: '#3b82f6', Icon: ShopIcon },
  { label: 'Badges',    route: '/achievements', color: '#fbbf24', Icon: TrophyIcon },
  { label: 'Planner',   route: '/planner',      color: '#8b5cf6', Icon: CalendarIcon },
  { label: 'Essay',     route: '/essay',        color: '#84cc16', Icon: PenIcon },
  { label: 'Scan',      route: '/scanner',      color: '#f43f5e', Icon: CameraIcon },
];

export default function HomeTab() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
  const gems = useSelector((s: RootState) => s.gems.count);
  const notifUnread = useSelector((s: RootState) => s.notifications.unread);
  const { newlyEarned, dismissNew } = useAchievements();
  const [tip] = useState(DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)]);

  useEffect(() => {
    if (!user) { router.replace('/auth/login'); return; }
    dispatch(checkInToday());
  }, []);

  if (!user) return null;

  const mood = streak.current >= 7 ? 'celebrating' : streak.current === 0 ? 'sad' : 'happy';

  return (
    <SafeAreaView style={styles.safe}>
      <AchievementPopup achievement={newlyEarned} onDismiss={dismissNew} />

      {/* Top bar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.push('/streak')} style={styles.streakPill}>
          <Text style={styles.streakNum}>{streak.current}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <HeartsBar onRefill={() => router.push('/shop')} />
          <GemsCounter onPress={() => router.push('/shop')} />
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
        {/* Greeting */}
        <View style={styles.greeting}>
          <HomieBot mood={mood} size={64} />
          <View style={styles.greetingText}>
            <Text style={styles.greetingName}>Hey {user.name?.split(' ')[0]}!</Text>
            <Text style={styles.greetingSub}>Lv.{user.level} · {user.xp} XP</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <XPBar xp={user.xp} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard value={user.sessions || 0} label="Sessions" color={Colors.purpleL} />
          <StatCard value={user.correct || 0} label="Correct" color={Colors.green} />
          <StatCard value={`${streak.current}d`} label="Streak" color={Colors.orange} />
          <StatCard value={gems} label="Gems" color={Colors.blue} />
        </View>

        <StreakBanner onPress={() => router.push('/streak')} />

        {/* Daily quest */}
        <TouchableOpacity style={styles.questCard} onPress={() => router.push('/lessons')} activeOpacity={0.85}>
          <View style={[styles.questDot, { backgroundColor: Colors.purple }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.questTitle}>Daily Quest</Text>
            <Text style={styles.questSub}>one lesson keeps your streak alive</Text>
          </View>
          <View style={styles.questBtn}>
            <Text style={styles.questBtnText}>Go</Text>
          </View>
        </TouchableOpacity>

        {/* Tip */}
        <View style={styles.tipCard}>
          <HomieBot mood="thinking" size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>TIP</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map(({ label, route, color, Icon }) => (
            <TouchableOpacity
              key={label}
              style={styles.actionCard}
              onPress={() => router.push(route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: color + '1f' }]}>
                <Icon color={color} size={20} />
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBanner} onPress={() => router.push('/chat')} activeOpacity={0.85}>
          <HomieBot mood="happy" size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Ready to study?</Text>
            <Text style={styles.ctaSub}>Homie is waiting for you!</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(249,115,22,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
  streakNum: { fontSize: 14, fontWeight: '900', color: Colors.orange },
  streakLabel: { fontSize: 11, color: Colors.orange },
  topRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontSize: 8, fontWeight: '900', color: 'white' },
  greeting: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  greetingText: { flex: 1 },
  greetingName: { fontSize: 22, fontWeight: '900', color: Colors.text },
  greetingSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 12, marginBottom: 4 },
  questCard: { flexDirection: 'row', alignItems: 'center', margin: 16, marginTop: 8, padding: 16, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, borderLeftColor: Colors.purple, gap: 12 },
  questDot: { width: 10, height: 10, borderRadius: 5 },
  questTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  questSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  questBtn: { paddingHorizontal: 18, paddingVertical: 9, backgroundColor: Colors.purple, borderRadius: Radius.md },
  questBtnText: { color: 'white', fontWeight: '800', fontSize: 13 },
  tipCard: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 12, padding: 14, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'flex-start' },
  tipLabel: { fontSize: 10, fontWeight: '700', color: Colors.purpleL, marginBottom: 4, letterSpacing: 2 },
  tipText: { fontSize: 13, color: Colors.text2, lineHeight: 19 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.muted, paddingHorizontal: 16, marginBottom: 10, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  actionCard: { width: '30%', backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.border, gap: 10 },
  actionIconWrap: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '800', color: Colors.text },
  ctaBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  ctaTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  ctaSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
});
