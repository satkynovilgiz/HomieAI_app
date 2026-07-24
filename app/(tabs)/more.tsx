import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';

const MENU_ITEMS = [
  { label: 'Pomodoro',    route: '/pomodoro',     color: '#ef4444', desc: '25 min focus timer' },
  { label: 'Messages',    route: '/messages',     color: '#7c3aed', desc: 'Chat with friends' },
  { label: 'Planner',     route: '/planner',      color: '#8b5cf6', desc: 'Weekly schedule' },
  { label: 'Games',       route: '/games',        color: '#10b981', desc: 'Study games' },
  { label: 'Videos',      route: '/videos',       color: '#f97316', desc: 'Watch & learn' },
  { label: 'AI Check',    route: '/detector',     color: '#fbbf24', desc: 'Detect AI text' },
  { label: 'Essay',       route: '/essay',        color: '#84cc16', desc: 'AI essay writer' },
  { label: 'Scan',        route: '/scanner',      color: '#f43f5e', desc: 'Scan homework' },
  { label: 'History',     route: '/history',      color: '#a855f7', desc: 'Past sessions' },
  { label: 'Leaderboard', route: '/leaderboard',  color: '#eab308', desc: 'Top students' },
  { label: 'Shop',        route: '/shop',         color: '#3b82f6', desc: 'Buy with gems' },
  { label: 'Achievements',route: '/achievements', color: '#f59e0b', desc: 'Your badges' },
  { label: 'Streak',      route: '/streak',       color: '#f97316', desc: 'Daily streak' },
  { label: 'About',       route: '/about',        color: '#64748b', desc: 'About Homie' },
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
