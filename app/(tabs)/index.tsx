import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { DAILY_TIPS } from '../../constants/subjects';
import { checkInToday } from '../../store/slices/streakSlice';
import HomieBot from '../../components/mascot/HomieBot';
import XPBar from '../../components/ui/XPBar';
import StreakBanner from '../../components/streak/StreakBanner';
import HeartsBar from '../../components/ui/HeartsBar';
import GemsCounter from '../../components/ui/GemsCounter';
import AchievementPopup from '../../components/achievements/AchievementPopup';
import { useAchievements } from '../../hooks/useAchievements';

const QUICK_ACTIONS = [
  { label: 'AI Chat',   route: '/chat',         color: '#7c3aed', icon: '💬' },
  { label: 'Lessons',   route: '/lessons',      color: '#3b82f6', icon: '📘' },
  { label: 'Voice',     route: '/voice',        color: '#06b6d4', icon: '🎙️' },
  { label: 'Videos',    route: '/videos',       color: '#f97316', icon: '📺' },
  { label: 'Games',     route: '/games',        color: '#10b981', icon: '🎮' },
  { label: 'Pomodoro',  route: '/pomodoro',     color: '#ef4444', icon: '⏱️' },
  { label: 'AI Check',  route: '/detector',     color: '#fbbf24', icon: '🕵️' },
  { label: 'Shop',      route: '/shop',         color: '#3b82f6', icon: '🛍️' },
  { label: 'Badges',    route: '/achievements', color: '#fbbf24', icon: '🏅' },
  { label: 'Planner',   route: '/planner',      color: '#8b5cf6', icon: '📅' },
  { label: 'Essay',     route: '/essay',        color: '#84cc16', icon: '✍️' },
  { label: 'Scan',      route: '/scanner',      color: '#f43f5e', icon: '📷' },
];

export default function HomeTab() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.current);
  const streak = useSelector((s: RootState) => s.streak);
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
        <Text style={styles.appName}>Homie</Text>
        <View style={styles.topRight}>
          <HeartsBar onRefill={() => router.push('/shop')} />
          <GemsCounter onPress={() => router.push('/shop')} />
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconBtn}>
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
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
            <View style={styles.gearIcon}>
              <View style={styles.gearCenter} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <LinearGradient colors={[Colors.bg4, Colors.bg2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <HomieBot mood={mood} size={56} />
            <View style={styles.heroGreeting}>
              <Text style={styles.greetingName}>Hey {user.name?.split(' ')[0]}!</Text>
              <Text style={styles.greetingSub}>
                {streak.current > 0 ? `🔥 ${streak.current} day streak — keep going!` : 'Start your streak today!'}
              </Text>
            </View>
            <View style={styles.levelBox}>
              <Text style={styles.levelNum}>Lv.{user.level}</Text>
              <Text style={styles.xpNum}>{user.xp} XP</Text>
            </View>
          </View>

          <XPBar xp={user.xp} />

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{user.sessions || 0}</Text>
              <Text style={styles.heroStatLabel}>Sessions</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{user.correct || 0}</Text>
              <Text style={styles.heroStatLabel}>Correct</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: Colors.orange }]}>{streak.current}</Text>
              <Text style={styles.heroStatLabel}>Streak</Text>
            </View>
          </View>
        </LinearGradient>

        <StreakBanner onPress={() => router.push('/streak')} />

        {/* Today */}
        <View style={styles.todayCard}>
          <TouchableOpacity style={styles.todayRow} onPress={() => router.push('/lessons')} activeOpacity={0.7}>
            <Text style={styles.todayEmoji}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayTitle}>Daily Quest</Text>
              <Text style={styles.todaySub}>Complete 1 lesson to keep your streak!</Text>
            </View>
            <Text style={styles.todayArrow}>›</Text>
          </TouchableOpacity>

          {msgUnread > 0 && (
            <>
              <View style={styles.todayDivider} />
              <TouchableOpacity style={styles.todayRow} onPress={() => router.push('/messages')} activeOpacity={0.7}>
                <Text style={styles.todayEmoji}>💬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayTitle}>{msgUnread} unread message{msgUnread > 1 ? 's' : ''}</Text>
                  <Text style={styles.todaySub}>See what your friends are saying</Text>
                </View>
                <Text style={styles.todayArrow}>›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <HomieBot mood="thinking" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipLabel}>TIP</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map(({ label, route, color, icon }) => (
            <TouchableOpacity
              key={label}
              style={styles.actionCard}
              onPress={() => router.push(route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: color + '22' }]}>
                <Text style={styles.actionIcon}>{icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={() => router.push('/chat')} activeOpacity={0.88}>
          <LinearGradient colors={[Colors.purple, '#5b21b6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBanner}>
            <HomieBot mood="happy" size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Ready to study?</Text>
              <Text style={styles.ctaSub}>Homie is waiting for you!</Text>
            </View>
            <Text style={styles.ctaArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  appName: { fontSize: 18, fontWeight: '900', color: Colors.text },
  topRight: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBtn: { position: 'relative' },
  bellIcon: { width: 20, height: 22, alignItems: 'center' },
  bellTop: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.muted, marginBottom: 1 },
  bellBody: { width: 16, height: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 2, borderColor: Colors.muted },
  bellBottom: { width: 10, height: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: Colors.muted },
  notifBadge: { position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { fontSize: 8, fontWeight: '900', color: 'white' },
  gearIcon: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.muted, alignItems: 'center', justifyContent: 'center' },
  gearCenter: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: Colors.muted },

  hero: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  heroGreeting: { flex: 1 },
  greetingName: { fontSize: 20, fontWeight: '900', color: Colors.text },
  greetingSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  levelBox: { alignItems: 'flex-end' },
  levelNum: { fontSize: 20, fontWeight: '900', color: Colors.purpleL },
  xpNum: { fontSize: 11, color: Colors.muted },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 18, fontWeight: '900', color: Colors.text },
  heroStatLabel: { fontSize: 10, color: Colors.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  heroStatDivider: { width: 1, height: 26, backgroundColor: Colors.border },

  todayCard: { marginHorizontal: 16, marginBottom: 14, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  todayEmoji: { fontSize: 24 },
  todayTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  todaySub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  todayArrow: { fontSize: 20, color: Colors.muted },
  todayDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },

  tipCard: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 20, padding: 14, alignItems: 'flex-start' },
  tipLabel: { fontSize: 10, fontWeight: '700', color: Colors.purpleL, marginBottom: 4, letterSpacing: 1 },
  tipText: { fontSize: 13, color: Colors.text2, lineHeight: 19 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.muted, paddingHorizontal: 16, marginBottom: 10, letterSpacing: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 8 },
  actionCard: { width: '30%', backgroundColor: Colors.bg3, borderRadius: Radius.lg, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', gap: 8 },
  actionIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 18 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: Colors.text, textAlign: 'center' },

  ctaBanner: { flexDirection: 'row', alignItems: 'center', margin: 16, marginTop: 8, padding: 18, borderRadius: Radius.xl, gap: 14 },
  ctaTitle: { fontSize: 17, fontWeight: '900', color: 'white' },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  ctaArrow: { fontSize: 26, color: 'white', fontWeight: '900' },
});
