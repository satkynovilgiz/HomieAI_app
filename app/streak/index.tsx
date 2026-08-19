
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import StreakFreeze from '../../components/streak/StreakFreeze';
import { TrophyIcon } from '../../components/icons';
import ContentWrapper from '../../components/ui/ContentWrapper';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['S','M','T','W','T','F','S'];

function Check({ size = 14, color = 'white' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 12l6 6L20 6" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function StreakScreen() {
  const { t } = useTranslation();
  const streak = useSelector((s: RootState) => s.streak);
  const user = useSelector((s: RootState) => s.user.current);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();
  const year = today.getFullYear();
  const monthIdx = today.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDay = new Date(year, monthIdx, 1).getDay();

  const isSelectedToday = selectedDate ? selectedDate.toDateString() === today.toDateString() : false;

  const dayHistory = selectedDate
    ? (user?.history || []).filter(h => new Date(h.date).toDateString() === selectedDate.toDateString())
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('streak_title')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
       <ContentWrapper>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.streakNum}>{streak.current}</Text>
          <Text style={styles.streakLabel}>{t('streak_day')}</Text>
          <Text style={styles.streakSub}>{t('streak_longest')} {streak.longest} {t('streak_days')}</Text>
        </View>

        {/* Week view */}
        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>{t('streak_this_week')}</Text>
          <View style={styles.weekRow}>
            {DAYS.map((d, i) => {
              const studied = streak.weekActivity[i] === true;
              return (
                <View key={i} style={styles.weekDay}>
                  <View style={[styles.weekDot, studied && styles.weekDotActive]}>
                    {studied && <Check size={14} color={Colors.white} />}
                  </View>
                  <Text style={styles.weekDayLabel}>{d}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Current month calendar */}
        <View style={styles.calCard}>
          <Text style={styles.calTitle}>{MONTHS[monthIdx]} {year}</Text>
          <View style={styles.calDays}>
            {DAYS.map((d, i) => <Text key={i} style={styles.calDayLabel}>{d}</Text>)}
          </View>
          <View style={styles.calGrid}>
            {[...Array(firstDay)].map((_, i) => <View key={`e${i}`} style={styles.calSlot}/>)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const cellDate = new Date(year, monthIdx, day);
              const dateStr = cellDate.toDateString();
              const isToday = dateStr === today.toDateString();
              const isFuture = day > today.getDate();
              const isStudied = streak.studiedDates.includes(dateStr);
              const isSelected = selectedDate ? selectedDate.toDateString() === dateStr : false;
              return (
                <View key={day} style={styles.calSlot}>
                  <TouchableOpacity
                    onPress={() => setSelectedDate(cellDate)}
                    style={[
                      styles.calCell,
                      isFuture && styles.calCellFuture,
                      (isToday || isStudied) && styles.calCellFilled,
                      isSelected && styles.calCellSelected,
                    ]}
                  >
                    <Text style={[styles.calCellText, (isToday || isStudied || isSelected) && styles.calCellTextActive]}>{day}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Session detail card */}
        {selectedDate && (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionCardTitle}>{MONTHS[monthIdx]} {selectedDate.getDate()}</Text>
            {dayHistory.length > 0 ? (
              <View style={{ gap: 10, marginTop: 12 }}>
                {dayHistory.map((h, i) => (
                  <View key={i} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historySubject}>{h.subject || 'Study session'}</Text>
                      <Text style={styles.historyDuration}>{h.duration_mins || 0} mins</Text>
                    </View>
                    <Text style={styles.historyXP}>+{h.xp_earned || 0} XP</Text>
                  </View>
                ))}
              </View>
            ) : isSelectedToday ? (
              <Text style={styles.sessionEmpty}>{t('streak_study_today')}</Text>
            ) : (
              <Text style={styles.sessionEmpty}>{t('streak_no_session')}</Text>
            )}
          </View>
        )}

        {/* Freeze */}
        <View style={{ padding:16 }}>
          <Text style={styles.sectionTitle}>{t('streak_protectors')}</Text>
          <StreakFreeze/>
        </View>

        {/* Milestones */}
        <View style={{ padding:16 }}>
          <Text style={styles.sectionTitle}>{t('streak_milestones')}</Text>
          {[[3,'3 Day Streak',100],[7,'Week Warrior',250],[14,'2 Week Legend',500],[30,'Month Master',1000],[100,'Century Club',5000]].map(([days,label,xp]) => {
            const earned = streak.current >= Number(days);
            return (
              <View key={days} style={[styles.milestone, earned && styles.milestoneEarned]}>
                <TrophyIcon color={earned ? Colors.green : Colors.muted} size={26} />
                <View style={{ flex:1 }}>
                  <Text style={styles.milestoneLabel}>{label}</Text>
                  <Text style={styles.milestoneDays}>{days} days</Text>
                </View>
                {earned ? (
                  <Check size={16} color={Colors.green} />
                ) : (
                  <Text style={styles.milestoneXP}>{`+${xp} XP`}</Text>
                )}
              </View>
            );
          })}
        </View>
        <View style={{ height:30 }}/>
       </ContentWrapper>
      </ScrollView>
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
  streakLabel: { fontSize:18, fontWeight:'700', color:Colors.text },
  streakSub: { fontSize:13, color:Colors.muted },
  weekCard: { margin:16, padding:18, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:'rgba(249,115,22,0.2)' },
  weekTitle: { fontSize:14, fontWeight:'700', color:Colors.text, marginBottom:14 },
  weekRow: { flexDirection:'row', justifyContent:'space-between' },
  weekDay: { alignItems:'center', gap:6 },
  weekDot: { width:32, height:32, borderRadius:16, backgroundColor:Colors.bg3, borderWidth:1.5, borderColor:Colors.border, alignItems:'center', justifyContent:'center' },
  weekDotActive: { backgroundColor:Colors.orange, borderColor:Colors.orange },
  weekDayLabel: { fontSize:11, color:Colors.muted, fontWeight:'700' },
  calCard: { marginHorizontal:16, marginBottom:12, padding:18, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  calTitle: { fontSize:16, fontWeight:'800', color:Colors.text, marginBottom:14, textAlign:'center' },
  calDays: { flexDirection:'row', justifyContent:'space-around', marginBottom:8 },
  calDayLabel: { fontSize:11, color:Colors.muted, fontWeight:'700', width:36, textAlign:'center' },
  calGrid: { flexDirection:'row', flexWrap:'wrap' },
  calSlot: { width:'14.28%', aspectRatio:1, alignItems:'center', justifyContent:'center' },
  calCell: { width:36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center' },
  calCellFuture: { opacity:0.3 },
  calCellFilled: { backgroundColor:Colors.orange },
  calCellSelected: { backgroundColor:Colors.purple },
  calCellText: { fontSize:14, fontWeight:'600', color:Colors.muted },
  calCellTextActive: { color:'white', fontWeight:'900' },
  sessionCard: { marginHorizontal:16, marginBottom:12, padding:18, backgroundColor:Colors.bg2, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  sessionCardTitle: { fontSize:16, fontWeight:'800', color:Colors.text },
  sessionEmpty: { fontSize:14, color:Colors.muted, marginTop:12 },
  historyRow: { flexDirection:'row', alignItems:'center', gap:10, padding:14, backgroundColor:Colors.bg3, borderRadius:12, borderWidth:1, borderColor:Colors.border, borderLeftWidth:3, borderLeftColor:Colors.purple },
  historySubject: { fontSize:14, fontWeight:'700', color:Colors.text },
  historyDuration: { fontSize:12, color:Colors.muted, marginTop:3 },
  historyXP: { fontSize:13, fontWeight:'800', color:Colors.green },
  sectionTitle: { fontSize:16, fontWeight:'800', color:Colors.text, marginBottom:12 },
  milestone: { flexDirection:'row', alignItems:'center', gap:12, padding:14, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border, marginBottom:8 },
  milestoneEarned: { borderColor:'rgba(16,185,129,0.3)', backgroundColor:'rgba(16,185,129,0.05)' },
  milestoneLabel: { fontSize:14, fontWeight:'700', color:Colors.text },
  milestoneDays: { fontSize:12, color:Colors.muted, marginTop:2 },
  milestoneXP: { fontSize:13, fontWeight:'700', color:Colors.muted },
});
