
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { ChatMessage } from '../../store/slices/messagesSlice';

interface Props { message: ChatMessage; isMe: boolean; senderAvatar?: string; }

export default function MessageBubble({ message: m, isMe, senderAvatar }: Props) {
  const isSpecial = m.type !== 'text';

  if (isSpecial) {
    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        {!isMe && <Text style={styles.avatar}>{senderAvatar || '🧑'}</Text>}
        <View style={styles.specialCard}>
          {m.type === 'streak_share' && <>
            <Text style={styles.specialIcon}>🔥</Text>
            <Text style={styles.specialTitle}>{m.payload?.streak} day streak!</Text>
            <Text style={styles.specialSub}>They're on fire bro!</Text>
          </>}
          {m.type === 'xp_share' && <>
            <Text style={styles.specialIcon}>⭐</Text>
            <Text style={styles.specialTitle}>+{m.payload?.xp} XP earned!</Text>
            <Text style={styles.specialSub}>Challenge them back!</Text>
          </>}
          {m.type === 'challenge' && <>
            <Text style={styles.specialIcon}>⚔️</Text>
            <Text style={styles.specialTitle}>Study Challenge!</Text>
            <Text style={styles.specialSub}>{m.text}</Text>
          </>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      {!isMe && <Text style={styles.avatar}>{senderAvatar || '🧑'}</Text>}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.text, isMe && styles.textMe]}>{m.text}</Text>
        <Text style={styles.time}>{new Date(m.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection:'row', alignItems:'flex-end', gap:8, marginVertical:3 },
  rowMe: { flexDirection:'row-reverse' },
  avatar: { fontSize:24 },
  bubble: { maxWidth:'78%', padding:12, borderRadius:18 },
  bubbleMe: { backgroundColor:Colors.purple, borderBottomRightRadius:4 },
  bubbleThem: { backgroundColor:Colors.bg3, borderWidth:1, borderColor:Colors.border, borderBottomLeftRadius:4 },
  text: { fontSize:14, color:Colors.text2, lineHeight:20 },
  textMe: { color:Colors.white },
  time: { fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:4, textAlign:'right' },
  specialCard: { backgroundColor:Colors.bg2, borderRadius:Radius.md, padding:16, borderWidth:1, borderColor:'rgba(251,191,36,0.3)', alignItems:'center', gap:4, minWidth:180 },
  specialIcon: { fontSize:36 },
  specialTitle: { fontSize:15, fontWeight:'900', color:Colors.yellow },
  specialSub: { fontSize:12, color:Colors.muted },
});
