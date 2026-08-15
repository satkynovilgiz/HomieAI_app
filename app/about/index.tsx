
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import HomieBot from '../../components/mascot/HomieBot';

const VALUES = [
  { icon: '🎯', title: 'The Mission', text: 'Make high-quality AI tutoring free for every student. Education is a right.' },
  { icon: '💡', title: 'The Idea', text: 'HOMIE shows up like a real friend — not just answers, but presence.' },
  { icon: '🚀', title: 'The Vision', text: 'A world where every student has a brilliant AI friend who wants them to win.' },
  { icon: '❤️', title: 'The Promise', text: 'Free forever. No ads. No data selling. Built by a student for students.' },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>About HOMIE AI</Text>
        </View>

        <View style={styles.hero}>
          <HomieBot mood="celebrating" size={120}/>
          <Text style={styles.heroTitle}>HOMIE AI 🤖</Text>
          <Text style={styles.heroSub}>Not a tutor. Not a chatbot. Your actual AI best friend who explains anything and wants you to win.</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['100%','Free forever'],['12+','Features'],['∞','Questions'],['0','Boring lectures']].map(([n,l]) => (
              <View key={l} style={styles.statBox}>
                <Text style={styles.statNum}>{n}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {VALUES.map(({ icon, title, text }) => (
            <View key={title} style={styles.valueCard}>
              <Text style={styles.valueIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.valueTitle}>{title}</Text>
                <Text style={styles.valueText}>{text}</Text>
              </View>
            </View>
          ))}

          {/* Founder */}
          <View style={styles.founderCard}>
            <Text style={styles.founderAvatar}>👨‍💻</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.founderName}>Ilgiz Satkynov</Text>
              <Text style={styles.founderRole}>Founder & CEO</Text>
              <Text style={styles.founderBio}>18 y/o · De Anza College, Silicon Valley · SWE Intern @ Microsoft. Built HOMIE AI solo because every student deserves a brilliant study buddy.</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/ilgizsatkynov/')} style={styles.linkBtn}>
                  <Text style={styles.linkBtnText}>LinkedIn 💼</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://github.com/satkynovilgiz/HOMIE.AI')} style={styles.linkBtnSecondary}>
                  <Text style={styles.linkBtnTextSecondary}>GitHub 🐙</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => Linking.openURL('https://homieai-steel.vercel.app')} style={styles.webBtn}>
            <Text style={styles.webBtnText}>🌐 Visit homieai-steel.vercel.app</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/legal/privacy')} style={styles.legalBtn}>
            <Text style={styles.legalBtnText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/legal/terms')} style={styles.legalBtn}>
            <Text style={styles.legalBtnText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text },
  hero: { alignItems: 'center', padding: 24, gap: 14 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: Colors.purpleL },
  heroSub: { fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 21 },
  statBox: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.bg2, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: 24, fontWeight: '900', color: Colors.purpleL },
  statLabel: { fontSize: 11, color: Colors.muted, marginTop: 2 },
  valueCard: { flexDirection: 'row', gap: 14, padding: 18, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  valueIcon: { fontSize: 32 },
  valueTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 5 },
  valueText: { fontSize: 13, color: Colors.muted, lineHeight: 20 },
  founderCard: { flexDirection: 'row', gap: 14, padding: 20, backgroundColor: Colors.bg3, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border },
  founderAvatar: { fontSize: 50 },
  founderName: { fontSize: 18, fontWeight: '900', color: Colors.text },
  founderRole: { fontSize: 13, color: Colors.purpleL, fontWeight: '600', marginTop: 2, marginBottom: 8 },
  founderBio: { fontSize: 13, color: Colors.muted, lineHeight: 19 },
  linkBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(0,119,181,0.15)', borderRadius: Radius.sm, borderWidth: 1, borderColor: 'rgba(0,119,181,0.3)' },
  linkBtnText: { fontSize: 12, fontWeight: '700', color: '#0077b5' },
  linkBtnSecondary: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.bg2, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  linkBtnTextSecondary: { fontSize: 12, fontWeight: '700', color: Colors.text },
  webBtn: { paddingVertical: 14, backgroundColor: Colors.purple, borderRadius: Radius.md, alignItems: 'center' },
  webBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  legalBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', borderRadius: 12, padding: 14, alignItems: 'center', width: '100%', marginTop: 10 },
  legalBtnText: { color: '#a78bfa', fontWeight: '600', fontSize: 14 },
});
