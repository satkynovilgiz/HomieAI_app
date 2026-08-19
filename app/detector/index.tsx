import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import { addXP } from '../../store/slices/userSlice';
import { Colors, Radius } from '../../constants/theme';
import { detectAIText, humanizeText, AIDetectionResult } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';
import ContentWrapper from '../../components/ui/ContentWrapper';

const MIN_CHARS = 200;

function verdictColor(score: number): string {
  if (score <= 30) return Colors.green;
  if (score <= 60) return Colors.yellow;
  return Colors.red;
}

function verdictLabel(score: number): string {
  if (score <= 30) return 'Likely Human';
  if (score <= 60) return 'Mixed';
  return 'Likely AI';
}

interface Segment { text: string; type?: 'ai' | 'human'; }

function highlightSegments(text: string, aiParts: string[], humanParts: string[]): Segment[] {
  type Range = { start: number; end: number; type: 'ai' | 'human' };
  const ranges: Range[] = [];
  const collect = (parts: string[], type: 'ai' | 'human') => {
    parts.forEach(part => {
      const needle = part.trim();
      if (needle.length < 4) return;
      const idx = text.toLowerCase().indexOf(needle.toLowerCase());
      if (idx >= 0) ranges.push({ start: idx, end: idx + needle.length, type });
    });
  };
  collect(aiParts, 'ai');
  collect(humanParts, 'human');
  ranges.sort((a, b) => a.start - b.start);

  const clean: Range[] = [];
  let cursor = 0;
  ranges.forEach(r => { if (r.start >= cursor) { clean.push(r); cursor = r.end; } });

  const segments: Segment[] = [];
  let pos = 0;
  clean.forEach(r => {
    if (r.start > pos) segments.push({ text: text.slice(pos, r.start) });
    segments.push({ text: text.slice(r.start, r.end), type: r.type });
    pos = r.end;
  });
  if (pos < text.length) segments.push({ text: text.slice(pos) });
  return segments;
}

export default function DetectorScreen() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [result, setResult] = useState<AIDetectionResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [humanized, setHumanized] = useState('');
  const [humanizing, setHumanizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const canAnalyze = text.trim().length >= MIN_CHARS;

  const analyze = async () => {
    if (!canAnalyze || loading) return;
    setLoading(true); setError(''); setResult(null); setHumanized('');
    const res = await detectAIText(text);
    setLoading(false);
    if (!res) { setError("couldn't parse a result — try again or shorten the text"); return; }
    setResult(res);
    dispatch(addXP(5));
  };

  const humanize = async () => {
    if (humanizing) return;
    setHumanizing(true);
    const out = await humanizeText(text);
    setHumanizing(false);
    if (!out) { setError('humanize failed — try again'); return; }
    setHumanized(out);
    dispatch(addXP(10));
  };

  const copyHumanized = async () => {
    await Clipboard.setStringAsync(humanized);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const segments = result ? highlightSegments(text, result.aiParts, result.humanParts) : [];
  const color = result ? verdictColor(result.score) : Colors.muted;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
       <ContentWrapper>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Detector</Text>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.sub}>Paste text below and Homie will check if it reads as human or AI-written.</Text>

          <TextInput
            value={text} onChangeText={t => { setText(t); setResult(null); setHumanized(''); setError(''); }}
            placeholder={`paste your text here (min ${MIN_CHARS} characters)...`}
            placeholderTextColor={Colors.muted} multiline
            style={styles.textarea}
          />
          <Text style={styles.charCount}>{text.length} / {MIN_CHARS} characters minimum</Text>

          <TouchableOpacity onPress={analyze} disabled={!canAnalyze || loading} style={[styles.analyzeBtn, (!canAnalyze || loading) && styles.btnDisabled]}>
            <Text style={styles.analyzeBtnText}>{loading ? 'analyzing...' : 'Check Text'}</Text>
          </TouchableOpacity>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {result && (
            <View style={styles.resultWrap}>
              <View style={[styles.scoreCircle, { borderColor: color }]}>
                <Text style={[styles.scoreNumber, { color }]}>{result.score}</Text>
                <Text style={styles.scoreOutOf}>/ 100</Text>
              </View>
              <Text style={[styles.verdictLabel, { color }]}>{verdictLabel(result.score)}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{result.confidence.toUpperCase()} CONFIDENCE</Text>
              </View>

              <View style={styles.reasonsWrap}>
                {result.reasons.map((r, i) => (
                  <View key={i} style={styles.reasonCard}>
                    <Text style={styles.reasonNumber}>{i + 1}</Text>
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                ))}
              </View>

              {segments.length > 0 && (
                <View style={styles.highlightCard}>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.red }]} /><Text style={styles.legendText}>AI-like</Text></View>
                    <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.green }]} /><Text style={styles.legendText}>Human-like</Text></View>
                  </View>
                  <Text style={styles.highlightedText}>
                    {segments.map((seg, i) => (
                      <Text key={i} style={seg.type === 'ai' ? styles.aiHighlight : seg.type === 'human' ? styles.humanHighlight : undefined}>
                        {seg.text}
                      </Text>
                    ))}
                  </Text>
                </View>
              )}

              <TouchableOpacity onPress={humanize} disabled={humanizing} style={[styles.humanizeBtn, humanizing && styles.btnDisabled]}>
                <Text style={styles.humanizeBtnText}>{humanizing ? 'rewriting...' : 'Humanize this text'}</Text>
              </TouchableOpacity>

              {!!humanized && (
                <View style={styles.humanizedCard}>
                  <Text style={styles.humanizedTitle}>Humanized version</Text>
                  <Text style={styles.humanizedText}>{humanized}</Text>
                  <TouchableOpacity onPress={copyHumanized} style={styles.copyBtn}>
                    <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy text'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
       </ContentWrapper>
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
  sub: { fontSize: 13, color: Colors.muted, marginBottom: 14, lineHeight: 19 },
  textarea: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 14, fontSize: 14, lineHeight: 21, height: 200, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: Colors.muted, marginTop: 6, marginBottom: 14 },
  analyzeBtn: { backgroundColor: Colors.purple, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  errorText: { color: Colors.red, fontSize: 13, marginTop: 10, textAlign: 'center' },
  resultWrap: { alignItems: 'center', marginTop: 24, marginBottom: 30, gap: 12 },
  scoreCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 6, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  scoreNumber: { fontSize: 40, fontWeight: '900' },
  scoreOutOf: { fontSize: 11, color: Colors.muted, marginTop: -4 },
  verdictLabel: { fontSize: 19, fontWeight: '900' },
  confidenceBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border },
  confidenceText: { fontSize: 11, fontWeight: '700', color: Colors.muted, letterSpacing: 0.5 },
  reasonsWrap: { width: '100%', gap: 8, marginTop: 8 },
  reasonCard: { flexDirection: 'row', gap: 10, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 13 },
  reasonNumber: { fontSize: 13, fontWeight: '900', color: Colors.purpleL, width: 16 },
  reasonText: { flex: 1, fontSize: 13, color: Colors.text2, lineHeight: 19 },
  highlightCard: { width: '100%', backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 14, marginTop: 8 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.muted },
  highlightedText: { fontSize: 13, color: Colors.text2, lineHeight: 20 },
  aiHighlight: { backgroundColor: 'rgba(239,68,68,0.25)', color: Colors.text },
  humanHighlight: { backgroundColor: 'rgba(16,185,129,0.25)', color: Colors.text },
  humanizeBtn: { width: '100%', paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.purpleL, alignItems: 'center', marginTop: 8 },
  humanizeBtnText: { color: Colors.purpleL, fontWeight: '700', fontSize: 14 },
  humanizedCard: { width: '100%', backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 10 },
  humanizedTitle: { fontSize: 14, fontWeight: '800', color: Colors.text },
  humanizedText: { fontSize: 13, color: Colors.text2, lineHeight: 20 },
  copyBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.sm, backgroundColor: Colors.purple },
  copyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
});
