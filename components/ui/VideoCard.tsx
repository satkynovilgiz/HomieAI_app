
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props { video: { id: string; title: string; ch: string }; onPress: () => void; }

export default function VideoCard({ video, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.85}>
      <View style={styles.thumb}>
        <Image source={{ uri: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` }} style={styles.img} resizeMode="cover"/>
        <View style={styles.playBtn}>
          <Text style={styles.play}>▶</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.badge}>📺 Watch this bro!</Text>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.ch}>{video.ch}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg3, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginVertical: 6 },
  thumb: { position: 'relative' },
  img: { width: '100%', height: 160 },
  playBtn: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }], width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(124,58,237,0.9)', alignItems: 'center', justifyContent: 'center' },
  play: { color: 'white', fontSize: 18 },
  info: { padding: 12 },
  badge: { fontSize: 11, color: Colors.purpleL, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  ch: { fontSize: 12, color: Colors.muted },
});
