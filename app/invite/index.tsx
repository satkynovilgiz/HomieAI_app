import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { RootState } from '../../store';
import { Colors, Radius } from '../../constants/theme';
import { generateInviteLink, generateInviteMessage } from '../../lib/inviteService';
import HomieBot from '../../components/mascot/HomieBot';
import { ShareIcon } from '../../components/icons';

function BackArrowIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={Colors.white} strokeWidth="2" strokeLinecap="round"/>
      <Path d="M11 6L5 12L11 18" stroke={Colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

function MessageBubbleIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

function WhatsAppIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20 12C20 16.4 16.4 20 12 20C10.6 20 9.3 19.6 8.2 19L4 20L5.1 15.9C4.4 14.8 4 13.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M9.5 8.8C9.3 8.4 9.1 8.4 8.9 8.4C8.7 8.4 8.5 8.4 8.3 8.6C8.1 8.8 7.6 9.3 7.6 10.3C7.6 11.3 8.3 12.2 8.4 12.4C8.5 12.6 10 14.8 12.2 15.7C13.8 16.4 14.2 16.3 14.6 16.2C15 16.1 15.9 15.6 16.1 15.1C16.3 14.6 16.3 14.1 16.2 14C16.1 13.9 15.9 13.8 15.6 13.7C15.3 13.5 14.2 13 14 12.9C13.8 12.8 13.6 12.8 13.4 13C13.2 13.3 12.7 13.9 12.5 14.1C12.3 14.3 12.2 14.3 11.9 14.2C11.6 14 10.8 13.7 9.9 12.9C9.2 12.2 8.7 11.4 8.6 11.1C8.5 10.9 8.6 10.7 8.7 10.6C8.9 10.4 9 10.2 9.2 10C9.3 9.9 9.4 9.7 9.4 9.5C9.4 9.3 9.7 9.2 9.5 8.8Z" fill={color}/>
    </Svg>
  );
}

function InstagramIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3H17C19.2 3 21 4.8 21 7V17C21 19.2 19.2 21 17 21H7C4.8 21 3 19.2 3 17V7C3 4.8 4.8 3 7 3Z" stroke={color} strokeWidth="1.8" fill="none"/>
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8" fill="none"/>
      <Circle cx="17.2" cy="6.8" r="1" fill={color}/>
    </Svg>
  );
}

export default function InviteScreen() {
  const user = useSelector((s: RootState) => s.user.current);
  const language = useSelector((s: RootState) => s.language.current);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  if (!user) return null;

  const inviteLink = generateInviteLink(user.uid);
  const inviteMessage = generateInviteMessage(user.name, inviteLink, language);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const copyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    showToast('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaIMessage = () => {
    Linking.openURL(`sms:&body=${encodeURIComponent(inviteMessage)}`).catch(() =>
      showToast("couldn't open messages")
    );
  };

  const shareViaWhatsApp = () => {
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(inviteMessage)}`).catch(() =>
      showToast('WhatsApp not installed')
    );
  };

  const shareViaInstagram = async () => {
    await Clipboard.setStringAsync(inviteLink);
    showToast('Link copied — paste it in your story!');
  };

  const shareMore = async () => {
    try {
      await Share.share({ message: inviteMessage, url: inviteLink, title: 'Join me on Homie!' });
    } catch {}
  };

  const SHARE_BUTTONS = [
    { label: 'iMessage', color: '#10b981', Icon: MessageBubbleIcon, onPress: shareViaIMessage },
    { label: 'WhatsApp', color: '#10b981', Icon: WhatsAppIcon, onPress: shareViaWhatsApp },
    { label: 'Instagram', color: '#e1306c', Icon: InstagramIcon, onPress: shareViaInstagram },
    { label: 'More', color: '#a78bfa', Icon: ShareIcon, onPress: shareMore },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.hero}>
          <HomieBot mood="celebrating" size={100} />
          <Text style={styles.title}>Invite your friends</Text>
          <Text style={styles.sub}>Share Homie and study together</Text>
        </View>

        <View style={styles.linkCard}>
          <Text style={styles.cardLabel}>YOUR INVITE LINK</Text>
          <View style={styles.linkRow}>
            <Text style={styles.linkText} numberOfLines={1}>{inviteLink}</Text>
            <TouchableOpacity onPress={copyLink} style={[styles.copyBtn, copied && styles.copyBtnDone]} activeOpacity={0.85}>
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>{copied ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Share via...</Text>
          <View style={styles.shareGrid}>
            {SHARE_BUTTONS.map(({ label, color, Icon, onPress }) => (
              <TouchableOpacity key={label} onPress={onPress} style={styles.shareBtn} activeOpacity={0.8}>
                <Icon color={color} />
                <Text style={styles.shareBtnLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsLabel}>REWARDS</Text>
          <Text style={styles.rewardsText}>You + your friend both get:</Text>
          <Text style={styles.rewardsItem}>+100 XP when they sign up</Text>
          <Text style={styles.rewardsItem}>+50 gems bonus</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsRow}>Friends invited: {user.friendsInvited || 0}</Text>
          <Text style={styles.statsRow}>XP earned from invites: {user.inviteXP || 0}</Text>
        </View>
      </ScrollView>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.white },
  hero: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.white, marginTop: 12, textAlign: 'center' },
  sub: { fontSize: 14, color: Colors.muted, textAlign: 'center' },
  linkCard: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  cardLabel: { fontSize: 11, color: '#9090c0', letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linkText: { flex: 1, color: '#a78bfa', fontSize: 14, fontWeight: '600' },
  copyBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  copyBtnDone: { backgroundColor: 'rgba(16,185,129,0.15)' },
  copyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  copyBtnTextDone: { color: Colors.green },
  shareSection: { paddingHorizontal: 16, marginBottom: 16 },
  shareTitle: { fontSize: 12, color: Colors.muted, marginBottom: 10 },
  shareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shareBtn: { width: '47%', backgroundColor: '#12102a', borderWidth: 1, borderColor: '#1e1e3a', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6 },
  shareBtnLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  rewardsCard: { backgroundColor: 'rgba(251,191,36,0.06)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16 },
  rewardsLabel: { fontSize: 11, color: Colors.yellow, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  rewardsText: { fontSize: 13, color: Colors.text, marginBottom: 6 },
  rewardsItem: { fontSize: 13, color: Colors.muted, marginBottom: 2 },
  statsCard: { backgroundColor: '#12102a', borderRadius: 16, padding: 16, marginHorizontal: 16, gap: 6 },
  statsRow: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 18, paddingVertical: 10 },
  toastText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
});
