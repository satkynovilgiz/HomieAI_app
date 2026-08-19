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

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Aug 14, 2026</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
       <ContentWrapper>
        <Text style={styles.metaLine}>App name: Homie AI</Text>
        <Text style={styles.metaLine}>Developer: Ilgiz Satkynov</Text>
        <Text style={styles.metaLine}>Contact: satkynovilgiz2008@gmail.com</Text>
        <Text style={styles.metaLine}>Website: homieai-steel.vercel.app</Text>
        <Text style={[styles.metaLine, { marginBottom: 16 }]}>Last updated: August 14, 2026</Text>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>1. INTRODUCTION</Text>
          <Text style={styles.body}>
            Homie AI is a free AI-powered study application for students. We take your privacy seriously.
            This Privacy Policy explains what information we collect, how we use it, and your rights.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>2. INFORMATION WE COLLECT</Text>
          <Text style={styles.subHeader}>Personal Information:</Text>
          <Bullet>Full name (when you sign up)</Bullet>
          <Bullet>Email address (for account creation)</Bullet>
          <Bullet>Password (stored encrypted on device)</Bullet>
          <Bullet>Profile avatar you choose</Bullet>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>Usage Data:</Text>
          <Bullet>Study sessions and subjects</Bullet>
          <Bullet>XP points and streak history</Bullet>
          <Bullet>Quiz scores and achievements</Bullet>
          <Bullet>Chat messages with Homie AI</Bullet>
          <Bullet>Lecture recordings (stored locally)</Bullet>
          <Bullet>Study plans and planner data</Bullet>
          <Bullet>Videos and articles you save</Bullet>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>Device Information:</Text>
          <Bullet>Device type (iPhone model)</Bullet>
          <Bullet>iOS version</Bullet>
          <Bullet>App version</Bullet>
          <Bullet>Crash reports (for bug fixes)</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>3. HOW WE USE YOUR DATA</Text>
          <Text style={styles.body}>We use your information to:</Text>
          <Bullet>Provide AI-powered study assistance</Bullet>
          <Bullet>Save your learning progress and streaks</Bullet>
          <Bullet>Personalize your study experience</Bullet>
          <Bullet>Send email verification codes</Bullet>
          <Bullet>Improve the app based on usage patterns</Bullet>
          <Bullet>Fix bugs and crashes</Bullet>
          <Text style={[styles.body, { marginTop: 12 }]}>We do NOT:</Text>
          <Bullet>Sell your data to anyone ever</Bullet>
          <Bullet>Share your data with advertisers</Bullet>
          <Bullet>Use your data for marketing without consent</Bullet>
          <Bullet>Store your chat messages on our servers</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>4. GOOGLE GEMINI AI</Text>
          <Text style={styles.body}>
            Homie uses Google Gemini AI to power chat responses, quiz generation, and study features.
            Your messages are sent to Google's servers for processing. Google's Privacy Policy applies:{' '}
            <LinkText url="https://policies.google.com/privacy">policies.google.com/privacy</LinkText>
            {'\n'}We do not store your conversations on Homie servers after processing.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>5. DATA STORAGE</Text>
          <Text style={styles.subHeader}>Local Storage:</Text>
          <Text style={styles.body}>
            Most of your data is stored locally on your device using AsyncStorage. This includes your
            profile, progress, streaks, saved videos, and chat history.
          </Text>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>Cloud Storage:</Text>
          <Text style={styles.body}>
            If Firebase is connected, some data may sync to Firebase servers for backup and account
            recovery. Firebase Privacy Policy:{' '}
            <LinkText url="https://firebase.google.com/support/privacy">firebase.google.com/support/privacy</LinkText>
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>6. EMAIL COMMUNICATIONS</Text>
          <Text style={styles.body}>We send emails only for:</Text>
          <Bullet>Account verification codes</Bullet>
          <Bullet>Important security notices</Bullet>
          <Text style={[styles.body, { marginTop: 8 }]}>
            We do not send marketing emails without your explicit consent.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>7. CHILDREN'S PRIVACY</Text>
          <Text style={styles.body}>
            Homie is designed for students 13 years of age and older. We do not knowingly collect
            personal information from children under 13. If you are under 13 please ask a parent or
            guardian to use the app. If we discover we have collected data from a child under 13 we
            will delete it immediately.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>8. DATA SECURITY</Text>
          <Text style={styles.body}>We take security seriously:</Text>
          <Bullet>Passwords are not stored in plain text</Bullet>
          <Bullet>Data is stored locally on your device</Bullet>
          <Bullet>We use HTTPS for all API calls</Bullet>
          <Bullet>Your data is never sold or traded</Bullet>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>9. YOUR RIGHTS</Text>
          <Text style={styles.body}>You have the right to:</Text>
          <Bullet>Access your personal data</Bullet>
          <Bullet>Correct inaccurate data</Bullet>
          <Bullet>Delete your account and all data</Bullet>
          <Bullet>Export your data (coming soon)</Bullet>
          <Text style={[styles.body, { marginTop: 12 }]}>
            To delete your account: Go to Profile → Danger Zone → Delete Account. This permanently
            removes all your data.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>10. THIRD PARTY SERVICES</Text>
          <Text style={styles.body}>Homie uses these third party services:</Text>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>Google Gemini AI</Text>
          <Text style={styles.body}>Purpose: AI chat and study features</Text>
          <Text style={styles.body}>
            Privacy: <LinkText url="https://policies.google.com/privacy">policies.google.com/privacy</LinkText>
          </Text>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>Firebase (Google)</Text>
          <Text style={styles.body}>Purpose: Authentication and database</Text>
          <Text style={styles.body}>
            Privacy: <LinkText url="https://firebase.google.com/support/privacy">firebase.google.com/support/privacy</LinkText>
          </Text>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>Expo</Text>
          <Text style={styles.body}>Purpose: App framework and updates</Text>
          <Text style={styles.body}>
            Privacy: <LinkText url="https://expo.dev/privacy">expo.dev/privacy</LinkText>
          </Text>
          <Text style={[styles.subHeader, { marginTop: 12 }]}>YouTube Data API</Text>
          <Text style={styles.body}>Purpose: Educational video search</Text>
          <Text style={styles.body}>
            Privacy: <LinkText url="https://policies.google.com/privacy">policies.google.com/privacy</LinkText>
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>11. CHANGES TO POLICY</Text>
          <Text style={styles.body}>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes via email or in-app notification. Continued use of Homie after changes means you
            accept the updated policy.
          </Text>
        </Card>

        <Card variant="bordered" style={styles.card}>
          <Text style={styles.sectionTitle}>12. CONTACT US</Text>
          <Text style={styles.body}>Questions about this Privacy Policy?</Text>
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
  subHeader: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  body: { fontSize: 13, color: '#9090c0', lineHeight: 22 },
  link: { color: '#a78bfa', textDecorationLine: 'underline' },
});
