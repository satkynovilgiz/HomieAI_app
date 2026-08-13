import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationKey } from '../../constants/translations';
import {
  TimerIcon, CalendarIcon, GameIcon, VideoIcon, CameraIcon,
  DetectorIcon, PenIcon, MicIcon,
  HistoryIcon, ChartIcon, TrophyIcon, FlameIcon, ShopIcon,
  PeopleIcon, MessageIcon, InfoIcon, ChevronRightIcon, ShareIcon, LockFocusIcon,
} from '../../components/icons';

const SECTIONS: { titleKey: TranslationKey; items: { labelKey: TranslationKey; desc: string; route: string; color: string; Icon: any }[] }[] = [
  {
    titleKey: 'more_study_tools',
    items: [
      { labelKey: 'more_pomodoro', desc: '25 min focus timer', route: '/pomodoro', color: '#ef4444', Icon: TimerIcon },
      { labelKey: 'more_planner',  desc: 'Weekly schedule',     route: '/planner', color: '#8b5cf6', Icon: CalendarIcon },
      { labelKey: 'more_games',    desc: 'Study games',          route: '/games',   color: '#10b981', Icon: GameIcon },
      { labelKey: 'more_videos',   desc: 'Watch & learn',        route: '/videos',  color: '#f97316', Icon: VideoIcon },
      { labelKey: 'more_scan',     desc: 'Scan homework',        route: '/scanner', color: '#f43f5e', Icon: CameraIcon },
      { labelKey: 'more_recorder', desc: 'Record & get AI notes', route: '/recorder', color: '#7c3aed', Icon: MicIcon },
      { labelKey: 'more_focus',    desc: 'Lock in. No distractions.', route: '/focus', color: '#6366f1', Icon: LockFocusIcon },
    ],
  },
  {
    titleKey: 'more_ai_features',
    items: [
      { labelKey: 'more_detector', desc: 'Detect AI text',    route: '/detector', color: '#fbbf24', Icon: DetectorIcon },
      { labelKey: 'more_essay',    desc: 'AI essay writer',    route: '/essay',    color: '#84cc16', Icon: PenIcon },
    ],
  },
  {
    titleKey: 'more_progress',
    items: [
      { labelKey: 'more_history',      desc: 'Past sessions',       route: '/history',      color: '#a855f7', Icon: HistoryIcon },
      { labelKey: 'more_leaderboard',  desc: 'Top students',        route: '/leaderboard',  color: '#eab308', Icon: ChartIcon },
      { labelKey: 'more_achievements', desc: 'Your badges',         route: '/achievements', color: '#f59e0b', Icon: TrophyIcon },
      { labelKey: 'more_streak',       desc: 'Daily streak',        route: '/streak',       color: '#f97316', Icon: FlameIcon },
      { labelKey: 'more_shop',         desc: 'Buy with gems',       route: '/shop',         color: '#3b82f6', Icon: ShopIcon },
    ],
  },
  {
    titleKey: 'more_social',
    items: [
      { labelKey: 'more_friends',  desc: 'Squad & battles',   route: '/friends',  color: '#06b6d4', Icon: PeopleIcon },
      { labelKey: 'more_messages', desc: 'Chat with friends', route: '/messages', color: '#7c3aed', Icon: MessageIcon },
      { labelKey: 'more_invite',   desc: 'Share Homie, earn rewards', route: '/invite', color: '#10b981', Icon: ShareIcon },
      { labelKey: 'more_about',    desc: 'About Homie',       route: '/about',    color: '#64748b', Icon: InfoIcon },
    ],
  },
];

export default function MoreScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('more_title')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {SECTIONS.map(section => (
          <View key={section.titleKey} style={styles.section}>
            <Text style={styles.sectionLabel}>{t(section.titleKey)}</Text>
            <View style={styles.sectionCard}>
              {section.items.map(({ labelKey, desc, route, color, Icon }, i) => (
                <TouchableOpacity
                  key={labelKey}
                  style={[styles.row, i < section.items.length - 1 && styles.rowDivider]}
                  onPress={() => router.push(route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: color + '1f' }]}>
                    <Icon color={color} size={20} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{t(labelKey)}</Text>
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
