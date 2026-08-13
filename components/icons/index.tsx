import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

interface IconProps { color?: string; size?: number; }
const DEFAULT_COLOR = '#9090c0';

export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <Path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <Path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
      <Path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </Svg>
  );
}

export function BookIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5C4 3.9 4.9 3 6 3H20V19H6C4.9 19 4 19.9 4 21V5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M4 21C4 19.9 4.9 19 6 19H20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function VideoIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M17 10L21 7V17L17 14" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function GameIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9H18C20 9 21.5 10.8 21.2 12.8L20.6 16.5C20.4 17.9 19.2 19 17.8 19C17 19 16.3 18.6 15.9 17.9L14.8 16C14.4 15.4 13.8 15 13 15H11C10.2 15 9.6 15.4 9.2 16L8.1 17.9C7.7 18.6 7 19 6.2 19C4.8 19 3.6 17.9 3.4 16.5L2.8 12.8C2.5 10.8 4 9 6 9Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Line x1="7.5" y1="11" x2="7.5" y2="14" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <Line x1="6" y1="12.5" x2="9" y2="12.5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <Circle cx="16" cy="11.5" r="0.9" fill={color}/>
      <Circle cx="18" cy="13.5" r="0.9" fill={color}/>
    </Svg>
  );
}

export function TimerIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="8" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M12 9V13L15 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <Line x1="10" y1="2" x2="14" y2="2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="12" y1="2" x2="12" y2="4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function DetectorIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="1.8" fill="none"/>
      <Line x1="15.5" y1="15.5" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Path d="M8 10.5L9.8 12.3L13.2 8.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function ShopIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8L5.5 3H18.5L20 8" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M4 8H20V19C20 20.1 19.1 21 18 21H6C4.9 21 4 20.1 4 19V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M9 11C9 12.7 10.3 14 12 14C13.7 14 15 12.7 15 11" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

export function TrophyIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4H17V10C17 12.8 14.8 15 12 15C9.2 15 7 12.8 7 10V4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M7 5H4V7C4 8.7 5.3 10 7 10" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <Path d="M17 5H20V7C20 8.7 18.7 10 17 10" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <Line x1="12" y1="15" x2="12" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="8.5" y1="21" x2="15.5" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="12" y1="19" x2="12" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function CalendarIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="5" width="17" height="16" rx="2" stroke={color} strokeWidth="1.8" fill="none"/>
      <Line x1="3.5" y1="10" x2="20.5" y2="10" stroke={color} strokeWidth="1.8"/>
      <Line x1="8" y1="3" x2="8" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="16" y1="3" x2="16" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function PenIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20L4.8 16.4L15.5 5.7C16.3 4.9 17.6 4.9 18.4 5.7C19.2 6.5 19.2 7.8 18.4 8.6L7.7 19.3L4 20Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Line x1="13.5" y1="7.7" x2="16.3" y2="10.5" stroke={color} strokeWidth="1.6"/>
    </Svg>
  );
}

export function CameraIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8C4 6.9 4.9 6 6 6H8L9.5 4H14.5L16 6H18C19.1 6 20 6.9 20 8V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Circle cx="12" cy="12.5" r="3.5" stroke={color} strokeWidth="1.8" fill="none"/>
    </Svg>
  );
}

export function MessageIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function HistoryIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20C9.5 20 7.3 18.9 5.8 17.1" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Polyline points="3,17 5.8,17.1 6.5,14.3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <Path d="M12 8V12L15 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function ChartIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="21" x2="20" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Rect x="6" y="13" width="3.5" height="8" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
      <Rect x="10.5" y="8" width="3.5" height="13" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
      <Rect x="15" y="3" width="3.5" height="18" rx="1" stroke={color} strokeWidth="1.8" fill="none"/>
    </Svg>
  );
}

export function FlameIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 7 7 7 12.5C7 15.5 9.2 18 12 18C14.8 18 17 15.5 17 12.5C17 11.5 16.7 10.6 16.2 9.8C16 11.2 15 12 14 12C14.6 10 14 7 12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M9.5 15C9.5 16.4 10.6 17.5 12 17.5C13.4 17.5 14.5 16.4 14.5 15" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

export function InfoIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none"/>
      <Line x1="12" y1="11" x2="12" y2="16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Circle cx="12" cy="7.8" r="1" fill={color}/>
    </Svg>
  );
}

export function TrashIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Path d="M9 7V4.5C9 3.7 9.7 3 10.5 3H13.5C14.3 3 15 3.7 15 4.5V7" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Path d="M6 7L7 20C7 20.6 7.4 21 8 21H16C16.6 21 17 20.6 17 20L18 7" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <Line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </Svg>
  );
}

export function PeopleIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M3 20V19C3 16.2 5.2 14 8 14H10C12.8 14 15 16.2 15 19V20" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Path d="M15.5 4.5C17 4.7 18 6 18 7.5C18 9 17 10.3 15.5 10.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <Path d="M18.5 20V19C18.5 16.9 17.3 15.1 15.5 14.3" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </Svg>
  );
}

export function ArrowRightIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="12" x2="19" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Polyline points="13,6 19,12 13,18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function ChevronRightIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline points="9,5 16,12 9,19" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function LockFocusIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M8 11V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V11" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Circle cx="12" cy="16" r="1.6" fill={color}/>
    </Svg>
  );
}

export function ShareIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function GemIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9L8 3H16L20 9L12 21L4 9Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Line x1="4" y1="9" x2="20" y2="9" stroke={color} strokeWidth="1.6"/>
      <Path d="M9 3L12 9L15 3" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}

export function MicIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth="1.8" fill="none"/>
      <Path d="M5 11C5 15 8.1 18 12 18C15.9 18 19 15 19 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <Line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function MenuIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4" y1="6" x2="20" y2="6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function PlusIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

export function CloseIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

export function ChatBubbleIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15C21 15.55 20.55 16 20 16H7L3 20V4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V15Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
      <Circle cx="8" cy="9.5" r="1" fill={color}/>
      <Circle cx="12" cy="9.5" r="1" fill={color}/>
      <Circle cx="16" cy="9.5" r="1" fill={color}/>
    </Svg>
  );
}
