
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';

interface Props { streak: number; visible: boolean; onClose: () => void; }

export default function StreakCelebration({ streak, visible, onClose }: Props) {
  const scale = new Animated.Value(0);

  useEffect(() => {
    if (visible) Animated.spring(scale, { toValue:1, useNativeDriver:true }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform:[{ scale }] }]}>
          <HomieBot mood="celebrating" size={120}/>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>{streak} day streak!</Text>
          <Text style={styles.sub}>you're on fire bro, keep it going</Text>
          <View style={styles.rewards}>
            <View style={styles.reward}><Text style={styles.rewardIcon}>⭐</Text><Text style={styles.rewardText}>+{streak * 10} XP</Text></View>
            <View style={styles.reward}><Text style={styles.rewardIcon}>💎</Text><Text style={styles.rewardText}>+{streak * 5} Gems</Text></View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Text style={styles.btnText}>let's go 🚀</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.8)', alignItems:'center', justifyContent:'center', padding:24 },
  card: { width:'100%', backgroundColor:Colors.bg2, borderRadius:Radius.xl, padding:32, alignItems:'center', borderWidth:1, borderColor:'rgba(249,115,22,0.4)' },
  emoji: { fontSize:60, marginTop:8 },
  title: { fontSize:32, fontWeight:'900', color:Colors.orange, marginTop:8 },
  sub: { fontSize:15, color:Colors.muted, textAlign:'center', marginTop:8, lineHeight:22 },
  rewards: { flexDirection:'row', gap:20, marginTop:20, marginBottom:24 },
  reward: { alignItems:'center', gap:4 },
  rewardIcon: { fontSize:28 },
  rewardText: { fontSize:16, fontWeight:'800', color:Colors.text },
  btn: { width:'100%', paddingVertical:15, backgroundColor:Colors.orange, borderRadius:Radius.md, alignItems:'center' },
  btnText: { color:Colors.white, fontWeight:'900', fontSize:16 },
});
