import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import ContentWrapper from '../../components/ui/ContentWrapper';
import { SUBJECTS } from '../../constants/subjects';

interface GameDef {
  id: string;
  route: string;
  title: string;
  desc: string;
  color: string;
  xp: string;
  plays: string;
  subjectLocked?: string[];
}

const GAMES: GameDef[] = [
  { id: 'wordscramble', route: '/games/wordscramble', title: 'Word Scramble', desc: 'Unscramble the study word', color: Colors.purple, xp: '+15 XP', plays: '3.5k plays' },
  { id: 'mathlightning', route: '/games/mathlightning', title: 'Math Lightning', desc: 'Fast math, three levels', color: Colors.orange, xp: '+5 XP', plays: '2.1k plays' },
  { id: 'trueorfalse', route: '/games/trueorfalse', title: 'True or False', desc: 'Swipe to answer', color: Colors.green, xp: '+10 XP', plays: '1.8k plays' },
  { id: 'fillinblank', route: '/games/fillinblank', title: 'Fill in the Blank', desc: 'Complete the sentence', color: Colors.blue, xp: '+15 XP', plays: '1.4k plays' },
  { id: 'flashcardflip', route: '/games/flashcardflip', title: 'Flashcard Flip', desc: 'Flip, swipe, master it', color: Colors.pink, xp: '+5 XP', plays: '2.6k plays' },
  { id: 'speedquiz', route: '/games/speedquiz', title: 'Speed Quiz', desc: '10 second timer per Q', color: Colors.red, xp: '+10 XP', plays: '3.1k plays' },
  { id: 'matchingpairs', route: '/games/matchingpairs', title: 'Matching Pairs', desc: 'Find the 6 matches', color: '#14b8a6', xp: '+20 XP', plays: '980 plays' },
  { id: 'definitiondetective', route: '/games/definitiondetective', title: 'Definition Detective', desc: 'Guess the concept', color: Colors.yellow, xp: '+20 XP', plays: '760 plays' },
  { id: 'buildequation', route: '/games/buildequation', title: 'Build the Equation', desc: 'Math and Science only', color: '#6366f1', xp: '+25 XP', plays: '540 plays', subjectLocked: ['Math', 'Science'] },
  { id: 'trivia', route: '/games/trivia', title: 'Subject Trivia', desc: '10 questions, high scores', color: '#059669', xp: '+10 XP', plays: '2.9k plays' },
];

export default function GamesScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const [subject, setSubject] = useState('Math');
  const [showSubjects, setShowSubjects] = useState(false);

  const visibleGames = GAMES.filter(g => !g.subjectLocked || g.subjectLocked.includes(subject));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Games</Text>
        <View style={styles.bestStat}>
          <Text style={styles.bestStatLabel}>Your XP</Text>
          <Text style={styles.bestStatValue}>{user?.xp ?? 0}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowSubjects(!showSubjects)} style={styles.subjectPickerBtn}>
        <Text style={styles.subjectPickerText}>{subject}</Text>
        <Text style={styles.subjectPickerCaret}>{showSubjects ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {showSubjects && (
        <View style={styles.subjectList}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s.s} onPress={() => { setSubject(s.s); setShowSubjects(false); }}
              style={[styles.subjectChip, subject === s.s && styles.subjectChipActive]}>
              <Text style={styles.subjectChipText}>{s.s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
       <ContentWrapper>
        <View style={styles.grid}>
        {visibleGames.map(g => (
          <View key={g.id} style={[styles.card, { borderColor: g.color + '44' }]}>
            <View style={[styles.iconDot, { backgroundColor: g.color + '22' }]}>
              <View style={[styles.iconInner, { backgroundColor: g.color }]} />
            </View>
            <Text style={styles.cardTitle}>{g.title}</Text>
            <Text style={styles.cardDesc}>{g.desc}</Text>
            <Text style={styles.cardPlays}>{g.plays}</Text>
            <View style={[styles.xpBadge, { backgroundColor: g.color + '22', borderColor: g.color + '44' }]}>
              <Text style={[styles.xpText, { color: g.color }]}>{g.xp}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: g.route as any, params: { subject } })}
              style={[styles.playBtn, { backgroundColor: g.color }]}
            >
              <Text style={styles.playBtnText}>Play</Text>
            </TouchableOpacity>
          </View>
        ))}
        </View>
       </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: responsive.padding, paddingBottom: 10, gap: 10 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: responsive.fontSize.xxl, fontWeight: '900', color: Colors.text, flex: 1 },
  bestStat: { alignItems: 'flex-end' },
  bestStatLabel: { fontSize: 10, color: Colors.muted, textTransform: 'uppercase' },
  bestStatValue: { fontSize: 16, fontWeight: '900', color: Colors.purpleL },
  subjectPickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.bg3, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  subjectPickerText: { fontSize: 13, color: Colors.text, fontWeight: '700' },
  subjectPickerCaret: { fontSize: 11, color: Colors.muted },
  subjectList: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 16, marginBottom: 14 },
  subjectChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  subjectChipActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  subjectChipText: { fontSize: 12, color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12, paddingBottom: 40 },
  card: { width: responsive.isTablet ? '31%' : '46.5%', backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, padding: 14, gap: 6 },
  iconDot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconInner: { width: 16, height: 16, borderRadius: 5 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  cardDesc: { fontSize: 11, color: Colors.muted, minHeight: 28 },
  cardPlays: { fontSize: 10, color: Colors.muted },
  xpBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, marginTop: 2 },
  xpText: { fontSize: 10, fontWeight: '800' },
  playBtn: { marginTop: 6, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center' },
  playBtnText: { color: Colors.white, fontWeight: '800', fontSize: 13 },
});
