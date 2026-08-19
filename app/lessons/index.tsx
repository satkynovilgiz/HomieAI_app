import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { MATH_UNITS } from '../../constants/lessons/mathLessons';
import { CODING_UNITS } from '../../constants/lessons/codingLessons';
import { SCIENCE_UNITS } from '../../constants/lessons/scienceLessons';
import LessonNode from '../../components/lessons/LessonNode';
import UnitCard from '../../components/lessons/UnitCard';

const ALL_UNITS = [...MATH_UNITS, ...CODING_UNITS, ...SCIENCE_UNITS];

export default function LessonsScreen() {
  const { unitId } = useLocalSearchParams<{ unitId?: string }>();
  const lessonState = useSelector((s: RootState) => s.lessons);

  const getUnitProgress = (id: string) => {
    const up = lessonState.units.find(u => u.unitId === id);
    if (!up) return { completed: false, unlocked: false, completedLessons: 0, totalLessons: 1 };
    return { completed: up.completed, unlocked: up.unlocked, completedLessons: up.lessons.filter(l => l.completed).length, totalLessons: up.lessons.length };
  };

  const getLessonProgress = (lessonId: string, uId: string) => {
    const up = lessonState.units.find(u => u.unitId === uId);
    const lp = up?.lessons.find(l => l.id === lessonId);
    return { completed: lp?.completed || false, stars: lp?.stars || 0 };
  };

  // If a specific unit is selected, show its lessons in path view
  if (unitId) {
    const unit = ALL_UNITS.find(u => u.id === unitId);
    if (!unit) return null;
    const unitProgress = lessonState.units.find(u => u.unitId === unitId);

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.unitTitle}>{unit.title}</Text>
            <Text style={styles.unitDesc}>{unit.description}</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.progressHeader, { backgroundColor: unit.color + '11', borderColor: unit.color + '33' }]}>
            <Text style={[styles.progressTitle, { color: unit.color }]}>{unit.title}</Text>
            <Text style={styles.progressSub}>{unitProgress?.lessons.filter(l => l.completed).length || 0}/{unit.lessons.length} lessons complete</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${((unitProgress?.lessons.filter(l => l.completed).length || 0) / unit.lessons.length) * 100}%` as any,
                backgroundColor: unit.color
              }]}/>
            </View>
          </View>
          <View style={styles.path}>
            {unit.lessons.map((lesson, i) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                progress={getLessonProgress(lesson.id, unitId)}
                index={i}
                onPress={() => router.push({ pathname: '/lessons/play', params: { lessonId: lesson.id, unitId } })}
              />
            ))}
          </View>
          {unitProgress?.lessons.every(l => l.completed) && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeBannerTitle}>unit complete</Text>
              <Text style={styles.completeBannerSub}>you crushed it</Text>
            </View>
          )}
          <View style={{ height: 40 }}/>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Default: show all units
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Lessons</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>choose a subject</Text>
        {ALL_UNITS.map(unit => (
          <UnitCard
            key={unit.id}
            unit={unit}
            progress={getUnitProgress(unit.id)}
            onPress={() => router.push({ pathname: '/lessons', params: { unitId: unit.id } })}
          />
        ))}
        <View style={{ height: 24 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  pageTitle: { fontSize: 22, fontWeight: '900', color: Colors.text },
  unitTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  unitDesc: { fontSize: 13, color: Colors.muted, marginTop: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.muted, marginBottom: 14 },
  content: { padding: 16 },
  progressHeader: { padding: 18, borderRadius: Radius.lg, borderWidth: 1, marginBottom: 24 },
  progressTitle: { fontSize: 18, fontWeight: '900', marginBottom: 4 },
  progressSub: { fontSize: 13, color: Colors.muted, marginBottom: 10 },
  progressTrack: { height: 8, backgroundColor: Colors.bg4, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  path: { alignItems: 'center' },
  completeBanner: { alignItems: 'center', padding: 28, backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', marginTop: 24 },
  completeBannerIcon: { fontSize: 56, marginBottom: 12 },
  completeBannerTitle: { fontSize: 24, fontWeight: '900', color: Colors.yellow },
  completeBannerSub: { fontSize: 14, color: Colors.muted, marginTop: 6 },
});
