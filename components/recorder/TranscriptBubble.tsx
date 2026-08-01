import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

export interface TranscriptLine {
  text: string;
  bookmarkLabel?: string;
}

interface Props {
  lines: TranscriptLine[];
  // Text currently being spoken, not yet finalized by the recognizer.
  partialText?: string;
}

export default function TranscriptBubble({ lines, partialText }: Props) {
  if (lines.length === 0 && !partialText) {
    return <Text style={styles.placeholder}>Transcript will appear here...</Text>;
  }

  return (
    <View style={styles.wrap}>
      {lines.map((line, i) => (
        <View key={i}>
          {!!line.bookmarkLabel && (
            <View style={styles.bookmarkRow}>
              <View style={styles.bookmarkLine} />
              <Text style={styles.bookmarkLabel}>{line.bookmarkLabel}</Text>
            </View>
          )}
          <Text style={styles.confirmed}>{line.text}</Text>
        </View>
      ))}
      {!!partialText && <Text style={styles.partial}>{partialText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  placeholder: { fontSize: 14, color: Colors.muted, fontStyle: 'italic' },
  confirmed: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  partial: { fontSize: 14, color: Colors.muted, lineHeight: 22, fontStyle: 'italic' },
  bookmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  bookmarkLine: { flex: 1, height: 2, backgroundColor: Colors.orange, borderRadius: 1 },
  bookmarkLabel: { fontSize: 11, fontWeight: '700', color: Colors.orange },
});
