import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/theme';
import HomieBot from '../mascot/HomieBot';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  userName: string;
}

const WARNINGS = [
  'All your XP and progress',
  'Your streak history',
  'All saved chats',
  'Your gems and achievements',
  'All saved videos and notes',
];

export default function DeleteAccountModal({ visible, onClose, onConfirm, loading }: Props) {
  const [input, setInput] = useState('');
  const canConfirm = input.trim() === 'DELETE';

  const handleClose = () => {
    if (loading) return;
    setInput('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm || loading) return;
    onConfirm();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <HomieBot mood="sad" size={80} />
          <Text style={styles.title}>Delete your account?</Text>
          <Text style={styles.warnIntro}>This will permanently delete:</Text>

          <View style={styles.warnList}>
            {WARNINGS.map(w => (
              <View key={w} style={styles.warnRow}>
                <View style={styles.bullet} />
                <Text style={styles.warnText}>{w}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.cannotUndo}>This cannot be undone.</Text>

          <Text style={styles.confirmLabel}>Type DELETE to confirm:</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="type DELETE here"
            placeholderTextColor="#555577"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!canConfirm || loading}
            style={[styles.confirmBtn, canConfirm ? styles.confirmBtnEnabled : styles.confirmBtnDisabled]}
            activeOpacity={0.85}
          >
            <Text style={canConfirm ? styles.confirmTextEnabled : styles.confirmTextDisabled}>
              Yes, delete my account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.cancelBtn} activeOpacity={0.85}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={Colors.white} size="large" />
              <Text style={styles.loadingText}>Deleting your account...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#0d0b22', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', overflow: 'hidden' },
  title: { fontSize: 22, fontWeight: '900', color: Colors.white, textAlign: 'center', marginTop: 16 },
  warnIntro: { fontSize: 14, color: '#9090c0', marginTop: 16, alignSelf: 'flex-start' },
  warnList: { alignSelf: 'stretch', marginTop: 10, gap: 8 },
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  warnText: { fontSize: 14, color: '#9090c0', flex: 1 },
  cannotUndo: { fontSize: 13, color: Colors.red, textAlign: 'center', fontWeight: '700', marginTop: 12, marginBottom: 20 },
  confirmLabel: { fontSize: 12, color: '#9090c0', marginBottom: 8, alignSelf: 'flex-start' },
  input: { alignSelf: 'stretch', backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, height: 48, paddingHorizontal: 16, color: Colors.white, fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  confirmBtn: { alignSelf: 'stretch', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  confirmBtnDisabled: { backgroundColor: '#1a1a2e' },
  confirmBtnEnabled: { backgroundColor: Colors.red },
  confirmTextDisabled: { color: '#555577', fontWeight: '700', fontSize: 15 },
  confirmTextEnabled: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  cancelBtn: { alignSelf: 'stretch', height: 48, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  cancelText: { color: '#9090c0', fontWeight: '700', fontSize: 14 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
});
