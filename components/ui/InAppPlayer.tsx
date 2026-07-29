import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  videoId: string;
  onClose: () => void;
}

export default function InAppPlayer({ videoId, onClose }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Playing on YouTube</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        {failed ? (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>couldn't load this video here</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
              style={styles.fallbackBtn}
            >
              <Text style={styles.fallbackBtnText}>Open in YouTube</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` }}
            style={styles.webview}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            onError={() => setFailed(true)}
            onHttpError={() => setFailed(true)}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingTop: 48, backgroundColor: '#000000' },
  title: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  webview: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  fallbackText: { color: Colors.muted, fontSize: 14 },
  fallbackBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.purple, borderRadius: Radius.md },
  fallbackBtnText: { color: Colors.white, fontWeight: '700' },
});
