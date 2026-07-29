import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
  FlatList, Dimensions, Alert, Modal, TextInput,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ChatSession, deleteSession, updateSessionTitle } from '../../store/slices/chatHistorySlice';
import { Colors, Radius } from '../../constants/theme';
import { PlusIcon, CloseIcon } from '../icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.8;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Math:      { bg: 'rgba(124,58,237,0.2)', text: '#a78bfa' },
  Science:   { bg: 'rgba(16,185,129,0.2)', text: '#10b981' },
  Coding:    { bg: 'rgba(59,130,246,0.2)', text: '#3b82f6' },
  History:   { bg: 'rgba(249,115,22,0.2)', text: '#f97316' },
  English:   { bg: 'rgba(253,164,175,0.2)', text: '#fda4af' },
  Physics:   { bg: 'rgba(129,140,248,0.2)', text: '#818cf8' },
  Chemistry: { bg: 'rgba(74,222,128,0.2)', text: '#4ade80' },
  Biology:   { bg: 'rgba(52,211,153,0.2)', text: '#34d399' },
  General:   { bg: 'rgba(144,144,192,0.2)', text: '#9090c0' },
};

export function getSubjectColor(subject: string) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS.General;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function groupLabel(iso: string): string {
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Last 7 Days';
  if (diffDays <= 30) return 'Last 30 Days';
  return 'Older';
}

export const GROUP_ORDER = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Older'];

function confirmDelete(session: ChatSession, onConfirm: () => void) {
  Alert.alert('Delete chat?', `"${session.title}" will be permanently deleted.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

function ChatItem({
  session, isActive, onPress, onRename, onDelete,
}: {
  session: ChatSession; isActive: boolean;
  onPress: () => void; onRename: () => void; onDelete: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const color = getSubjectColor(session.subject);

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => { swipeRef.current?.close(); confirmDelete(session, onDelete); }}
        >
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity
        style={[styles.chatItem, isActive && styles.chatItemActive]}
        onPress={onPress}
        onLongPress={() => Alert.alert(session.title, undefined, [
          { text: 'Rename', onPress: onRename },
          { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(session, onDelete) },
          { text: 'Cancel', style: 'cancel' },
        ])}
        activeOpacity={0.8}
      >
        <View style={styles.chatItemTopRow}>
          <View style={[styles.subjectPill, { backgroundColor: color.bg }]}>
            <Text style={[styles.subjectPillText, { color: color.text }]}>{session.subject}</Text>
          </View>
          <Text style={styles.chatItemTime}>{formatTime(session.updatedAt)}</Text>
        </View>
        <Text style={styles.chatItemTitle} numberOfLines={1}>{session.title}</Text>
        <View style={styles.chatItemBottomRow}>
          <Text style={styles.chatItemPreview} numberOfLines={1}>{session.preview || 'No messages yet'}</Text>
          <Text style={styles.chatItemCount}>{session.messageCount} msgs</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function ChatSidebar({ isOpen, onClose, onNewChat, onSelectChat }: Props) {
  const dispatch = useDispatch();
  const sessions = useSelector((s: RootState) => s.chatHistory.sessions);
  const activeChatId = useSelector((s: RootState) => s.chatHistory.activeChatId);

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null);
  const [renameText, setRenameText] = useState('');

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(overlayOpacity, {
      toValue: isOpen ? 0.6 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const groups = useMemo(() => {
    // A "New Chat" that never got a message (created, then abandoned by
    // switching subjects or picking another chat) would otherwise sit here
    // forever — hide it once it's no longer the one on screen.
    const visible = sessions.filter(s => s.messageCount > 0 || s.id === activeChatId);
    const sorted = [...visible].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const byLabel: Record<string, ChatSession[]> = {};
    sorted.forEach(s => {
      const label = groupLabel(s.updatedAt);
      (byLabel[label] ||= []).push(s);
    });
    return GROUP_ORDER.filter(label => byLabel[label]?.length).map(label => ({ label, items: byLabel[label] }));
  }, [sessions, activeChatId]);

  const openRename = (session: ChatSession) => {
    setRenameTarget(session);
    setRenameText(session.title);
  };

  const submitRename = () => {
    if (renameTarget && renameText.trim()) {
      dispatch(updateSessionTitle({ chatId: renameTarget.id, title: renameText }));
    }
    setRenameTarget(null);
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View style={[styles.sidebar, { width: SIDEBAR_WIDTH, transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Homie</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <CloseIcon color={Colors.text} size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.85}>
          <PlusIcon color={Colors.white} size={18} />
          <Text style={styles.newChatBtnText}>New Chat</Text>
        </TouchableOpacity>

        <FlatList
          data={groups}
          keyExtractor={g => g.label}
          renderItem={({ item: group }) => (
            <View>
              <Text style={styles.groupLabel}>{group.label.toUpperCase()}</Text>
              {group.items.map(session => (
                <ChatItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeChatId}
                  onPress={() => onSelectChat(session.id)}
                  onRename={() => openRename(session)}
                  onDelete={() => dispatch(deleteSession(session.id))}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No chats yet</Text>
              <Text style={styles.emptyStateSub}>Start a new chat to see it here</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <Modal visible={!!renameTarget} transparent animationType="fade" onRequestClose={() => setRenameTarget(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Rename Chat</Text>
              <TextInput
                style={styles.modalInput}
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
                maxLength={40}
                placeholderTextColor={Colors.muted}
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setRenameTarget(null)}>
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={submitRename}>
                  <Text style={styles.modalBtnSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>

      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', zIndex: 1000, elevation: 1000 },
  overlay: { flex: 1, backgroundColor: '#000' },
  sidebar: {
    height: '100%',
    backgroundColor: '#0a0919',
    borderRightWidth: 1,
    borderRightColor: '#2a2060',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#0d0b22',
    borderBottomWidth: 1, borderBottomColor: '#2a2060',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  newChatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, margin: 14,
  },
  newChatBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 14, paddingBottom: 24 },
  groupLabel: { fontSize: 10, color: Colors.muted, fontWeight: '700', letterSpacing: 0.5, marginTop: 10, marginBottom: 8 },
  chatItem: {
    backgroundColor: '#12102a', borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#2a2060',
  },
  chatItemActive: { borderColor: '#7c3aed' },
  chatItemTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  subjectPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  subjectPillText: { fontSize: 10, fontWeight: '700' },
  chatItemTime: { fontSize: 10, color: Colors.muted },
  chatItemTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  chatItemBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  chatItemPreview: { flex: 1, fontSize: 12, color: Colors.muted },
  chatItemCount: { fontSize: 11, color: Colors.muted },
  deleteAction: {
    backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center',
    width: 84, borderRadius: 12, marginBottom: 8,
  },
  deleteActionText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyStateText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  emptyStateSub: { fontSize: 12, color: Colors.muted, marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', backgroundColor: '#12102a', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2a2060' },
  modalTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  modalInput: {
    backgroundColor: '#0d0b22', borderWidth: 1, borderColor: '#2a2060', borderRadius: 10,
    color: Colors.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalBtnCancel: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#1a1740' },
  modalBtnCancelText: { color: Colors.text2, fontWeight: '700', fontSize: 13 },
  modalBtnSave: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#7c3aed' },
  modalBtnSaveText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
});
