
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMessages } from '../../hooks/useMessages';
import { Colors, Radius } from '../../constants/theme';
import ConversationRow from '../../components/messages/ConversationRow';

export default function MessagesScreen() {
  const { conversations, totalUnread } = useMessages();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        {totalUnread > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{totalUnread}</Text></View>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>nothing here yet</Text>
            <Text style={styles.emptySub}>add friends and say hi</Text>
          </View>
        ) : conversations.map(conv => (
          <ConversationRow
            key={conv.id} conversation={conv}
            onPress={() => router.push({ pathname:'/messages/conversation', params:{ id: conv.id } })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:16, gap:10 },
  back: { padding:4 },
  backArrow: { fontSize:24, color:Colors.text },
  title: { fontSize:22, fontWeight:'900', color:Colors.text, flex:1 },
  badge: { width:24, height:24, borderRadius:12, backgroundColor:Colors.red, alignItems:'center', justifyContent:'center' },
  badgeText: { fontSize:11, fontWeight:'900', color:'white' },
  content: { padding:16, gap:10 },
  empty: { alignItems:'center', paddingTop:60 },
  emptyIcon: { fontSize:60, marginBottom:16 },
  emptyTitle: { fontSize:20, fontWeight:'800', color:Colors.text },
  emptySub: { fontSize:14, color:Colors.muted, marginTop:6 },
});
