import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';

const MENU_ITEMS = [
  { label: 'Voice',       route: '/voice/index',        color: '#06b6d4', desc: 'Talk to Homie' },
  { label: 'Pomodoro',    route: '/pomodoro/index',     color: '#ef4444', desc: '25 min focus timer' },
  { label: 'Messages',    route: '/messages/index',     color: '#7c3aed', desc: 'Chat with friends' },
  { label: 'Planner',     route: '/planner/index',      color: '#8b5cf6', desc: 'Weekly schedule' },
  { label: 'Games',       route: '/games/index',        color: '#10b981', desc: 'Study games' },
  { label: 'Videos',      route: '/videos/index',       color: '#f97316', desc: 'Watch & learn' },
  { label: 'AI Check',    route: '/detector/index',     color: '#fbbf24', desc: 'Detect AI text' },
  { label: 'Essay',       route: '/essay/index',        color: '#84cc16', desc: 'AI essay writer' },
  { label: 'Scan',        route: '/scanner/index',      color: '#f43f5e', desc: 'Scan homework' },
  { label: 'History',     route: '/history/index',      color: '#a855f7', desc: 'Past sessions' },
  { label: 'Leaderboard', route: '/leaderboard/index',  color: '#eab308', desc: 'Top students' },
  { label: 'Shop',        route: '/shop/index',         color: '#3b82f6', desc: 'Buy with gems' },
  { label: 'Achievements',route: '/achievements/index', color: '#f59e0b', desc: 'Your badges' },
  { label: 'Streak',      route: '/streak/index',       color: '#f97316', desc: 'Daily streak' },
  { label: 'About',       route: '/about/index',        color: '#64748b', desc: 'About Homie' },
];

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {MENU_ITEMS.map(({ label, route, color, desc }) => (
          <TouchableOpacity
            key={label}
            style={[styles.item, { borderLeftColor: color }]}
            onPress={() => router.push(route as any)}
            activeOpacity={0.75}
          >
            <View style={[styles.dot, { backgroundColor: color }]} />
            <View style={styles.itemText}>
              <Text style={styles.itemLabel}>{label}</Text>
              <Text style={styles.itemDesc}>{desc}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text },
  content: { padding: 16, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '800', color: Colors.text },
  itemDesc: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  arrow: { fontSize: 22, color: Colors.muted, fontWeight: '300' },
});
