import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { VideoResult } from '../../lib/searchService';
import InAppPlayer from '../ui/InAppPlayer';

interface Props {
  video: VideoResult;
  onSave: () => void;
  isSaved: boolean;
}

export default function VideoCard({ video, onSave, isSaved }: Props) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setShowPlayer(true)} activeOpacity={0.85}>
        <Image source={{ uri: video.thumbnail }} style={styles.thumb} resizeMode="cover" />
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>VIDEO · YouTube</Text>
          </View>
          <TouchableOpacity onPress={onSave} style={[styles.saveBtn, isSaved && styles.saveBtnActive]}>
            <Text style={[styles.saveText, isSaved && styles.saveTextActive]}>{isSaved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.channel}>{video.channelTitle}</Text>
        {!!video.description && <Text style={styles.desc} numberOfLines={2}>{video.description}</Text>}
        <TouchableOpacity onPress={() => setShowPlayer(true)} style={styles.playBtn}>
          <Text style={styles.playBtnText}>Play inside app</Text>
        </TouchableOpacity>
      </View>
      {showPlayer && <InAppPlayer videoId={video.videoId} onClose={() => setShowPlayer(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: 14, marginBottom: 8, overflow: 'hidden' },
  thumb: { width: '100%', height: 160, backgroundColor: Colors.bg3 },
  body: { padding: 12, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50, backgroundColor: 'rgba(239,68,68,0.15)' },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.red },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50, borderWidth: 1, borderColor: Colors.purpleL },
  saveBtnActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  saveText: { fontSize: 11, fontWeight: '700', color: Colors.purpleL },
  saveTextActive: { color: Colors.white },
  title: { fontSize: 14, fontWeight: '800', color: Colors.text, lineHeight: 19 },
  channel: { fontSize: 12, color: Colors.muted },
  desc: { fontSize: 12, color: Colors.muted, lineHeight: 17 },
  playBtn: { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Colors.purple, borderRadius: 10 },
  playBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});
