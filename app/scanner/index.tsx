
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radius } from '../../constants/theme';
import { callGemini, getSystemPrompt } from '../../lib/gemini';
import { useTranslation } from '../../hooks/useTranslation';
import HomieBot from '../../components/mascot/HomieBot';

export default function ScannerScreen() {
  const { language } = useTranslation();
  const [img, setImg] = useState<string | null>(null);
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImg = async (camera = false) => {
    const res = camera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (!res.canceled && res.assets[0].base64) {
      setImg(res.assets[0].uri); setImgB64(res.assets[0].base64); setResult('');
    }
  };

  const solve = async () => {
    if (!imgB64) return; setLoading(true);
    try {
      const q = question.trim() || 'Please explain and solve this homework problem step by step.';
      const messages = [{ role: 'user', content: [
        { type: 'image', media_type: 'image/jpeg', data: imgB64 },
        { type: 'text', text: q }
      ]}];
      const out = await callGemini(messages, getSystemPrompt('General', language));
      setResult(out);
    } catch(err: any) { setResult('something broke — try again'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Homework Scanner 📸</Text>
        </View>

        <View style={{ padding: 16 }}>
          {!img ? (
            <View style={styles.uploadBox}>
              <Text style={styles.uploadIcon}>📸</Text>
              <Text style={styles.uploadTitle}>Upload Homework Photo</Text>
              <Text style={styles.uploadSub}>Take a photo or upload from your gallery</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity onPress={() => pickImg(true)} style={styles.uploadBtn}>
                  <Text style={styles.uploadBtnText}>📷 take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => pickImg(false)} style={[styles.uploadBtn, styles.uploadBtnSecondary]}>
                  <Text style={[styles.uploadBtnText, { color: Colors.text }]}>⬆ upload</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Image source={{ uri: img }} style={styles.preview} resizeMode="contain"/>
              <TextInput
                value={question} onChangeText={setQuestion}
                placeholder="ask a specific question (optional)..."
                placeholderTextColor={Colors.muted} style={styles.questionInput}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => { setImg(null); setImgB64(null); setResult(''); setQuestion(''); }}
                  style={styles.newPhotoBtn}>
                  <Text style={styles.newPhotoBtnText}>← new photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={solve} disabled={loading} style={[styles.solveBtn, loading && { opacity: 0.6 }]}>
                  <Text style={styles.solveBtnText}>{loading ? 'hold on...' : '🔍 solve this'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {result !== '' && (
            <View style={styles.resultCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <HomieBot mood="happy" size={48}/>
                <View>
                  <Text style={styles.resultTitle}>HOMIE's Explanation 📚</Text>
                  <Text style={{ fontSize: 12, color: Colors.muted }}>Step-by-step solution</Text>
                </View>
              </View>
              <Text style={styles.resultText}>{result}</Text>
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ always verify solutions and understand each step</Text>
              </View>
            </View>
          )}
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
  uploadBox: { padding: 32, backgroundColor: Colors.bg3, borderRadius: Radius.xl, borderWidth: 2, borderColor: Colors.border, alignItems: 'center' },
  uploadIcon: { fontSize: 64, marginBottom: 14 },
  uploadTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  uploadSub: { fontSize: 13, color: Colors.muted, textAlign: 'center' },
  uploadBtn: { flex: 1, paddingVertical: 12, backgroundColor: Colors.purple, borderRadius: Radius.md, alignItems: 'center' },
  uploadBtnSecondary: { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border },
  uploadBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  preview: { width: '100%', height: 250, backgroundColor: Colors.bg3, borderRadius: Radius.md, marginBottom: 14 },
  questionInput: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 13, fontSize: 14, marginBottom: 12 },
  newPhotoBtn: { paddingHorizontal: 18, paddingVertical: 13, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  newPhotoBtnText: { color: Colors.text, fontWeight: '600' },
  solveBtn: { flex: 1, paddingVertical: 13, backgroundColor: Colors.purple, borderRadius: Radius.md, alignItems: 'center' },
  solveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  resultCard: { marginTop: 16, padding: 18, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  resultTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  resultText: { fontSize: 14, color: Colors.text2, lineHeight: 22 },
  warningBox: { marginTop: 14, padding: 11, backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: Radius.sm },
  warningText: { fontSize: 12, color: Colors.yellow },
});
