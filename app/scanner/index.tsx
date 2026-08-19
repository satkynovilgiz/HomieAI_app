
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { Colors, Radius } from '../../constants/theme';
import { responsive } from '../../constants/responsive';
import { callGemini, getSystemPrompt } from '../../lib/gemini';
import { useTranslation } from '../../hooks/useTranslation';
import HomieBot from '../../components/mascot/HomieBot';
import { CameraIcon } from '../../components/icons';

function GalleryIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" fill="none"/>
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
      <Path d="M21 15L16 10L5 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

type Mood = 'happy' | 'sad' | 'thinking';

export default function ScannerScreen() {
  const { language } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [mood, setMood] = useState<Mood>('thinking');

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Homie needs camera access to scan your homework.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7, base64: true });
      if (!result.canceled && result.assets[0]?.base64) {
        setImage(result.assets[0].uri);
        setImgB64(result.assets[0].base64);
        setAnswer('');
      }
    } catch {
      Alert.alert('Something went wrong', 'Could not open the camera. Try again.');
    }
  };

  const choosePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Homie needs photo library access to scan your homework.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: true });
      if (!result.canceled && result.assets[0]?.base64) {
        setImage(result.assets[0].uri);
        setImgB64(result.assets[0].base64);
        setAnswer('');
      }
    } catch {
      Alert.alert('Something went wrong', 'Could not open your photos. Try again.');
    }
  };

  const solveHomework = async () => {
    if (!imgB64) {
      Alert.alert('No image', 'Take or choose a photo first!');
      return;
    }
    setLoading(true);
    setMood('thinking');
    setAnswer('');
    try {
      const messages = [{
        role: 'user',
        content: [
          { type: 'image', media_type: 'image/jpeg', data: imgB64 },
          {
            type: 'text',
            text: 'Solve this homework problem step by step. If it is math, show all the work. If it is science, explain the concepts. If it is writing, give feedback and suggestions. Help me understand, not just get the answer.',
          },
        ],
      }];
      const reply = await callGemini(messages, getSystemPrompt('General', language));
      if (reply) {
        setAnswer(reply);
        setMood('happy');
      } else {
        setAnswer("could not read the image. try taking a clearer photo bro");
        setMood('sad');
      }
    } catch {
      setAnswer('something went wrong. try again bro');
      setMood('sad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Homework</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomieBot mood={mood} size={80}/>
        <Text style={styles.title}>Take a photo of your homework</Text>
        <Text style={styles.sub}>and Homie will solve it for you</Text>

        {image ? (
          <Image source={{ uri: image }} style={styles.preview} resizeMode="contain"/>
        ) : (
          <View style={styles.emptyImage}>
            <CameraIcon color={Colors.muted} size={32}/>
            <Text style={styles.emptyText}>no photo yet</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.photoBtn, { borderColor: Colors.purple }]} onPress={takePhoto} activeOpacity={0.8}>
            <CameraIcon color={Colors.purpleL} size={20}/>
            <Text style={[styles.photoBtnText, { color: Colors.purpleL }]}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoBtn, { borderColor: Colors.blue }]} onPress={choosePhoto} activeOpacity={0.8}>
            <GalleryIcon color={Colors.blue} size={20}/>
            <Text style={[styles.photoBtnText, { color: Colors.blue }]}>Choose Photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.solveBtn, !image && styles.solveBtnDisabled]}
          onPress={solveHomework}
          disabled={!image || loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="white"/> : <Text style={styles.solveBtnText}>Solve with Homie AI</Text>}
        </TouchableOpacity>

        {answer !== '' && (
          <View style={styles.answerCard}>
            <Text style={styles.answerLabel}>HOMIE'S ANSWER</Text>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        )}

        <View style={{ height: 40 }}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 24, color: Colors.text },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  content: { alignItems: 'center', padding: 20, width: '100%', maxWidth: responsive.maxWidth, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: Colors.text, marginTop: 12, textAlign: 'center' },
  sub: { fontSize: 14, color: Colors.muted, marginTop: 6, marginBottom: 20, textAlign: 'center' },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg3,
    marginBottom: 16,
  },
  emptyImage: {
    width: '100%',
    height: 200,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
  },
  emptyText: { fontSize: 14, color: Colors.muted },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 14 },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: Colors.bg2,
  },
  photoBtnText: { fontSize: 14, fontWeight: '700' },
  solveBtn: {
    width: '100%',
    height: 54,
    backgroundColor: Colors.purple,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  solveBtnDisabled: { backgroundColor: Colors.bg3 },
  solveBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  answerCard: {
    width: '100%',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
  },
  answerLabel: { fontSize: 10, fontWeight: '700', color: Colors.purpleL, letterSpacing: 2, marginBottom: 10 },
  answerText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
});
