
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import StreakFreeze from '../../components/streak/StreakFreeze';
import HomieBot from '../../components/mascot/HomieBot';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['S','M','T','W','T','F','S'];

interface DayInfo {
  date: Date;
  studied: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export default function StreakScreen() {
  const streak = useSelector((s: RootState) => s.streak);
  const user = useSelector((s: RootState) => s.user.current);
  const [selected, setSelected] = useState<DayInfo | null>(null);
  const today = new Date();
  const year = today.getFullYear();

  const openDay = (date: Date) => {
    setSelected({
      date,
      studied: streak.studiedDates.includes(date.toDateString()),
      isToday: date.toDateString() === today.toDateString(),
      isFuture: date > today,
    });
  };

  const dayHistory = selected
    ? (user?.history || []).filter(h => new Date(h.date).toDateString() === selected.date.toDateString())
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Streak 🔥</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <HomieBot mood={streak.current >= 7 ? 'celebrating' : streak.current === 0 ? 'sad' : 'happy'} size={110}/>
          <Text style={styles.streakNum}>{streak.current}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
          <Text style={styles.streakSub}>longest: {streak.longest} days 🏆</Text>
        </View>

        {/* Week view */}
        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>This Week</Text>
          <View style={styles.weekRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.weekDay}>
                <View style={[styles.weekDot, streak.weekActivity[i] && styles.weekDotActive]}>
                  {streak.weekActivity[i] && <Text style={styles.weekCheck}>✓</Text>}
                </View>
                <Text style={styles.weekDayLabel}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Full year calendar */}
        <Text style={styles.yearLabel}>{year} — tap any day to see what you did</Text>
        {MONTHS.map((monthName, monthIdx) => {
          const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
          const firstDay = new Date(year, monthIdx, 1).getDay();
          const isCurrentMonth = monthIdx === today.getMonth();
          return (
            <View key={monthIdx} style={[styles.calCard, isCurrentMonth && styles.calCardCurrent]}>
              <Text style={styles.calTitle}>{monthName}</Text>
              <View style={styles.calDays}>
                {DAYS.map((d, i) => <Text key={i} style={styles.calDayLabel}>{d}</Text>)}
              </View>
              <View style={styles.calGrid}>
                {[...Array(firstDay)].map((_, i) => <View key={`e${i}`} style={styles.calCell}/>)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const cellDate = new Date(year, monthIdx, day);
                  const isToday = cellDate.toDateString() === today.toDateString();
                  const studied = streak.studiedDates.includes(cellDate.toDateString());
                  return (
                    <TouchableOpacity key={day} onPress={() => openDay(cellDate)}
                      style={[styles.calCell, isToday && styles.calCellToday, !isToday && studied && styles.calCellStudied]}>
                      <Text style={[styles.calCellText, isToday && styles.calCellTextToday]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Freeze */}
        <View style={{ padding:16 }}>
          <Text style={styles.sectionTitle}>Streak Protectors</Text>
          <StreakFreeze/>
        </View>

        {/* Milestones */}
        <View style={{ padding:16 }}>
          <Text style={styles.sectionTitle}>Milestones 🏆</Text>
          {[[3,'3 Day Streak','🔥',100],[7,'Week Warrior','⚡',250],[14,'2 Week Legend','💫',500],[30,'Month Master','👑',1000],[100,'Century Club','🌟',5000]].map(([days,label,icon,xp]) => (
            <View key={days} style={[styles.milestone, streak.current >= Number(days) && styles.milestoneEarned]}>
              <Text style={styles.milestoneIcon}>{icon}</Text>
              <View style={{ flex:1 }}>
                <Text style={styles.milestoneLabel}>{label}</Text>
                <Text style={styles.milestoneDays}>{days} days</Text>
              </View>
              <Text style={[styles.milestoneXP, streak.current >= Number(days) && { color:Colors.green }]}>{streak.current >= Number(days) ? '✅' : `+${xp} XP`}</Text>
            </View>
          ))}
        </View>
        <View style={{ height:30 }}/>
      </ScrollView>

      {/* Day detail modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => {}}>
            {selected && (
              <>
                <Text style={styles.modalDate}>
                  {selected.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
                {selected.isFuture ? (
                  <Text style={styles.modalEmpty}>hasn't happened yet</Text>
                ) : dayHistory.length > 0 ? (
                  <View style={{ gap: 10, marginTop: 12 }}>
                    {dayHistory.map((h, i) => (
                      <View key={i} style={styles.historyRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historySubject}>{h.subject || 'Study session'}</Text>
                          <Text style={styles.historyPreview} numberOfLines={2}>{h.preview || ''}</Text>
                        </View>
                        <Text style={styles.historyXP}>+{h.xp_earned || 0} XP</Text>
                      </View>
                    ))}
                  </View>
                ) : selected.studied ? (
                  <Text style={styles.modalEmpty}>you studied this day, but no detailed activity was logged</Text>
                ) : (
                  <Text style={styles.modalEmpty}>nothing here yet</Text>
                )}
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                  <Text style={styles.modalCloseText}>close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:16, gap:12 },
  back: { padding:4 },
  backArrow: { fontSize:24, color:Colors.text },
  title: { fontSize:22, fontWeight:'900', color:Colors.text },
  hero: { alignItems:'center', paddingVertical:28, gap:8 },
  streakNum: { fontSize:72, fontWeight:'900', color:Colors.orange },
  streakLabel: { fontSize:20, fontWeight:'700', color:Colors.text },
  streakSub: { fontSize:13, color:Colors.muted },
  weekCard: { margin:16, padding:18, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:'rgba(249,115,22,0.2)' },
  weekTitle: { fontSize:14, fontWeight:'700', color:Colors.text, marginBottom:14 },
  weekRow: { flexDirection:'row', justifyContent:'space-between' },
  weekDay: { alignItems:'center', gap:6 },
  weekDot: { width:36, height:36, borderRadius:18, backgroundColor:Colors.bg4, borderWidth:1.5, borderColor:Colors.border, alignItems:'center', justifyContent:'center' },
  weekDotActive: { backgroundColor:Colors.orange, borderColor:Colors.orange },
  weekCheck: { fontSize:14, color:'white', fontWeight:'900' },
  weekDayLabel: { fontSize:11, color:Colors.muted, fontWeight:'700' },
  yearLabel: { fontSize:11, fontWeight:'700', color:Colors.muted, letterSpacing:1.5, marginHorizontal:16, marginBottom:10, marginTop:8, textTransform:'uppercase' },
  calCard: { marginHorizontal:16, marginBottom:12, padding:18, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  calCardCurrent: { borderColor:'rgba(249,115,22,0.4)' },
  calTitle: { fontSize:16, fontWeight:'800', color:Colors.text, marginBottom:14, textAlign:'center' },
  calDays: { flexDirection:'row', justifyContent:'space-around', marginBottom:8 },
  calDayLabel: { fontSize:11, color:Colors.muted, fontWeight:'700', width:36, textAlign:'center' },
  calGrid: { flexDirection:'row', flexWrap:'wrap' },
  calCell: { width:'14.28%', aspectRatio:1, alignItems:'center', justifyContent:'center' },
  calCellToday: { backgroundColor:Colors.orange, borderRadius:20 },
  calCellStudied: { backgroundColor:'rgba(249,115,22,0.15)', borderRadius:20 },
  calCellText: { fontSize:13, color:Colors.muted },
  calCellTextToday: { color:'white', fontWeight:'900' },
  sectionTitle: { fontSize:16, fontWeight:'800', color:Colors.text, marginBottom:12 },
  milestone: { flexDirection:'row', alignItems:'center', gap:12, padding:14, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border, marginBottom:8 },
  milestoneEarned: { borderColor:'rgba(16,185,129,0.3)', backgroundColor:'rgba(16,185,129,0.05)' },
  milestoneIcon: { fontSize:28 },
  milestoneLabel: { fontSize:14, fontWeight:'700', color:Colors.text },
  milestoneDays: { fontSize:12, color:Colors.muted, marginTop:2 },
  milestoneXP: { fontSize:13, fontWeight:'700', color:Colors.muted },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.7)', alignItems:'center', justifyContent:'center', padding:24 },
  modalCard: { width:'100%', maxWidth:380, backgroundColor:Colors.bg2, borderRadius:Radius.xl, padding:22, borderWidth:1, borderColor:Colors.border },
  modalDate: { fontSize:16, fontWeight:'800', color:Colors.text, textAlign:'center' },
  modalEmpty: { fontSize:14, color:Colors.muted, textAlign:'center', marginTop:16 },
  historyRow: { flexDirection:'row', alignItems:'center', gap:10, padding:12, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border },
  historySubject: { fontSize:14, fontWeight:'700', color:Colors.text },
  historyPreview: { fontSize:12, color:Colors.muted, marginTop:3 },
  historyXP: { fontSize:13, fontWeight:'800', color:Colors.green },
  modalClose: { marginTop:18, paddingVertical:12, backgroundColor:Colors.bg3, borderRadius:Radius.md, alignItems:'center', borderWidth:1, borderColor:Colors.border },
  modalCloseText: { color:Colors.muted, fontWeight:'700', fontSize:13 },
});
