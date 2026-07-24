
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Radius } from '../../constants/theme';
import { detectAI } from '../../lib/utils';
import { callGemini } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';

export default function DetectorScreen() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [humanized, setHumanized] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'detect'|'humanize'>('detect');

  const analyze = () => {
    if (text.trim().length < 50) return;
    setResult(detectAI(text));
  };

  const humanize = async () => {
    if (text.trim().length < 50) return;
    setLoading(true);
    try {
      const prompt = 'Rewrite this text to sound completely human-written by a student. Casual, add natural imperfections, vary sentence length. Sound like a real student:\n\n' + text;
      const out = await callGemini([{ role: 'user', content: prompt }], 'You are a text humanizer. Make text sound like a real student wrote it.');
      setHumanized(out);
    } catch(err: any) { setHumanized('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const getVerdict = (pct: number) => pct > 65
    ? { label: 'Likely AI 🤖', color: Colors.red }
    : 100 - pct > 65
    ? { label: 'Likely Human ✅', color: Colors.green }
    : { label: 'Mixed 🤔', color: Colors.yellow };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Detector 🤫</Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 20, paddingHorizontal: 20 }}>
          <HomieBot mood="thinking" size={80}/>
          <Text style={styles.sub}>Check if text is AI-written. No one must know 😏</Text>
          <View style={styles.privateBadge}>
            <Text style={styles.privateBadgeText}>🔒 Private — nothing stored</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {([['detect','🔍 Detect AI'],['humanize','✏️ Humanize']] as const).map(([id,label]) => (
            <TouchableOpacity key={id} onPress={() => setTab(id)}
              style={[styles.tab, tab === id && styles.tabActive]}>
              <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          <TextInput
            value={text} onChangeText={setText}
            placeholder="Paste your text here bro... (min 50 characters)"
            placeholderTextColor={Colors.muted} multiline
            style={styles.textarea}
          />
          <Text style={styles.charCount}>{text.length} characters</Text>

          <TouchableOpacity
            onPress={tab === 'detect' ? analyze : humanize}
            disabled={loading || text.length < 50}
            style={[styles.analyzeBtn, (loading || text.length < 50) && styles.analyzeBtnDisabled]}>
            <Text style={styles.analyzeBtnText}>{loading ? '⏳ Working...' : tab === 'detect' ? '🔍 Analyze' : '✏️ Humanize'}</Text>
          </TouchableOpacity>

          {tab === 'detect' && result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Results</Text>
              {[['AI Content', result.aiPct, Colors.red], ['Human Content', result.humanPct, Colors.green]].map(([l,p,c]) => (
                <View key={l as string} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
                    <Text style={{ color: Colors.text, fontWeight: '600' }}>{l as string}</Text>
                    <Text style={{ color: c as string, fontWeight: '700' }}>{p as number}%</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${p}%` as any, backgroundColor: c as string }]}/>
                  </View>
                </View>
              ))}
              <View style={[styles.verdictBox, { borderColor: getVerdict(result.aiPct).color + '44' }]}>
                <HomieBot mood={result.aiPct > 60 ? 'shocked' : 'celebrating'} size={48}/>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.verdictLabel, { color: getVerdict(result.aiPct).color }]}>{getVerdict(result.aiPct).label}</Text>
                  <Text style={styles.verdictSub}>{result.aiPct > 60 ? 'High AI probability. Try humanizing! 👆' : 'Looks human-written! ✅'}</Text>
                </View>
              </View>
            </View>
          )}

          {tab === 'humanize' && humanized && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>✅ Humanized Version</Text>
              <Text style={{ color: Colors.text2, fontSize: 14, lineHeight: 22 }}>{humanized}</Text>
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
  sub: { fontSize: 14, color: Colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 10 },
  privateBadge: { paddingHorizontal: 14, paddingVertical: 5, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 50, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  privateBadgeText: { fontSize: 12, color: Colors.red, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.bg2, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.muted },
  tabTextActive: { color: Colors.white },
  textarea: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 14, fontSize: 14, lineHeight: 21, height: 180, textAlignVertical: 'top', marginBottom: 8 },
  charCount: { fontSize: 12, color: Colors.muted, marginBottom: 14 },
  analyzeBtn: { backgroundColor: Colors.purple, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  resultCard: { marginTop: 20, padding: 18, backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  resultTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 18 },
  barTrack: { height: 10, backgroundColor: Colors.bg4, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  verdictBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1 },
  verdictLabel: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  verdictSub: { fontSize: 13, color: Colors.muted },
});
