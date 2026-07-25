
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { startLesson, completeLesson, loseSessionHeart } from '../../store/slices/lessonsSlice';
import { addXP } from '../../store/slices/userSlice';
import { earnGems } from '../../store/slices/gemsSlice';
import { checkInToday } from '../../store/slices/streakSlice';
import { Colors, Radius } from '../../constants/theme';
import { MATH_UNITS } from '../../constants/lessons/mathLessons';
import { CODING_UNITS } from '../../constants/lessons/codingLessons';
import { SCIENCE_UNITS } from '../../constants/lessons/scienceLessons';
import HeartsBar from '../../components/ui/HeartsBar';
import HomieBot from '../../components/mascot/HomieBot';

const ALL_UNITS = [...MATH_UNITS, ...CODING_UNITS, ...SCIENCE_UNITS];

export default function LessonPlayScreen() {
  const { lessonId, unitId } = useLocalSearchParams<{ lessonId: string; unitId: string }>();
  const dispatch = useDispatch();
  const hearts = useSelector((s: RootState) => s.hearts.count);

  const unit = ALL_UNITS.find(u => u.id === unitId);
  const lesson = unit?.lessons.find(l => l.id === lessonId);

  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);
  const [mood, setMood] = useState<'happy'|'celebrating'|'sad'|'thinking'>('happy');
  const [showExp, setShowExp] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lesson) dispatch(startLesson(lessonId));
  }, []);

  if (!lesson || !unit) return null;

  const q = lesson.questions[qIdx];
  const totalQ = lesson.questions.length;
  const pct = (qIdx / totalQ);

  const animateProgress = (newPct: number) => {
    Animated.spring(progress, { toValue: newPct, useNativeDriver: false }).start();
  };

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.answer;

    if (isCorrect) {
      setCorrect(c => c + 1);
      setMood('celebrating');
      setShowExp(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setWrong(w => w + 1);
      setMood('sad');
      setShowExp(true);
      dispatch(loseSessionHeart());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const next = () => {
    setShowExp(false);
    setSelected(null);
    setMood('happy');
    if (qIdx + 1 >= totalQ) {
      const stars = wrong === 0 ? 3 : wrong <= 1 ? 2 : 1;
      const score = Math.round((correct / totalQ) * 100);
      dispatch(completeLesson({ lessonId, stars, score }));
      dispatch(addXP(lesson.xp));
      dispatch(earnGems(Math.floor(lesson.xp / 10)));
      dispatch(checkInToday());
      setDone(true);
      animateProgress(1);
    } else {
      setQIdx(i => i + 1);
      animateProgress((qIdx + 1) / totalQ);
    }
  };

  const optColors = (idx: number) => {
    if (selected === null) return { bg: Colors.bg3, border: Colors.border2, text: Colors.text };
    if (idx === q.answer) return { bg: 'rgba(16,185,129,0.15)', border: Colors.green, text: Colors.greenL };
    if (idx === selected) return { bg: 'rgba(239,68,68,0.1)', border: Colors.red, text: Colors.red };
    return { bg: Colors.bg3, border: Colors.border, text: Colors.muted };
  };

  if (done) {
    const stars = wrong === 0 ? 3 : wrong <= 1 ? 2 : 1;
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.completeScreen}>
          <HomieBot mood={stars===3?'celebrating':'happy'} size={140}/>
          <Text style={styles.completeTitle}>{stars===3?'nailed it 🎉':stars===2?'solid 🔥':'you got through it 💪'}</Text>
          <Text style={styles.completeSub}>{lesson.title}, done</Text>
          <View style={styles.stars}>
            {[0,1,2].map(i => <Text key={i} style={[styles.starIcon, i < stars && styles.starActive]}>★</Text>)}
          </View>
          <View style={styles.rewards}>
            <View style={styles.reward}><Text style={styles.rewardIcon}>⭐</Text><Text style={styles.rewardVal}>+{lesson.xp} XP</Text><Text style={styles.rewardLabel}>XP earned</Text></View>
            <View style={styles.reward}><Text style={styles.rewardIcon}>💎</Text><Text style={styles.rewardVal}>+{Math.floor(lesson.xp/10)}</Text><Text style={styles.rewardLabel}>Gems</Text></View>
            <View style={styles.reward}><Text style={styles.rewardIcon}>✅</Text><Text style={styles.rewardVal}>{correct}/{totalQ}</Text><Text style={styles.rewardLabel}>Correct</Text></View>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>keep going 🚀</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] }), backgroundColor: unit.color }]}/>
        </View>
        <HeartsBar/>
      </View>

      {/* Question */}
      <View style={styles.questionArea}>
        <HomieBot mood={mood} size={80}/>
        <Text style={styles.qLabel}>Question {qIdx+1} of {totalQ}</Text>
        <Text style={styles.question}>{q.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {(q.options || []).map((opt, i) => {
          const c = optColors(i);
          return (
            <TouchableOpacity key={i} onPress={() => answer(i)} disabled={selected!==null}
              style={[styles.option, { backgroundColor:c.bg, borderColor:c.border }]}>
              <Text style={styles.optLetter}>{['A','B','C','D'][i]})</Text>
              <Text style={[styles.optText, { color:c.text }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Explanation */}
      {showExp && (
        <View style={[styles.expBox, { borderColor: selected===q.answer?Colors.green:Colors.red }]}>
          <Text style={styles.expIcon}>{selected===q.answer?'🎉':'❌'}</Text>
          <View style={{ flex:1 }}>
            <Text style={[styles.expTitle, { color: selected===q.answer?Colors.green:Colors.red }]}>
              {selected===q.answer?'yeah exactly — +'+q.xp+' XP':'not quite — here\'s why'}
            </Text>
            <Text style={styles.expText}>{q.explanation}</Text>
          </View>
          <TouchableOpacity onPress={next} style={[styles.nextBtn, { backgroundColor: selected===q.answer?Colors.green:Colors.red }]}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:14, gap:12 },
  closeBtn: { width:32, height:32, borderRadius:16, backgroundColor:Colors.bg3, alignItems:'center', justifyContent:'center' },
  closeText: { fontSize:16, color:Colors.muted },
  progressBar: { flex:1, height:10, backgroundColor:Colors.bg3, borderRadius:5, overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:5 },
  questionArea: { alignItems:'center', padding:24, gap:12 },
  qLabel: { fontSize:12, color:Colors.muted, fontWeight:'600', letterSpacing:1 },
  question: { fontSize:20, fontWeight:'900', color:Colors.text, textAlign:'center', lineHeight:28 },
  options: { padding:16, gap:10 },
  option: { flexDirection:'row', alignItems:'center', gap:12, padding:16, borderRadius:Radius.md, borderWidth:2 },
  optLetter: { fontSize:14, fontWeight:'900', color:Colors.muted, width:22 },
  optText: { fontSize:15, fontWeight:'600', flex:1 },
  expBox: { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', alignItems:'center', gap:12, padding:16, backgroundColor:Colors.bg2, borderTopWidth:2, borderRadius:Radius.lg },
  expIcon: { fontSize:32 },
  expTitle: { fontSize:15, fontWeight:'800', marginBottom:4 },
  expText: { fontSize:13, color:Colors.muted, lineHeight:18 },
  nextBtn: { paddingHorizontal:18, paddingVertical:10, borderRadius:Radius.md },
  nextBtnText: { color:'white', fontWeight:'800', fontSize:14 },
  completeScreen: { flex:1, alignItems:'center', justifyContent:'center', padding:32, gap:16 },
  completeTitle: { fontSize:32, fontWeight:'900', color:Colors.text },
  completeSub: { fontSize:16, color:Colors.muted },
  stars: { flexDirection:'row', gap:12 },
  starIcon: { fontSize:40, color:Colors.bg4 },
  starActive: { color:Colors.yellow },
  rewards: { flexDirection:'row', gap:24, padding:20, backgroundColor:Colors.bg2, borderRadius:Radius.xl, borderWidth:1, borderColor:Colors.border },
  reward: { alignItems:'center', gap:4 },
  rewardIcon: { fontSize:28 },
  rewardVal: { fontSize:18, fontWeight:'900', color:Colors.text },
  rewardLabel: { fontSize:11, color:Colors.muted },
  doneBtn: { width:'100%', paddingVertical:16, backgroundColor:Colors.purple, borderRadius:Radius.lg, alignItems:'center' },
  doneBtnText: { color:'white', fontWeight:'900', fontSize:18 },
});
