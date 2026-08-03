import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from '../store';
import { useStreakSync } from '../hooks/useStreakSync';
import { loadSessions, loadChatHistoryFromStorage } from '../store/slices/chatHistorySlice';

function StreakSync() {
  useStreakSync();
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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StreakSync />
        <ChatHistorySync />
        <StatusBar style="light" backgroundColor="#07070f" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07070f' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
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
          <Stack.Screen name="lessons/index" />
          <Stack.Screen name="lessons/play" options={{ gestureEnabled: false }} />
          <Stack.Screen name="streak/index" />
          <Stack.Screen name="achievements/index" />
          <Stack.Screen name="shop/index" />
          <Stack.Screen name="notifications/index" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="friends/add" />
        </Stack>
      </Provider>
    </GestureHandlerRootView>
  );
}
