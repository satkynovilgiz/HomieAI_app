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

const QUICK_ACTIONS = [
  { label: 'AI Chat',   route: '/chat/index',         color: '#7c3aed' },
  { label: 'Lessons',   route: '/lessons/index',      color: '#3b82f6' },
  { label: 'Voice',     route: '/voice/index',        color: '#06b6d4' },
  { label: 'Videos',    route: '/videos/index',       color: '#f97316' },
  { label: 'Games',     route: '/games/index',        color: '#10b981' },
  { label: 'Pomodoro',  route: '/pomodoro/index',     color: '#ef4444' },
  { label: 'AI Check',  route: '/detector/index',     color: '#fbbf24' },
  { label: 'Shop',      route: '/shop/index',         color: '#3b82f6' },
  { label: 'Badges',    route: '/achievements/index', color: '#fbbf24' },
  { label: 'Planner',   route: '/planner/index',      color: '#8b5cf6' },
  { label: 'Essay',     route: '/essay/index',        color: '#84cc16' },
  { label: 'Scan',      route: '/scanner/index',      color: '#f43f5e' },
];

export default function HomeTab() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
  const gems = useSelector((s: RootState) => s.gems.count);
  const msgUnread = useSelector((s: RootState) => s.messages.totalUnread);
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
        <TouchableOpacity onPress={() => router.push('/streak/index')} style={styles.streakPill}>
          <Text style={styles.streakNum}>{streak.current}</Text>
          <Text style={styles.streakLabel}> day streak</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <HeartsBar onRefill={() => router.push('/shop/index')} />
          <GemsCounter onPress={() => router.push('/shop/index')} />
          <TouchableOpacity onPress={() => router.push('/notifications/index')} style={styles.notifBtn}>
            <View style={styles.bellIcon}>
              <View style={styles.bellTop} />
              <View style={styles.bellBody} />
              <View style={styles.bellBottom} />
            </View>
            {notifUnread > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notifUnread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings/index')}>
            <View style={styles.gearIcon}>
              <View style={styles.gearCenter} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <HomieBot mood={mood} size={64} />
          <View style={styles.greetingText}>
            <Text style={styles.greetingName}>Hey {user.name?.split(' ')[0]}!</Text>
            <Text style={styles.greetingSub}>
              {streak.current > 0 ? `${streak.current} day streak — keep going!` : 'Start your streak today!'}
            </Text>
          </View>
          <View style={styles.levelBox}>
            <Text style={styles.levelNum}>Lv.{user.level}</Text>
            <Text style={styles.xpNum}>{user.xp} XP</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <XPBar xp={user.xp} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="S" value={user.sessions || 0} label="Sessions" color={Colors.purpleL} />
          <StatCard icon="C" value={user.correct || 0} label="Correct" color={Colors.green} />
          <StatCard icon="D" value={`${streak.current}d`} label="Streak" color={Colors.orange} />
          <StatCard icon="G" value={gems} label="Gems" color={Colors.blue} />
        </View>

        <StreakBanner onPress={() => router.push('/streak/index')} />

        {/* Daily quest */}
        <View style={styles.questCard}>
          <View style={styles.questLeft}>
            <View style={[styles.questDot, { backgroundColor: Colors.purple }]} />
            <View>
              <Text style={styles.questTitle}>Daily Quest</Text>
              <Text style={styles.questSub}>Complete 1 lesson to keep your streak!</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/lessons/index')} style={styles.questBtn}>
            <Text style={styles.questBtnText}>Go</Text>
          </TouchableOpacity>
        </View>

        {/* Unread messages banner */}
        {msgUnread > 0 && (
          <TouchableOpacity onPress={() => router.push('/messages/index')} style={styles.msgBanner}>
            <View style={styles.msgDot} />
            <Text style={styles.msgBannerText}>{msgUnread} unread message{msgUnread > 1 ? 's' : ''}</Text>
            <Text style={styles.msgArrow}>›</Text>
          </TouchableOpacity>
        )}

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
          {QUICK_ACTIONS.map(({ label, route, color }) => (
            <TouchableOpacity
              key={label}
              style={[styles.actionCard, { borderLeftColor: color, borderLeftWidth: 3 }]}
              onPress={() => router.push(route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionDot, { backgroundColor: color }]} />
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBanner} onPress={() => router.push('/chat/index')} activeOpacity={0.85}>
          <HomieBot mood="happy" size={52} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Ready to study?</Text>
            <Text style={styles.ctaSub}>Homie is waiting for you!</Text>
          </View>
          <Text style={styles.ctaArrow}>›</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  streakPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(249,115,22,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
  streakNum: { fontSize: 14, fontWeight: '900', color: Colors.orange },
  streakLabel: { fontSize: 12, color: Colors.orange },
  topRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifBtn: { position: 'relative' },
  bellIcon: { width: 20, height: 22, alignItems: 'center' },
  bellTop: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.muted, marginBottom: 1 },
  bellBody: { width: 16, height: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 2, borderColor: Colors.muted },
  bellBottom: { width: 10, height: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: Colors.muted },
  notifBadge: { position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontSize: 8, fontWeight: '900', color: 'white' },
  gearIcon: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.muted, alignItems: 'center', justifyContent: 'center' },
  gearCenter: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: Colors.muted },
  greeting: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  greetingText: { flex: 1 },
  greetingName: { fontSize: 22, fontWeight: '900', color: Colors.text },
  greetingSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  levelBox: { alignItems: 'flex-end' },
  levelNum: { fontSize: 22, fontWeight: '900', color: Colors.purpleL },
  xpNum: { fontSize: 12, color: Colors.muted },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  questCard: { flexDirection: 'row', alignItems: 'center', margin: 16, marginTop: 8, padding: 16, backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)', gap: 12 },
  questLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  questDot: { width: 10, height: 10, borderRadius: 5 },
  questTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  questSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  questBtn: { paddingHorizontal: 18, paddingVertical: 9, backgroundColor: Colors.purple, borderRadius: Radius.md },
  questBtnText: { color: 'white', fontWeight: '800', fontSize: 13 },
  msgBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, padding: 14, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', gap: 10 },
  msgDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.purple },
  msgBannerText: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.text },
  msgArrow: { fontSize: 20, color: Colors.purpleL },
  tipCard: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 12, padding: 14, backgroundColor: 'rgba(124,58,237,0.07)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(124,58,237,0.15)', alignItems: 'flex-start' },
  tipLabel: { fontSize: 10, fontWeight: '700', color: Colors.purpleL, marginBottom: 4, letterSpacing: 1 },
  tipText: { fontSize: 13, color: Colors.text2, lineHeight: 19 },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, paddingHorizontal: 16, marginBottom: 10, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  actionCard: { width: '30%', backgroundColor: Colors.bg3, borderRadius: Radius.md, padding: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: Colors.border },
  actionDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '800', color: Colors.text },
  ctaBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16, backgroundColor: 'rgba(124,58,237,0.1)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)', gap: 12 },
  ctaTitle: { fontSize: 17, fontWeight: '900', color: Colors.text },
  ctaSub: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  ctaArrow: { fontSize: 26, color: Colors.purpleL, fontWeight: '900' },
});
