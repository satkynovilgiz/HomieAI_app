import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { MATH_UNITS } from '../../constants/lessons/mathLessons';
import { CODING_UNITS } from '../../constants/lessons/codingLessons';
import { SCIENCE_UNITS } from '../../constants/lessons/scienceLessons';
import UnitCard from '../../components/lessons/UnitCard';
import StreakBanner from '../../components/streak/StreakBanner';
import HeartsBar from '../../components/ui/HeartsBar';
import GemsCounter from '../../components/ui/GemsCounter';

const ALL_UNITS = [...MATH_UNITS, ...CODING_UNITS, ...SCIENCE_UNITS];

export default function LearnTab() {
  const lessonState = useSelector((s: RootState) => s.lessons);

  const getUnitProgress = (unitId: string) => {
    const up = lessonState.units.find(u => u.unitId === unitId);
    if (!up) return { completed: false, unlocked: false, completedLessons: 0, totalLessons: 1 };
    return {
      completed: up.completed, unlocked: up.unlocked,
      completedLessons: up.lessons.filter(l => l.completed).length,
      totalLessons: up.lessons.length,
    };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Text style={styles.logo}>Learn</Text>
        <View style={styles.topRight}>
          <HeartsBar/>
          <GemsCounter/>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StreakBanner onPress={() => router.push('/streak/index')}/>

        {/* Daily Quest */}
        <View style={styles.questCard}>
          <Text style={styles.questTitle}>Daily Quest</Text>
          <Text style={styles.questDesc}>Complete 1 lesson today to keep your streak!</Text>
          <View style={styles.questProgress}>
            <View style={styles.questTrack}>
              <View style={[styles.questFill, { width: '0%' }]}/>
            </View>
            <Text style={styles.questCount}>0/1</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose a subject</Text>

        <View style={styles.units}>
          {ALL_UNITS.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              progress={getUnitProgress(unit.id)}
              onPress={() => router.push({ pathname: '/lessons/index', params: { unitId: unit.id } })}
            />
          ))}
        </View>

        <View style={{ height: 24 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  logo: { fontSize: 20, fontWeight: '900', color: Colors.text },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  questCard: { margin: 16, padding: 16, backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
  questTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  questDesc: { fontSize: 13, color: Colors.muted, marginBottom: 12 },
  questProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  questTrack: { flex: 1, height: 8, backgroundColor: Colors.bg4, borderRadius: 4, overflow: 'hidden' },
  questFill: { height: '100%', backgroundColor: Colors.purple, borderRadius: 4 },
  questCount: { fontSize: 12, color: Colors.muted, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.muted, paddingHorizontal: 16, marginBottom: 12 },
  units: { paddingHorizontal: 16, gap: 12 },
});
