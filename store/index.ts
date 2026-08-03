import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';
import streakReducer from './slices/streakSlice';
import heartsReducer from './slices/heartsSlice';
import gemsReducer from './slices/gemsSlice';
import achievementsReducer from './slices/achievementsSlice';
import messagesReducer from './slices/messagesSlice';
import friendsReducer from './slices/friendsSlice';
import lessonsReducer from './slices/lessonsSlice';
import shopReducer from './slices/shopSlice';
import challengesReducer from './slices/challengesSlice';
import notificationsReducer from './slices/notificationsSlice';
import videosReducer from './slices/videosSlice';
import chatHistoryReducer from './slices/chatHistorySlice';
import recorderReducer from './slices/recorderSlice';
import languageReducer from './slices/languageSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    chatHistory: chatHistoryReducer,
    recorder: recorderReducer,
    theme: themeReducer,
    streak: streakReducer,
    hearts: heartsReducer,
    gems: gemsReducer,
    achievements: achievementsReducer,
    messages: messagesReducer,
    friends: friendsReducer,
    lessons: lessonsReducer,
    shop: shopReducer,
    challenges: challengesReducer,
    notifications: notificationsReducer,
    videos: videosReducer,
    language: languageReducer,
  },
  middleware: g => g({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
