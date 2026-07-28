import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../constants/theme';

interface Props {
  videoId: string;
  onClose: () => void;
}

export default function InAppPlayer({ videoId, onClose }: Props) {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Playing on YouTube</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1` }}
          style={styles.webview}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
        />
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
});
