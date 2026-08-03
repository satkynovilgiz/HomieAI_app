import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAccount as deleteAccountRemote } from '../lib/authService';
import { clearUser } from '../store/slices/userSlice';
import { clearChat } from '../store/slices/chatSlice';
import { clearStreak } from '../store/slices/streakSlice';
import { clearHearts } from '../store/slices/heartsSlice';
import { clearGems } from '../store/slices/gemsSlice';
import { clearAchievements } from '../store/slices/achievementsSlice';
import { clearVideos } from '../store/slices/videosSlice';
import { clearChatHistory } from '../store/slices/chatHistorySlice';

const KEYS_TO_CLEAR = [
  'hm_session',
  'hm_user_cache',
  'hm_chat_history',
  'hm_saved_items',
  'hm_saved_videos',
  'hm_study_plan',
  'hm_lectures',
  'hm_verify_code',
  'hm_welcome_shown',
  'hm_onboarding_done',
];

// Shared by app/(tabs)/profile.tsx and app/settings/index.tsx so the delete
// flow (and every Redux/AsyncStorage key it has to know about) lives in one
// place instead of two copies drifting apart.
export function useDeleteAccount() {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const runDelete = async () => {
    setDeleting(true);
    try {
      const { err } = await deleteAccountRemote();
      if (err) {
        setDeleting(false);
        Alert.alert('Error', err, [{ text: 'OK' }]);
        return;
      }
      await AsyncStorage.multiRemove(KEYS_TO_CLEAR);
      dispatch(clearUser());
      dispatch(clearChat());
      dispatch(clearStreak());
      dispatch(clearHearts());
      dispatch(clearGems());
      dispatch(clearAchievements());
      dispatch(clearVideos());
      dispatch(clearChatHistory());
      setDeleting(false);
      setModalVisible(false);
      router.replace('/onboarding');
    } catch {
      setDeleting(false);
      Alert.alert('Error', 'Could not delete account. Please try again.', [{ text: 'OK' }]);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Last chance',
      'Are you absolutely sure? This cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        { text: 'Delete forever', style: 'destructive', onPress: runDelete },
      ]
    );
  };

  return {
    modalVisible,
    openModal: () => setModalVisible(true),
    closeModal: () => setModalVisible(false),
    confirmDelete,
    deleting,
  };
}
