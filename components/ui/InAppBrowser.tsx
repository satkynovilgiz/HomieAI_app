import React, { useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

export default function InAppBrowser({ url, title, onClose }: Props) {
  const [failed, setFailed] = useState(false);
  const webRef = useRef<WebView>(null);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => webRef.current?.goBack()} style={styles.iconBtn}>
            <Text style={styles.iconText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>
        </View>
        {failed ? (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>couldn't load this page here</Text>
            <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.fallbackBtn}>
              <Text style={styles.fallbackBtnText}>Open in browser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webRef}
            source={{ uri: url }}
            style={styles.webview}
            onError={() => setFailed(true)}
            onHttpError={() => setFailed(true)}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, paddingTop: 48, backgroundColor: Colors.bg2, borderBottomWidth: 1, borderBottomColor: Colors.border },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  title: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '700' },
  webview: { flex: 1 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  fallbackText: { color: Colors.muted, fontSize: 14 },
  fallbackBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.purple, borderRadius: Radius.md },
  fallbackBtnText: { color: Colors.white, fontWeight: '700' },
});
