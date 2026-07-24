import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const C = {
  bg2: '#0d0b22',
  border: 'rgba(167,139,250,0.12)',
  purpleL: '#a78bfa',
  muted: '#9090c0',
};

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Circle cx="8" cy="9.5" r="1" fill={color}/>
      <Circle cx="12" cy="9.5" r="1" fill={color}/>
      <Circle cx="16" cy="9.5" r="1" fill={color}/>
    </Svg>
  );
}

function LearnIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M2 7L12 2L22 7L12 12L2 7Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M6 9.5V16.5C6 16.5 8.5 19 12 19C15.5 19 18 16.5 18 16.5V9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Line x1="22" y1="7" x2="22" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

function FriendsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M3 21V19C3 16.8 5 15 7.5 15H10.5C13 15 15 16.8 15 19V21" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Path d="M16 3.5C17.7 3.5 19 4.8 19 6.5C19 8.2 17.7 9.5 16 9.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Path d="M21 21V19C21 16.8 19.5 15.2 17.5 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

function MoreIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="2" rx="1" fill={color}/>
      <Rect x="3" y="11" width="18" height="2" rx="1" fill={color}/>
      <Rect x="3" y="17" width="12" height="2" rx="1" fill={color}/>
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M4 21C4 18 7.6 15.5 12 15.5C16.4 15.5 20 18 20 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.bg2,
          borderTopColor: C.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: C.purpleL,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Home',    tabBarIcon: ({ color }) => <HomeIcon    color={color} /> }} />
      <Tabs.Screen name="chat"    options={{ title: 'Chat',    tabBarIcon: ({ color }) => <ChatIcon    color={color} /> }} />
      <Tabs.Screen name="learn"   options={{ title: 'Learn',   tabBarIcon: ({ color }) => <LearnIcon   color={color} /> }} />
      <Tabs.Screen name="friends" options={{ title: 'Friends', tabBarIcon: ({ color }) => <FriendsIcon color={color} /> }} />
      <Tabs.Screen name="more"    options={{ title: 'More',    tabBarIcon: ({ color }) => <MoreIcon    color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }} />
      <Tabs.Screen name="games"   options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
