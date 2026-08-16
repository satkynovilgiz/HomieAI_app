
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';

export default function GemsCounter({ onPress }: { onPress?: () => void }) {
  const { count } = useSelector((s: RootState) => s.gems);
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.count}>{count.toLocaleString()} gems</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:6, backgroundColor:Colors.bg3, borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(59,130,246,0.3)' },
  icon: { fontSize:16 },
  count: { fontSize:14, fontWeight:'800', color:Colors.blue },
});
