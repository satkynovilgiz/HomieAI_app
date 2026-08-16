
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNotifications } from '../../hooks/useNotifications';
import { Colors, Radius } from '../../constants/theme';
import { timeAgo } from '../../lib/utils';

export default function NotificationsScreen() {
  const { notifications, markAll, mark, unread } = useNotifications();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 && (
          <TouchableOpacity onPress={markAll} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>no notifications</Text>
            <Text style={styles.emptySub}>you're all caught up bro</Text>
          </View>
        ) : notifications.map(n => (
          <TouchableOpacity key={n.id} onPress={() => mark(n.id)} style={[styles.notif, !n.read && styles.notifUnread]} activeOpacity={0.8}>
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.body}</Text>
              <Text style={styles.notifTime}>{timeAgo(new Date(n.timestamp).toISOString())}</Text>
            </View>
            {!n.read && <View style={styles.unreadDot}/>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg },
  header: { flexDirection:'row', alignItems:'center', padding:16, gap:12 },
  back: { padding:4 },
  backArrow: { fontSize:24, color:Colors.text },
  title: { fontSize:22, fontWeight:'900', color:Colors.text, flex:1 },
  markAllBtn: { padding:8 },
  markAllText: { fontSize:13, color:Colors.purpleL, fontWeight:'600' },
  content: { padding:16, gap:10 },
  empty: { alignItems:'center', paddingTop:60, gap:10 },
  emptyIcon: { fontSize:56 },
  emptyTitle: { fontSize:20, fontWeight:'800', color:Colors.text },
  emptySub: { fontSize:14, color:Colors.muted },
  notif: { flexDirection:'row', alignItems:'flex-start', gap:12, padding:14, backgroundColor:Colors.bg3, borderRadius:Radius.md, borderWidth:1, borderColor:Colors.border },
  notifUnread: { borderColor:'rgba(124,58,237,0.3)', backgroundColor:'rgba(124,58,237,0.05)' },
  notifIcon: { width:44, height:44, borderRadius:22, backgroundColor:Colors.bg2, alignItems:'center', justifyContent:'center' },
  notifIconText: { fontSize:22 },
  notifInfo: { flex:1 },
  notifTitle: { fontSize:14, fontWeight:'800', color:Colors.text, marginBottom:3 },
  notifBody: { fontSize:13, color:Colors.muted, lineHeight:18, marginBottom:5 },
  notifTime: { fontSize:11, color:Colors.muted },
  unreadDot: { width:10, height:10, borderRadius:5, backgroundColor:Colors.purple, marginTop:4 },
});
