
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import { callGemini } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';

const ESSAY_TYPES = ['Persuasive Essay','Argumentative Essay','Expository Essay','Narrative Essay','Research Paper Outline','Essay Introduction','Essay Conclusion'];
const LENGTHS = [['Short','~250 words'],['Medium','~500 words'],['Long','~750 words'],['Extended','~1000 words']];

export default function EssayScreen() {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Persuasive Essay');
  const [length, setLength] = useState(0);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const words = [250,500,750,1000][length];
      const prompt = `Write a ${type} about: "${topic}". Target length: approximately ${words} words. Make it well-structured, engaging, and academically sound with introduction, body paragraphs, and conclusion.`;
      const out = await callGemini([{ role: 'user', content: prompt }], 'You are an expert essay writer. Write clear, well-structured academic essays.');
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
          <Text style={styles.title}>Essay Writer ✍️</Text>
        </View>

        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <HomieBot mood="thinking" size={80}/>
          <Text style={styles.sub}>get a full essay draft in seconds — edit it and make it yours</Text>
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          <View>
            <Text style={styles.label}>Essay Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ESSAY_TYPES.map(t => (
                  <TouchableOpacity key={t} onPress={() => setType(t)}
                    style={[styles.chip, type === t && styles.chipActive]}>
                    <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View>
            <Text style={styles.label}>Length</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {LENGTHS.map(([l,d], i) => (
                <TouchableOpacity key={l} onPress={() => setLength(i)} style={[styles.lengthBtn, length === i && styles.lengthBtnActive]}>
                  <Text style={[styles.lengthLabel, length === i && { color: Colors.purpleL }]}>{l}</Text>
                  <Text style={styles.lengthDesc}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Essay Topic / Prompt</Text>
            <TextInput
              value={topic} onChangeText={setTopic}
              placeholder="e.g. Should social media be banned for teenagers?"
              placeholderTextColor={Colors.muted} multiline
              style={styles.topicInput}
            />
          </View>

          <TouchableOpacity onPress={generate} disabled={loading || !topic.trim()}
            style={[styles.generateBtn, (loading || !topic.trim()) && styles.generateBtnDisabled]}>
            <Text style={styles.generateBtnText}>{loading ? 'hold on...' : '✍️ generate essay'}</Text>
          </TouchableOpacity>

          {result !== '' && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>✅ your essay</Text>
              </View>
              <Text style={styles.resultText}>{result}</Text>
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>💡 always edit AI essays — add your own voice bro</Text>
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
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  sub: { fontSize: 13, color: Colors.muted, textAlign: 'center', paddingHorizontal: 30, marginTop: 8 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text2, marginBottom: 9 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: 'rgba(124,58,237,0.2)', borderColor: Colors.purpleL },
  chipText: { fontSize: 12, color: Colors.muted },
  chipTextActive: { color: Colors.purpleL, fontWeight: '700' },
  lengthBtn: { flex: 1, padding: 12, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  lengthBtnActive: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.1)' },
  lengthLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  lengthDesc: { fontSize: 10, color: Colors.muted, marginTop: 2 },
  topicInput: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 14, fontSize: 14, height: 100, textAlignVertical: 'top' },
  generateBtn: { backgroundColor: Colors.purple, paddingVertical: 15, borderRadius: Radius.md, alignItems: 'center' },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { color: Colors.white, fontWeight: '800', fontSize: 16 },
  resultCard: { padding: 18, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  resultTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  resultText: { fontSize: 14, color: Colors.text2, lineHeight: 22 },
  warningBox: { marginTop: 14, padding: 12, backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: Radius.sm, borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)' },
  warningText: { fontSize: 13, color: Colors.yellow },
});
