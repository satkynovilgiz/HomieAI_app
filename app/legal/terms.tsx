import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import Card from '../../components/ui/Card';
import ContentWrapper from '../../components/ui/ContentWrapper';

function LinkText({ url, children }: { url: string; children: string }) {
  return (
    <Text style={styles.link} onPress={() => Linking.openURL(url)}>
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>• {children}</Text>;
}

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Aug 14, 2026</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
       <ContentWrapper>
        <Text style={styles.metaLine}>HOMIE AI — Terms of Service</Text>
        <Text style={styles.metaLine}>Last updated: August 14, 2026</Text>
        <Text style={styles.metaLine}>Developer: Ilgiz Satkynov</Text>
        <Text style={[styles.metaLine, { marginBottom: 16 }]}>Contact: satkynovilgiz2008@gmail.com</Text>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>1. AGREEMENT</Text>
          <Text style={styles.body}>
            By downloading, installing, or using Homie AI you agree to be bound by these Terms of
            Service. If you do not agree to these terms please do not use the app.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>2. ELIGIBILITY</Text>
          <Text style={styles.body}>To use Homie you must:</Text>
          <Bullet>Be at least 13 years old</Bullet>
          <Bullet>Provide accurate registration info</Bullet>
          <Bullet>Have one account per person</Bullet>
          <Bullet>Have the legal capacity to agree to these terms</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>3. WHAT HOMIE PROVIDES</Text>
          <Text style={styles.body}>Homie is a free AI study app that offers:</Text>
          <Bullet>AI-powered chat tutoring</Bullet>
          <Bullet>Gamified learning (XP, streaks, gems)</Bullet>
          <Bullet>Study games and quizzes</Bullet>
          <Bullet>Voice mode study sessions</Bullet>
          <Bullet>Lecture recording and AI notes</Bullet>
          <Bullet>Homework scanning and solving</Bullet>
          <Bullet>Video search for educational content</Bullet>
          <Bullet>AI-generated study plans</Bullet>
          <Bullet>Friends and challenges system</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>4. ACCEPTABLE USE</Text>
          <Text style={styles.body}>You agree NOT to:</Text>
          <Bullet>Use Homie to cheat on exams or tests</Bullet>
          <Bullet>Submit AI-generated work as your own without disclosure to your institution</Bullet>
          <Bullet>Share your account credentials</Bullet>
          <Bullet>Attempt to hack or reverse engineer the app</Bullet>
          <Bullet>Upload inappropriate or illegal content</Bullet>
          <Bullet>Harass other users via messaging</Bullet>
          <Bullet>Use the app for any illegal purpose</Bullet>
          <Bullet>Scrape or copy app content</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>5. AI DISCLAIMER</Text>
          <Text style={styles.body}>
            Homie uses artificial intelligence to generate study content and responses.
          </Text>
          <Text style={[styles.body, { marginTop: 8 }]}>Important:</Text>
          <Bullet>AI responses may contain errors</Bullet>
          <Bullet>Always verify important information with teachers or textbooks</Bullet>
          <Bullet>Do not rely solely on Homie for exam preparation</Bullet>
          <Bullet>We are not responsible for academic outcomes based on AI responses</Bullet>
          <Bullet>AI is a study aid, not a replacement for real learning</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>6. INTELLECTUAL PROPERTY</Text>
          <Text style={styles.body}>
            Homie AI and all its content including the mascot, design, code, and features are owned
            by Ilgiz Satkynov. You may not copy, modify, or distribute any part of Homie without
            permission.
          </Text>
          <Text style={[styles.body, { marginTop: 8 }]}>
            User generated content (your notes, study plans) remains yours. You grant us a license to
            store and display it within the app.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>7. FREE SERVICE</Text>
          <Text style={styles.body}>
            Homie is currently free to use. We reserve the right to introduce premium features in the
            future. Core study features will always remain free for students. We will provide 30 days
            notice before any pricing changes.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>8. TERMINATION</Text>
          <Text style={styles.body}>We may suspend or terminate your account if you:</Text>
          <Bullet>Violate these Terms of Service</Bullet>
          <Bullet>Engage in abusive behavior</Bullet>
          <Bullet>Attempt to damage the service</Bullet>
          <Text style={[styles.body, { marginTop: 12 }]}>
            You may delete your account at any time from Profile → Danger Zone → Delete Account.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>9. LIMITATION OF LIABILITY</Text>
          <Text style={styles.body}>Homie is provided "as is" without warranties of any kind.</Text>
          <Text style={[styles.body, { marginTop: 8 }]}>We are not liable for:</Text>
          <Bullet>Academic performance or grades</Bullet>
          <Bullet>Errors in AI-generated content</Bullet>
          <Bullet>Data loss due to device issues</Bullet>
          <Bullet>Service interruptions</Bullet>
          <Bullet>Any indirect or consequential damages</Bullet>
          <Text style={[styles.body, { marginTop: 12 }]}>
            Maximum liability is limited to the amount you paid for the service (currently zero as
            Homie is free).
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>10. PRIVACY</Text>
          <Text style={styles.body}>
            Your use of Homie is also governed by our Privacy Policy available at:{' '}
            <LinkText url="https://homieai-steel.vercel.app/privacy">homieai-steel.vercel.app/privacy</LinkText>
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>11. CHANGES TO TERMS</Text>
          <Text style={styles.body}>
            We may modify these terms at any time. We will notify you of major changes via email or
            in-app notification. Continued use after changes means you accept the new terms.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>12. GOVERNING LAW</Text>
          <Text style={styles.body}>
            These terms are governed by the laws of the State of California, United States of America.
            Any disputes will be resolved through good faith negotiation first.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>13. CONTACT</Text>
          <Text style={styles.body}>Questions about these terms?</Text>
          <Text style={[styles.body, { marginTop: 8, fontWeight: '700', color: Colors.text }]}>Ilgiz Satkynov</Text>
          <Text style={styles.body}>Founder and CEO, Homie AI</Text>
          <Text style={styles.body}>
            Email: <LinkText url="mailto:satkynovilgiz2008@gmail.com">satkynovilgiz2008@gmail.com</LinkText>
          </Text>
          <Text style={styles.body}>
            Website: <LinkText url="https://homieai-steel.vercel.app">homieai-steel.vercel.app</LinkText>
          </Text>
          <Text style={styles.body}>Address: 1243 Vicente Dr APT 76, Sunnyvale, CA 94086</Text>
        </Card>
       </ContentWrapper>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  title: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  updated: { fontSize: 11, color: Colors.muted, minWidth: 32, textAlign: 'right' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  metaLine: { fontSize: 12, color: Colors.muted },
  card: { backgroundColor: '#12102a', borderColor: 'rgba(167,139,250,0.12)', borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#a78bfa', marginBottom: 10 },
  body: { fontSize: 13, color: '#9090c0', lineHeight: 22 },
  link: { color: '#a78bfa', textDecorationLine: 'underline' },
});
