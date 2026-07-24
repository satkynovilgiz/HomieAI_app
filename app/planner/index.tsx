
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius } from '../../constants/theme';
import { callGemini } from '../../lib/gemini';
import HomieBot from '../../components/mascot/HomieBot';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SUBJECTS = ['Math','Coding','Science','History','English','Physics','Chemistry','Biology'];
const COLORS = [Colors.purple, Colors.green, Colors.blue, Colors.orange, Colors.pink, Colors.yellow, Colors.red, '#8b5cf6'];

export default function PlannerScreen() {
  const [plan, setPlan] = useState<Record<string, boolean>>({});
  const [aiPlan, setAiPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState('');
  const [hours, setHours] = useState('2');

  useEffect(() => {
    AsyncStorage.getItem('hm_plan').then(v => { if (v) setPlan(JSON.parse(v)); });
  }, []);

  const savePlan = async (p: Record<string, boolean>) => {
    setPlan(p);
    await AsyncStorage.setItem('hm_plan', JSON.stringify(p));
  };

  const toggleSlot = (day: string, subj: string) => {
    const key = `${day}-${subj}`;
    savePlan({ ...plan, [key]: !plan[key] });
  };

  const generateAIPlan = async () => {
    if (!goal) return; setLoading(true);
    try {
      const prompt = `Create a practical weekly study plan for a student. Goal: "${goal}". Available: ${hours} hours/day. Give day-by-day plan with subjects and time. Keep it motivating. Max 150 words.`;
      const out = await callGemini([{ role: 'user', content: prompt }], 'You are a study coach. Create practical, motivating study plans.');
      setAiPlan(out);
    } catch(err: any) { setAiPlan('Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const planned = Object.values(plan).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} horizontal={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Study Planner 📅</Text>
        </View>

        <View style={{ padding: 16 }}>
          {/* AI Plan Generator */}
          <View style={styles.aiCard}>
            <HomieBot mood="thinking" size={48}/>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiCardTitle}>AI Plan Generator</Text>
              <Text style={styles.aiCardSub}>Tell HOMIE your goal!</Text>
            </View>
          </View>
          <TextInput value={goal} onChangeText={setGoal} placeholder="My goal: ace my Math final in 2 weeks..." placeholderTextColor={Colors.muted} style={styles.goalInput}/>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            {['1','2','3','4','5'].map(h => (
              <TouchableOpacity key={h} onPress={() => setHours(h)} style={[styles.hourBtn, hours === h && styles.hourBtnActive]}>
                <Text style={[styles.hourBtnText, hours === h && { color: Colors.purpleL }]}>{h}h</Text>
              </TouchableOpacity>
            ))}
            <Text style={{ color: Colors.muted, paddingTop: 10 }}>per day</Text>
          </View>
          <TouchableOpacity onPress={generateAIPlan} disabled={loading || !goal}
            style={[styles.generateBtn, (loading || !goal) && { opacity: 0.5 }]}>
            <Text style={styles.generateBtnText}>{loading ? '⏳ Generating...' : '✨ Generate Plan'}</Text>
          </TouchableOpacity>

          {aiPlan !== '' && (
            <View style={styles.aiPlanResult}>
              <Text style={{ fontSize: 14, color: Colors.text2, lineHeight: 21 }}>{aiPlan}</Text>
            </View>
          )}

          {/* Weekly grid */}
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 14 }}>Tap to toggle study slots · {planned} slots planned</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={{ flexDirection: 'row', marginBottom: 8, paddingLeft: 90 }}>
                {DAYS.map(d => (
                  <View key={d} style={styles.dayHeader}>
                    <Text style={styles.dayHeaderText}>{d}</Text>
                  </View>
                ))}
              </View>
              {SUBJECTS.map((subj, si) => (
                <View key={subj} style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'center' }}>
                  <View style={styles.subjLabel}>
                    <Text style={[styles.subjLabelText, { color: COLORS[si % COLORS.length] }]}>{subj}</Text>
                  </View>
                  {DAYS.map(day => {
                    const key = `${day}-${subj}`;
                    const active = !!plan[key];
                    return (
                      <TouchableOpacity key={day} onPress={() => toggleSlot(day, subj)}
                        style={[styles.slot, active && { backgroundColor: COLORS[si % COLORS.length] + '33', borderColor: COLORS[si % COLORS.length] }]}>
                        <Text style={{ fontSize: 14 }}>{active ? '✓' : ''}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={() => savePlan({})} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear Schedule</Text>
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
  title: { fontSize: 22, fontWeight: '900', color: Colors.text },
  aiCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: 'rgba(124,58,237,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)', marginBottom: 12 },
  aiCardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  aiCardSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  goalInput: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, color: Colors.text, padding: 13, fontSize: 14, marginBottom: 12 },
  hourBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  hourBtnActive: { borderColor: Colors.purpleL, backgroundColor: 'rgba(124,58,237,0.1)' },
  hourBtnText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  generateBtn: { backgroundColor: Colors.purple, paddingVertical: 13, borderRadius: Radius.md, alignItems: 'center', marginBottom: 14 },
  generateBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  aiPlanResult: { padding: 14, backgroundColor: Colors.bg3, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4, marginTop: 8 },
  dayHeader: { width: 44, alignItems: 'center' },
  dayHeaderText: { fontSize: 12, fontWeight: '700', color: Colors.muted },
  subjLabel: { width: 84, paddingRight: 8 },
  subjLabelText: { fontSize: 11, fontWeight: '700' },
  slot: { width: 40, height: 36, borderRadius: 7, backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginHorizontal: 2 },
  clearBtn: { paddingVertical: 12, backgroundColor: Colors.bg3, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginTop: 16 },
  clearBtnText: { color: Colors.muted, fontWeight: '600', fontSize: 14 },
});
