
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { FlameIcon } from '../icons';

export default function StreakBanner({ onPress }: { onPress?: () => void }) {
  const streak = useSelector((s: RootState) => s.streak);
  const days = ['S','M','T','W','T','F','S'];
  const todayIdx = new Date().getDay();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={['rgba(249,115,22,0.16)', 'rgba(249,115,22,0.04)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.left}>
          <View style={styles.fireWrap}>
            <FlameIcon color={Colors.orange} size={24} />
          </View>
          <View>
            <Text style={styles.count}>{streak.current === 1 ? '1 day streak' : streak.current === 0 ? 'start your streak today' : `${streak.current} day streak`}</Text>
            <Text style={styles.sub}>Keep it going!</Text>
          </View>
        </View>
        <View style={styles.week}>
          {days.map((d, i) => {
            const studied = streak.weekActivity[i] === true;
            return (
              <View key={i} style={styles.dayCol}>
                <View style={[
                  styles.dot,
                  studied && styles.dotActive,
                  i === todayIdx && !studied && styles.dotToday,
                ]}>
                  {studied && (
                    <Svg width={14} height={14} viewBox="0 0 24 24">
                      <Path d="M4 12l6 6L20 6" stroke={Colors.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </Svg>
                  )}
                </View>
                <Text style={[styles.dayLabel, i === todayIdx && { color: Colors.orange }]}>{d}</Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', margin:16, padding:16, borderRadius:Radius.xl, borderWidth:1, borderColor:'rgba(249,115,22,0.25)' },
  left: { flexDirection:'row', alignItems:'center', gap:12 },
  fireWrap: { width:44, height:44, borderRadius:22, backgroundColor:'rgba(249,115,22,0.15)', alignItems:'center', justifyContent:'center' },
  count: { fontSize:16, fontWeight:'900', color:Colors.orange },
  sub: { fontSize:11, color:Colors.muted, marginTop:2 },
  week: { flexDirection:'row', gap:6 },
  dayCol: { alignItems:'center', gap:4 },
  dot: { width:28, height:28, borderRadius:14, backgroundColor:Colors.bg3, borderWidth:1.5, borderColor:Colors.border, alignItems:'center', justifyContent:'center' },
  dotActive: { backgroundColor:Colors.orange, borderColor:Colors.orange },
  dotToday: { borderColor:Colors.orange, borderWidth:2 },
  dayLabel: { fontSize:9, color:Colors.muted, fontWeight:'700' },
});
