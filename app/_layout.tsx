import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from '../store';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar style="light" backgroundColor="#07070f" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#07070f' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/index" />
          <Stack.Screen name="voice/index" />
          <Stack.Screen name="games/index" />
          <Stack.Screen name="pomodoro/index" />
          <Stack.Screen name="detector/index" />
          <Stack.Screen name="leaderboard/index" />
          <Stack.Screen name="planner/index" />
          <Stack.Screen name="essay/index" />
          <Stack.Screen name="scanner/index" />
          <Stack.Screen name="videos/index" />
          <Stack.Screen name="history/index" />
          <Stack.Screen name="profile/index" />
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
