import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../store';
import { useStreakSync } from '../hooks/useStreakSync';
import { useHeartsGemsSync } from '../hooks/useHeartsGemsSync';
import { useUserStatsSync } from '../hooks/useUserStatsSync';
import { useAchievementsSync } from '../hooks/useAchievementsSync';
import { useAchievementAutoUnlock } from '../hooks/useAchievementAutoUnlock';
import { loadSessions, loadChatHistoryFromStorage } from '../store/slices/chatHistorySlice';
import { setLanguage } from '../store/slices/languageSlice';
import { setUser, setAuthChecked } from '../store/slices/userSlice';
import { getSession } from '../lib/authService';
import { Language } from '../constants/translations';

function StreakSync() {
  useStreakSync();
  return null;
}

function HeartsGemsSync() {
  useHeartsGemsSync();
  return null;
}

function UserStatsSync() {
  useUserStatsSync();
  return null;
}

function AchievementsSync() {
  useAchievementsSync();
  useAchievementAutoUnlock();
  return null;
}

// Rehydrates the logged-in session on every app boot, regardless of which
// route is entered first. Without this, a direct/deep navigation into a
// protected (tabs) screen (refresh, deep link, restored session) sees
// Redux's user as null even though a valid Firebase session exists in
// storage -- the splash screen (app/index.tsx) only runs this same check
// when the app boots at "/", not when it boots straight into a nested route.
function AuthSync() {
  const dispatch = useDispatch();
  useEffect(() => {
    getSession().then(session => {
      if (session) dispatch(setUser(session));
      dispatch(setAuthChecked(true));
    });
  }, []);
  return null;
}

// Loaded here (not inside the chat screen) so chat sessions are available to
// any screen — the History screen and the chat sidebar both read them, and
// either can be the first screen opened in a session.
function ChatHistorySync() {
  const dispatch = useDispatch();
  useEffect(() => {
    loadChatHistoryFromStorage().then(data => dispatch(loadSessions(data)));
  }, []);
  return null;
}

function LanguageSync() {
  const dispatch = useDispatch();
  useEffect(() => {
    AsyncStorage.getItem('hm_language').then(saved => {
      if (saved) dispatch(setLanguage(saved as Language));
    });
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AuthSync />
        <StreakSync />
        <HeartsGemsSync />
        <UserStatsSync />
        <AchievementsSync />
        <ChatHistorySync />
        <LanguageSync />
        <StatusBar style="light" backgroundColor="#07070f" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07070f' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="auth/language" />
          <Stack.Screen name="auth/forgot" />
          <Stack.Screen name="auth/verify" />
          <Stack.Screen name="auth/welcome" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="games/index" />
          <Stack.Screen name="games/wordscramble" />
          <Stack.Screen name="games/mathlightning" />
          <Stack.Screen name="games/trueorfalse" />
          <Stack.Screen name="games/fillinblank" />
          <Stack.Screen name="games/flashcardflip" />
          <Stack.Screen name="games/speedquiz" />
          <Stack.Screen name="games/matchingpairs" />
          <Stack.Screen name="games/definitiondetective" />
          <Stack.Screen name="games/buildequation" />
          <Stack.Screen name="games/trivia" />
          <Stack.Screen name="pomodoro/index" />
          <Stack.Screen name="detector/index" />
          <Stack.Screen name="leaderboard/index" />
          <Stack.Screen name="planner/index" />
          <Stack.Screen name="essay/index" />
          <Stack.Screen name="scanner/index" />
          <Stack.Screen name="videos/index" />
          <Stack.Screen name="recorder/index" />
          <Stack.Screen name="recorder/notes" />
          <Stack.Screen name="history/index" />
          <Stack.Screen name="about/index" />
          <Stack.Screen name="messages/index" />
          <Stack.Screen name="messages/conversation" />
          <Stack.Screen name="invite/index" />
          <Stack.Screen name="focus/index" />
          <Stack.Screen name="lessons/index" />
          <Stack.Screen name="lessons/play" options={{ gestureEnabled: false }} />
          <Stack.Screen name="streak/index" />
          <Stack.Screen name="achievements/index" />
          <Stack.Screen name="shop/index" />
          <Stack.Screen name="notifications/index" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/change-password" />
          <Stack.Screen name="settings/change-email" />
          <Stack.Screen name="friends/add" />
          <Stack.Screen name="legal/privacy" />
          <Stack.Screen name="legal/terms" />
        </Stack>
      </Provider>
    </GestureHandlerRootView>
  );
}
