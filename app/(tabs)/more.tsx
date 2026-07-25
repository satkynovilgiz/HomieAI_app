import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import {
  TimerIcon, CalendarIcon, GameIcon, VideoIcon, CameraIcon,
  DetectorIcon, PenIcon,
  HistoryIcon, ChartIcon, TrophyIcon, FlameIcon, ShopIcon,
  PeopleIcon, MessageIcon, InfoIcon, ChevronRightIcon,
} from '../../components/icons';

const SECTIONS = [
  {
    title: 'STUDY TOOLS',
    items: [
      { label: 'Pomodoro', desc: '25 min focus timer', route: '/pomodoro', color: '#ef4444', Icon: TimerIcon },
      { label: 'Planner',  desc: 'Weekly schedule',     route: '/planner', color: '#8b5cf6', Icon: CalendarIcon },
      { label: 'Games',    desc: 'Study games',          route: '/games',   color: '#10b981', Icon: GameIcon },
      { label: 'Videos',   desc: 'Watch & learn',        route: '/videos',  color: '#f97316', Icon: VideoIcon },
      { label: 'Scan',     desc: 'Scan homework',        route: '/scanner', color: '#f43f5e', Icon: CameraIcon },
    ],
  },
  {
    title: 'AI FEATURES',
    items: [
      { label: 'AI Check', desc: 'Detect AI text',    route: '/detector', color: '#fbbf24', Icon: DetectorIcon },
      { label: 'Essay',    desc: 'AI essay writer',    route: '/essay',    color: '#84cc16', Icon: PenIcon },
    ],
  },
  {
    title: 'PROGRESS',
    items: [
      { label: 'History',      desc: 'Past sessions',       route: '/history',      color: '#a855f7', Icon: HistoryIcon },
      { label: 'Leaderboard',  desc: 'Top students',        route: '/leaderboard',  color: '#eab308', Icon: ChartIcon },
      { label: 'Achievements', desc: 'Your badges',         route: '/achievements', color: '#f59e0b', Icon: TrophyIcon },
      { label: 'Streak',       desc: 'Daily streak',        route: '/streak',       color: '#f97316', Icon: FlameIcon },
      { label: 'Shop',         desc: 'Buy with gems',       route: '/shop',         color: '#3b82f6', Icon: ShopIcon },
    ],
  },
  {
    title: 'SOCIAL',
    items: [
      { label: 'Friends',  desc: 'Squad & battles',   route: '/friends',  color: '#06b6d4', Icon: PeopleIcon },
      { label: 'Messages', desc: 'Chat with friends', route: '/messages', color: '#7c3aed', Icon: MessageIcon },
      { label: 'About',    desc: 'About Homie',       route: '/about',    color: '#64748b', Icon: InfoIcon },
    ],
  },
];

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map(({ label, desc, route, color, Icon }, i) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.row, i < section.items.length - 1 && styles.rowDivider]}
                  onPress={() => router.push(route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: color + '1f' }]}>
                    <Icon color={color} size={20} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowDesc}>{desc}</Text>
                  </View>
                  <ChevronRightIcon color={Colors.muted} size={18} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 2, marginBottom: 10, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  iconBox: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '800', color: Colors.text },
  rowDesc: { fontSize: 12, color: Colors.muted, marginTop: 2 },
});
