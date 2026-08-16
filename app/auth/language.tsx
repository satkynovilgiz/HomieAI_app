import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import { setLanguage } from '../../store/slices/languageSlice';
import { Language } from '../../constants/translations';
import HomieBot from '../../components/mascot/HomieBot';

const LANGUAGES: { code: Language; name: string; native: string; flag: string }[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
];

export default function LanguageScreen() {
  const dispatch = useDispatch();
  const { email, name } = useLocalSearchParams<{ email?: string; name?: string }>();
  const [selected, setSelected] = useState<Language>('en');

  const continueNext = async () => {
    dispatch(setLanguage(selected));
    await AsyncStorage.setItem('hm_language', selected);
    router.replace({ pathname: '/auth/verify', params: { email, name } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <HomieBot mood="happy" size={responsive.mascotSize.sm} />
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.sub}>you can change this later in settings</Text>

        <View style={styles.list}>
          {LANGUAGES.map(l => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setSelected(l.code)}
              style={[styles.card, selected === l.code && styles.cardSelected]}
              activeOpacity={0.85}
            >
              <Text style={styles.flag}>{l.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.native}>{l.native}</Text>
                <Text style={styles.name}>{l.name}</Text>
              </View>
              <View style={[styles.radio, selected === l.code && styles.radioSelected]}>
                {selected === l.code && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={continueNext} activeOpacity={0.9}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  title: { fontSize: responsive.fontSize.xxl, fontWeight: '900', color: Colors.text, marginTop: 16, textAlign: 'center' },
  sub: { fontSize: 13, color: Colors.muted, marginTop: 6, textAlign: 'center' },
  list: { width: '100%', gap: 12, marginTop: 28, marginBottom: 28 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: Colors.bg2, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border },
  cardSelected: { borderColor: Colors.purple, backgroundColor: 'rgba(124,58,237,0.1)' },
  flag: { fontSize: 32 },
  native: { fontSize: 16, fontWeight: '800', color: Colors.text },
  name: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border2, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: Colors.purple },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.purple },
  continueBtn: { width: '100%', height: 54, borderRadius: 14, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center' },
  continueBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
