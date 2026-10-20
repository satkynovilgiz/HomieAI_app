# Homie — AI Study Buddy

Free AI study app built with Expo React Native. Chat with an AI tutor, take structured lessons, earn XP, maintain streaks, and challenge friends.

---

## Stack

- **Expo SDK 54** / **Expo Router 6**
- **React Native 0.81**
- **Redux Toolkit** — state management
- **react-native-svg** — all icons and mascot
- **Gemini API** — AI chat and features

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npx expo start --clear

# 3. Scan QR with Expo Go on your iPhone
```

Always use `--clear` to avoid stale cache issues.

---

## Project Structure

```
homie/
├── app/
│   ├── _layout.tsx           # Root stack (registers every route below)
│   ├── index.tsx              # Splash screen, session check + redirect
│   ├── (tabs)/               # Bottom tab screens
│   │   ├── _layout.tsx       # Tab bar config (SVG icons)
│   │   ├── index.tsx         # Home dashboard
│   │   ├── chat.tsx          # AI chat
│   │   ├── learn.tsx         # Lessons tab
│   │   ├── friends.tsx       # Friends + challenges
│   │   ├── games.tsx         # Redirects to /games/index
│   │   ├── more.tsx          # All other features menu
│   │   └── profile.tsx       # User profile
│   ├── auth/
│   │   ├── login.tsx         # Login + Google sign-in
│   │   └── signup.tsx        # Create account + avatar
│   ├── onboarding/index.tsx  # 5-slide intro (shows once)
│   ├── chat/index.tsx        # Full-screen AI chat (pushed from More)
│   ├── voice/index.tsx       # Voice mode
│   ├── games/index.tsx       # Wordle + Quiz games
│   ├── lessons/
│   │   ├── index.tsx         # Unit list
│   │   └── play.tsx          # Lesson session (hearts/XP)
│   ├── messages/
│   │   ├── index.tsx         # Conversations list
│   │   └── conversation.tsx  # Chat with a friend
│   ├── pomodoro/index.tsx    # Focus timer
│   ├── planner/index.tsx     # Weekly study planner
│   ├── videos/index.tsx      # YouTube video library
│   ├── detector/index.tsx    # AI text detector + humanizer
│   ├── essay/index.tsx       # AI essay writer
│   ├── scanner/index.tsx     # Homework photo scanner
│   ├── streak/index.tsx      # Streak calendar + milestones
│   ├── achievements/index.tsx
│   ├── shop/index.tsx        # Gems shop
│   ├── leaderboard/index.tsx
│   ├── notifications/index.tsx
│   ├── settings/index.tsx
│   ├── history/index.tsx
│   ├── friends/add.tsx
│   └── about/index.tsx
│
├── components/
│   ├── mascot/HomieBot.tsx   # SVG mascot, 10 moods, no animation
│   ├── ui/                   # Button, Card, Input, XPBar, HeartsBar, GemsCounter
│   ├── streak/               # StreakBanner, StreakFreeze, StreakCelebration
│   ├── achievements/         # AchievementCard, AchievementPopup
│   ├── messages/             # ConversationRow, MessageBubble
│   ├── friends/              # FriendCard
│   ├── lessons/              # UnitCard, LessonNode
│   ├── shop/                 # ShopItem
│   └── features/             # ChallengeCard
│
├── store/
│   ├── index.ts              # Redux store (13 slices)
│   └── slices/               # user, chat, streak, hearts, gems,
│                             # achievements, messages, friends,
│                             # lessons, shop, challenges,
│                             # notifications, theme
│
├── hooks/                    # useStreak, useHearts, useGems,
│                             # useAchievements, useMessages,
│                             # useFriends, useShop,
│                             # useChallenges, useNotifications
│
├── lib/
│   ├── gemini.ts             # Gemini API calls + system prompt
│   ├── auth.ts               # Local auth with AsyncStorage
│   └── utils.ts              # parseQuiz, detectAI, formatTime
│
├── constants/
│   ├── theme.ts              # Colors, Radius, API keys
│   ├── subjects.ts           # SUBJECTS, VIDEO_DB, QUIZ_BANK, AVATARS
│   └── lessons/              # mathLessons, codingLessons, scienceLessons
│
├── app.json
├── babel.config.js
├── metro.config.js
└── tsconfig.json
```

---

## Tab Bar

| Tab | Screen | What's inside |
|-----|--------|---------------|
| Home | `(tabs)/index.tsx` | Dashboard, XP bar, streak, quick actions |
| Chat | `(tabs)/chat.tsx` | AI chat with Gemini, quiz cards, image upload |
| Learn | `(tabs)/learn.tsx` | Lesson units — Math, Coding, Science |
| Friends | `(tabs)/friends.tsx` | Friends list, XP battles, rankings |
| More | `(tabs)/more.tsx` | Voice, Pomodoro, Messages, Planner, Games, Videos, and more |
| Profile | `(tabs)/profile.tsx` | Stats, avatar picker, edit name, sign out |

---

## Critical Config

### babel.config.js

Do NOT include `babel-plugin-module-resolver` — it is not installed and will crash the bundler with "Cannot find module" before any page loads.

```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### metro.config.js

This handles the `@/` import alias instead of babel:

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);
config.resolver = {
  ...config.resolver,
  alias: { '@': path.resolve(__dirname) },
};
module.exports = config;
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## API Keys

**Gemini** — set in `constants/theme.ts`:
```ts
export const GEMINI_API_KEY = 'your-key-here';
export const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
```

**YouTube** — set in `app/videos/index.tsx`:
```ts
const YOUTUBE_API_KEY = 'your-key-here';
```
Get a key at [console.cloud.google.com](https://console.cloud.google.com) → Enable YouTube Data API v3.

---

## Auth

Auth is fully local using AsyncStorage — no backend or server needed.

Users are stored on-device. The Google Sign-In button on the login screen creates a demo local account. To enable real Google OAuth, configure Firebase + `expo-auth-session` and add your `NEXT_PUBLIC_FIREBASE_*` values to `app.json`.

---

## Mascot

`components/mascot/HomieBot.tsx` — pure SVG, no animations, works on all platforms.

```tsx
<HomieBot mood="happy" size={80} />
```

Moods: `happy` `sad` `thinking` `shocked` `celebrating` `wink` `angry` `love` `cool` `sleepy`

---

## Features

| Feature | Description |
|---------|-------------|
| AI Chat | Gemini-powered chat with subject selector, quiz cards, image upload |
| Voice Mode | Speak to Homie, get spoken replies |
| Lessons | Duolingo-style path — Math, Coding, Science units with hearts and XP |
| Streak | Daily check-in, freeze protection, weekly calendar, milestones |
| Hearts | Lose hearts on wrong answers, refill with gems |
| Gems | Earn gems, spend in shop on powerups and cosmetics |
| Achievements | 17 unlockable badges with XP rewards |
| Messages | Friend-to-friend chat with streak/XP sharing |
| Challenges | XP race and quiz battles between friends |
| Pomodoro | 25 min focus / 5 min break timer |
| Planner | Weekly grid schedule with AI plan generator |
| AI Detector | Detect AI-written text + humanizer |
| Essay Writer | Generate essays by type and length |
| Scanner | Upload homework photo, Gemini solves it step by step |
| Videos | YouTube search by subject (live API) |
| Shop | Buy streak freezes, heart refills, XP boosts |
| Leaderboard | Top students ranked by XP |

---

## Building for App Store / Play Store

```bash
npm install -g eas-cli
eas login
eas build:configure

# iOS (requires Apple Developer account - $99/yr)
eas build --platform ios

# Android (requires Google Play account - $25 one-time)
eas build --platform android
```

---

## Built by

**Ilgiz Satkynov** — 18 y/o 
