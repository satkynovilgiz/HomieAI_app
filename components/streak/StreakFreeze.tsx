
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useFreeze } from '../../store/slices/streakSlice';
import { Colors, Radius } from '../../constants/theme';

export default function StreakFreeze() {
  const dispatch = useDispatch();
  const { freezesLeft } = useSelector((s: RootState) => s.streak);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🧊</Text>
      <View style={styles.info}>
        <Text style={styles.title}>Streak Freeze</Text>
        <Text style={styles.sub}>You have {freezesLeft} freeze{freezesLeft !== 1 ? 's' : ''} left</Text>
      </View>
      <TouchableOpacity onPress={() => dispatch(useFreeze())} disabled={freezesLeft === 0}
        style={[styles.btn, freezesLeft === 0 && styles.btnDisabled]}>
        <Text style={styles.btnText}>Use</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection:'row', alignItems:'center', gap:12, padding:16, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:'rgba(59,130,246,0.3)' },
  icon: { fontSize:32 },
  info: { flex:1 },
  title: { fontSize:15, fontWeight:'700', color:Colors.text },
  sub: { fontSize:12, color:Colors.muted, marginTop:2 },
  btn: { paddingHorizontal:16, paddingVertical:8, backgroundColor:Colors.blue, borderRadius:Radius.sm },
  btnDisabled: { opacity:0.4 },
  btnText: { color:Colors.white, fontWeight:'700', fontSize:13 },
});
