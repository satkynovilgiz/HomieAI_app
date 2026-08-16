
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { Conversation } from '../../store/slices/messagesSlice';
import { timeAgo } from '../../lib/utils';
import AvatarCircle from '../ui/AvatarCircle';

interface Props { conversation: Conversation; onPress: () => void; }

export default function ConversationRow({ conversation: c, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <AvatarCircle name={c.friendName} size={38} />
        <View style={styles.onlineDot}/>
      </View>
      <View style={styles.info}>
        <View style={styles.top}>
          <Text style={styles.name}>{c.friendName}</Text>
          <Text style={styles.time}>{timeAgo(new Date(c.lastTimestamp).toISOString())}</Text>
        </View>
        <Text style={[styles.preview, c.unread > 0 && styles.previewUnread]} numberOfLines={1}>{c.lastMessage}</Text>
      </View>
      {c.unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{c.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection:'row', alignItems:'center', gap:14, padding:16, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border },
  avatar: { position:'relative' },
  avatarEmoji: { fontSize:38 },
  onlineDot: { position:'absolute', bottom:0, right:0, width:12, height:12, borderRadius:6, backgroundColor:Colors.green, borderWidth:2, borderColor:Colors.bg3 },
  info: { flex:1 },
  top: { flexDirection:'row', justifyContent:'space-between', marginBottom:4 },
  name: { fontSize:15, fontWeight:'800', color:Colors.text },
  time: { fontSize:11, color:Colors.muted },
  preview: { fontSize:13, color:Colors.muted },
  previewUnread: { color:Colors.text, fontWeight:'600' },
  badge: { width:22, height:22, borderRadius:11, backgroundColor:Colors.purple, alignItems:'center', justifyContent:'center' },
  badgeText: { fontSize:11, fontWeight:'900', color:Colors.white },
});
