import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/theme';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationKey } from '../../constants/translations';
import HomieBot from '../mascot/HomieBot';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  userName: string;
}

const WARNING_KEYS: TranslationKey[] = ['delete_item1', 'delete_item2', 'delete_item3', 'delete_item4', 'delete_item5'];

export default function DeleteAccountModal({ visible, onClose, onConfirm, loading }: Props) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const confirmWord = t('delete_word');
  const canConfirm = input.trim() === confirmWord;

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
          <Text style={styles.title}>{t('delete_title')}</Text>
          <Text style={styles.warnIntro}>{t('delete_warning')}</Text>

          <View style={styles.warnList}>
            {WARNING_KEYS.map(k => (
              <View key={k} style={styles.warnRow}>
                <View style={styles.bullet} />
                <Text style={styles.warnText}>{t(k)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.cannotUndo}>{t('delete_undone')}</Text>

          <Text style={styles.confirmLabel}>{t('delete_type')}</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder={t('delete_placeholder')}
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
              {t('delete_confirm_btn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.cancelBtn} activeOpacity={0.85}>
            <Text style={styles.cancelText}>{t('delete_cancel')}</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={Colors.white} size="large" />
              <Text style={styles.loadingText}>{t('delete_loading')}</Text>
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
