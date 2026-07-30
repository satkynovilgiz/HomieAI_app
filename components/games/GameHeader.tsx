import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  onBack: () => void;
  onPause?: () => void;
  score?: number;
  hearts?: number;
  current?: number;
  total?: number;
  xpEarned?: number;
}

export default function GameHeader({ onBack, onPause, score, hearts, current, total, xpEarned }: Props) {
  const progress = total ? Math.min(1, ((current ?? 0) + 1) / total) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.statsRow}>
          {typeof hearts === 'number' && <Text style={styles.stat}>Hearts {hearts}</Text>}
          {typeof score === 'number' && <Text style={styles.stat}>Score {score}</Text>}
          {typeof xpEarned === 'number' && <Text style={[styles.stat, styles.xpStat]}>+{xpEarned} XP</Text>}
        </View>
        {onPause ? (
          <TouchableOpacity onPress={onPause} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.pauseIcon}>||</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
      {typeof total === 'number' && (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Question {Math.min((current ?? 0) + 1, total)} of {total}</Text>
        </View>
      )}
    </View>
  );
}

export function PauseOverlay({ onResume, onQuit }: { onResume: () => void; onQuit: () => void }) {
  return (
    <View style={overlayStyles.overlay}>
      <View style={overlayStyles.card}>
        <Text style={overlayStyles.title}>Paused</Text>
        <TouchableOpacity onPress={onResume} style={overlayStyles.resumeBtn}>
          <Text style={overlayStyles.resumeText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onQuit} style={overlayStyles.quitBtn}>
          <Text style={overlayStyles.quitText}>Quit Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: Colors.text },
  pauseIcon: { fontSize: 15, color: Colors.text, fontWeight: '900', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: 14 },
  stat: { fontSize: 13, fontWeight: '700', color: Colors.text2 },
  xpStat: { color: Colors.green },
  progressWrap: { gap: 4 },
  progressTrack: { height: 6, backgroundColor: Colors.bg3, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.purple, borderRadius: 3 },
  progressLabel: { fontSize: 11, color: Colors.muted },
});

const overlayStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,7,15,0.9)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  card: { width: '80%', backgroundColor: Colors.bg3, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 24, alignItems: 'center', gap: 14 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.text },
  resumeBtn: { width: '100%', paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.purple, alignItems: 'center' },
  resumeText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  quitBtn: { width: '100%', paddingVertical: 13, borderRadius: Radius.md, backgroundColor: Colors.bg2, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  quitText: { color: Colors.muted, fontWeight: '700', fontSize: 14 },
});
