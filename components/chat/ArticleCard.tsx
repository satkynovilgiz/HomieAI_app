import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { ArticleResult } from '../../lib/searchService';
import InAppBrowser from '../ui/InAppBrowser';

interface Props {
  article: ArticleResult;
  onSave: () => void;
  isSaved: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  youtube: Colors.red,
  google: Colors.blue,
  wikipedia: Colors.green,
};

function sourceColor(source: string): string {
  return SOURCE_COLORS[source.toLowerCase()] || Colors.muted;
}

export default function ArticleCard({ article, onSave, isSaved }: Props) {
  const [showBrowser, setShowBrowser] = useState(false);
  const color = sourceColor(article.source);

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <View style={[styles.badge, { backgroundColor: color + '26' }]}>
          <Text style={[styles.badgeText, { color }]}>{article.source}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.desc} numberOfLines={3}>{article.description}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => article.url && setShowBrowser(true)} style={styles.readBtn}>
            <Text style={styles.readBtnText}>Read Article →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave} style={[styles.saveBtn, isSaved && styles.saveBtnActive]}>
            <Text style={[styles.saveText, isSaved && styles.saveTextActive]}>{isSaved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showBrowser && <InAppBrowser url={article.url} title={article.title} onClose={() => setShowBrowser(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: 14, marginBottom: 8, overflow: 'hidden' },
  body: { padding: 12, gap: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 50 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  title: { fontSize: 14, fontWeight: '800', color: Colors.text, lineHeight: 19 },
  desc: { fontSize: 12, color: Colors.muted, lineHeight: 17 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  readBtn: { paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Colors.purple, borderRadius: 10 },
  readBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: Colors.purpleL },
  saveBtnActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  saveText: { fontSize: 12, fontWeight: '700', color: Colors.purpleL },
  saveTextActive: { color: Colors.white },
});
