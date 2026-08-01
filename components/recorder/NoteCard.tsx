import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props {
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function NoteCard({ title, count, defaultExpanded = true, children }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.header} activeOpacity={0.7}>
        <Text style={styles.title}>{title}{typeof count === 'number' ? ` (${count})` : ''}</Text>
        <Text style={styles.arrow}>{expanded ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#12102a', borderWidth: 1, borderColor: 'rgba(167,139,250,0.12)', borderRadius: 14, marginBottom: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 15, fontWeight: '800', color: Colors.text },
  arrow: { fontSize: 13, color: Colors.muted },
  body: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
});
