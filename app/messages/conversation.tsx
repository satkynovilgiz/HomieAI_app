
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMessages } from '../../hooks/useMessages';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import MessageBubble from '../../components/messages/MessageBubble';

const QUICK_REPLIES = ['yo! 👋', 'fr fr 🔥', "let's study bro!", '💀', 'gg', 'nice streak!'];
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConv, send, read } = useMessages();
  const user = useSelector((s: RootState) => s.user.current);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const conv = getConv(id);

  useEffect(() => { if (id) read(id); }, [id]);
  useEffect(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100); }, [conv?.messages.length]);

  if (!conv) return null;

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    send(id, msg);
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const shareStreak = () => {
    const streak = user?.streak || 0;
    send(id, `🔥 ${streak} day streak bro! Study with me!`, 'streak_share');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.avatar}>{conv.friendAvatar}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{conv.friendName}</Text>
          <Text style={styles.status}>🟢 online</Text>
        </View>
        <TouchableOpacity onPress={shareStreak} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>🔥 share</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined}>
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={conv.messages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMe={item.senderId === 'me'}
              senderAvatar={item.senderId !== 'me' ? conv.friendAvatar : undefined}
            />
          )}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        />

        {/* Quick replies */}
        <View style={styles.quickReplies}>
          <FlatList
            horizontal data={QUICK_REPLIES} showsHorizontalScrollIndicator={false}
            keyExtractor={r => r}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSend(item)} style={styles.quickReply}>
                <Text style={styles.quickReplyText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            value={input} onChangeText={setInput}
            placeholder="type a message..."
            placeholderTextColor={Colors.muted}
            style={styles.input}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={() => handleSend()} disabled={!input.trim()} style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}>
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:12, gap:10, borderBottomWidth:1, borderBottomColor:Colors.border, backgroundColor:Colors.bg2 },
  back: { padding:4 },
  backArrow: { fontSize:22, color:Colors.text },
  avatar: { fontSize:34 },
  headerInfo: { flex:1 },
  name: { fontSize:15, fontWeight:'800', color:Colors.text },
  status: { fontSize:11, color:Colors.green, marginTop:1 },
  shareBtn: { paddingHorizontal:12, paddingVertical:6, backgroundColor:'rgba(249,115,22,0.15)', borderRadius:Radius.full, borderWidth:1, borderColor:'rgba(249,115,22,0.3)' },
  shareBtnText: { fontSize:12, fontWeight:'700', color:Colors.orange },
  messages: { padding:16, gap:8 },
  quickReplies: { paddingHorizontal:12, paddingVertical:8, borderTopWidth:1, borderTopColor:Colors.border },
  quickReply: { paddingHorizontal:14, paddingVertical:8, backgroundColor:Colors.bg3, borderRadius:Radius.full, borderWidth:1, borderColor:Colors.border, marginRight:8 },
  quickReplyText: { fontSize:13, color:Colors.text },
  inputBar: { flexDirection:'row', alignItems:'center', gap:8, padding:10, backgroundColor:Colors.bg2, borderTopWidth:1, borderTopColor:Colors.border },
  input: { flex:1, backgroundColor:Colors.bg3, borderWidth:1, borderColor:Colors.border, borderRadius:Radius.full, color:Colors.text, paddingHorizontal:16, paddingVertical:10, fontSize:14 },
  sendBtn: { width:42, height:42, borderRadius:21, backgroundColor:Colors.purple, alignItems:'center', justifyContent:'center' },
  sendBtnDisabled: { opacity:0.4 },
  sendBtnText: { fontSize:20, color:'white', fontWeight:'700' },
});
