import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { View } from 'react-native';

interface Props {
  mood?: 'happy' | 'sad' | 'thinking' | 'shocked' | 'celebrating' | 'wink' | 'angry' | 'love' | 'cool' | 'sleepy';
  size?: number;
}

export default function HomieBot({ mood = 'happy', size = 80 }: Props) {
  const MOODS: Record<string, any> = {
    happy: { lbrow: 'M52 62 Q68 52 86 60', rbrow: 'M114 60 Q132 52 148 62', eyes: 'normal', mouth: 'M72 118 Q100 140 128 118', mfill: '#fda4af', cheeks: true, tears: false, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: false, sunglasses: false },
    sad: { lbrow: 'M52 66 Q68 60 86 66', rbrow: 'M114 66 Q132 60 148 66', eyes: 'sad', mouth: 'M72 128 Q100 114 128 128', mfill: 'none', cheeks: false, tears: true, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: false, sunglasses: false },
    thinking: { lbrow: 'M52 62 Q68 52 86 60', rbrow: 'M114 58 Q132 50 146 60', eyes: 'normal', mouth: 'M80 122 Q100 118 116 124', mfill: 'none', cheeks: true, tears: false, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: false, sunglasses: false },
    shocked: { lbrow: 'M48 56 Q68 44 88 56', rbrow: 'M112 56 Q132 44 152 56', eyes: 'shocked', mouth: 'M88 120 Q100 136 112 120', mfill: '#1e1b4b', cheeks: false, tears: false, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: true, sunglasses: false },
    celebrating: { lbrow: 'M48 56 Q68 46 88 58', rbrow: 'M112 58 Q132 46 152 56', eyes: 'happy', mouth: 'M68 116 Q100 144 132 116', mfill: '#fda4af', cheeks: true, tears: false, armsUp: true, confetti: true, hearts: false, zzz: false, sweat: false, sunglasses: false },
    wink: { lbrow: 'M52 62 Q68 52 86 60', rbrow: 'M114 62 Q132 54 148 62', eyes: 'wink', mouth: 'M72 118 Q100 138 128 118', mfill: '#fda4af', cheeks: true, tears: false, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: false, sunglasses: false },
    angry: { lbrow: 'M52 68 L86 60', rbrow: 'M114 60 L148 68', eyes: 'angry', mouth: 'M74 128 Q100 116 126 128', mfill: 'none', cheeks: false, tears: false, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: false, sunglasses: false },
    love: { lbrow: 'M52 62 Q68 52 86 60', rbrow: 'M114 60 Q132 52 148 62', eyes: 'love', mouth: 'M72 118 Q100 140 128 118', mfill: '#fda4af', cheeks: true, tears: false, armsUp: false, confetti: false, hearts: true, zzz: false, sweat: false, sunglasses: false },
    cool: { lbrow: 'M52 62 Q68 52 86 60', rbrow: 'M114 60 Q132 52 148 62', eyes: 'normal', mouth: 'M78 120 Q100 132 122 120', mfill: '#fda4af', cheeks: false, tears: false, armsUp: false, confetti: false, hearts: false, zzz: false, sweat: false, sunglasses: true },
    sleepy: { lbrow: 'M54 68 Q70 62 86 66', rbrow: 'M114 66 Q130 62 146 68', eyes: 'sleepy', mouth: 'M82 122 Q100 116 118 122', mfill: 'none', cheeks: false, tears: false, armsUp: false, confetti: false, hearts: false, zzz: true, sweat: false, sunglasses: false },
  };

  const m = MOODS[mood] || MOODS.happy;

  const renderEyes = () => {
    switch (m.eyes) {
      case 'sad': return <G><Ellipse cx="74" cy="88" rx="22" ry="20" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="74" cy="92" r="11" fill="#1e1b4b"/><Circle cx="79" cy="87" r="4" fill="white"/><Ellipse cx="126" cy="88" rx="22" ry="20" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="126" cy="92" r="11" fill="#1e1b4b"/><Circle cx="131" cy="87" r="4" fill="white"/></G>;
      case 'shocked': return <G><Ellipse cx="74" cy="88" rx="26" ry="28" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="74" cy="90" r="14" fill="#1e1b4b"/><Circle cx="80" cy="84" r="5" fill="white"/><Ellipse cx="126" cy="88" rx="26" ry="28" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="126" cy="90" r="14" fill="#1e1b4b"/><Circle cx="132" cy="84" r="5" fill="white"/></G>;
      case 'happy': return <G><Path d="M52 88 Q74 68 96 88" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Path d="M104 88 Q126 68 148 88" fill="white" stroke="#3b0764" strokeWidth="3.5"/></G>;
      case 'wink': return <G><Ellipse cx="74" cy="88" rx="22" ry="22" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="74" cy="90" r="12" fill="#1e1b4b"/><Circle cx="79" cy="85" r="4.5" fill="white"/><Path d="M104 85 Q126 75 148 85" fill="none" stroke="#3b0764" strokeWidth="4" strokeLinecap="round"/></G>;
      case 'angry': return <G><Ellipse cx="74" cy="90" rx="22" ry="22" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="74" cy="92" r="12" fill="#1e1b4b"/><Circle cx="79" cy="87" r="4.5" fill="white"/><Ellipse cx="126" cy="90" rx="22" ry="22" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="126" cy="92" r="12" fill="#1e1b4b"/><Circle cx="131" cy="87" r="4.5" fill="white"/></G>;
      case 'love': return <G><Path d="M62 82 C62 76 74 74 74 82 C74 74 86 76 86 82 C86 92 74 100 74 100 C74 100 62 92 62 82Z" fill="#ef4444"/><Path d="M114 82 C114 76 126 74 126 82 C126 74 138 76 138 82 C138 92 126 100 126 100 C126 100 114 92 114 82Z" fill="#ef4444"/></G>;
      case 'sleepy': return <G><Path d="M52 88 Q74 100 96 88" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Path d="M104 88 Q126 100 148 88" fill="white" stroke="#3b0764" strokeWidth="3.5"/></G>;
      default: return <G><Ellipse cx="74" cy="88" rx="22" ry="22" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="74" cy="90" r="12" fill="#1e1b4b"/><Circle cx="79" cy="85" r="4.5" fill="white"/><Ellipse cx="126" cy="88" rx="22" ry="22" fill="white" stroke="#3b0764" strokeWidth="3.5"/><Circle cx="126" cy="90" r="12" fill="#1e1b4b"/><Circle cx="131" cy="85" r="4.5" fill="white"/></G>;
    }
  };

  return (
    <View style={{ width: size, height: size * 1.25 }}>
      <Svg width={size} height={size * 1.25} viewBox="0 0 200 250">
        <Ellipse cx="100" cy="244" rx="56" ry="8" fill="#4c1d95" opacity="0.18"/>
        {m.confetti && <G><Rect x="18" y="18" width="11" height="11" rx="3" fill="#fbbf24" opacity="0.9"/><Rect x="168" y="14" width="10" height="10" rx="3" fill="#fda4af" opacity="0.9"/><Rect x="8" y="148" width="9" height="9" rx="2" fill="#34d399" opacity="0.85"/><Rect x="183" y="138" width="11" height="11" rx="3" fill="#60a5fa" opacity="0.85"/></G>}
        {m.hearts && <G><Path d="M20 40 C20 34 28 32 28 40 C28 32 36 34 36 40 C36 48 28 54 28 54Z" fill="#ef4444" opacity="0.9"/><Path d="M162 30 C162 25 169 23 169 30 C169 23 176 25 176 30 C176 37 169 42 169 42Z" fill="#ef4444" opacity="0.9"/></G>}
        {m.zzz && <G><Rect x="155" y="40" width="20" height="5" rx="2" fill="#94a3b8" opacity="0.8"/><Rect x="162" y="50" width="26" height="5" rx="2" fill="#94a3b8" opacity="0.7"/><Rect x="157" y="60" width="32" height="5" rx="2" fill="#94a3b8" opacity="0.6"/></G>}
        {m.sweat && <Path d="M155 55 Q158 45 161 55 Q164 65 158 65 Q152 65 155 55Z" fill="#60a5fa" opacity="0.9"/>}
        {mood === 'thinking' && <G><Circle cx="170" cy="58" r="5" fill="#a78bfa" opacity="0.7"/><Circle cx="181" cy="44" r="8" fill="#a78bfa" opacity="0.7"/><Circle cx="194" cy="26" r="12" fill="#a78bfa" opacity="0.75"/></G>}
        <Ellipse cx="100" cy="192" rx="52" ry="54" fill="#6d28d9" stroke="#3b0764" strokeWidth="4"/>
        <Ellipse cx="100" cy="202" rx="34" ry="40" fill="#8b5cf6"/>
        {m.armsUp ? <G><Path d="M48 178 Q20 152 8 122 Q4 105 20 102 Q36 99 40 128" fill="#6d28d9" stroke="#3b0764" strokeWidth="3.5"/><Path d="M152 178 Q180 152 192 122 Q196 105 180 102 Q164 99 160 128" fill="#6d28d9" stroke="#3b0764" strokeWidth="3.5"/></G> : <G><Path d="M48 190 Q22 178 16 157 Q12 140 26 138 Q40 135 44 160" fill="#6d28d9" stroke="#3b0764" strokeWidth="3.5"/><Path d="M152 190 Q178 178 184 157 Q188 140 174 138 Q160 135 156 160" fill="#6d28d9" stroke="#3b0764" strokeWidth="3.5"/></G>}
        <Ellipse cx="78" cy="240" rx="24" ry="10" fill="#5b21b6" stroke="#3b0764" strokeWidth="3"/>
        <Ellipse cx="122" cy="240" rx="24" ry="10" fill="#5b21b6" stroke="#3b0764" strokeWidth="3"/>
        <Circle cx="100" cy="90" r="68" fill="#6d28d9" stroke="#3b0764" strokeWidth="4"/>
        <Ellipse cx="33" cy="88" rx="14" ry="20" fill="#5b21b6" stroke="#3b0764" strokeWidth="3.5"/>
        <Ellipse cx="167" cy="88" rx="14" ry="20" fill="#5b21b6" stroke="#3b0764" strokeWidth="3.5"/>
        <Rect x="96" y="20" width="8" height="24" rx="4" fill="#3b0764"/>
        <Circle cx="100" cy="18" r="13" fill="#d97706" stroke="#92400e" strokeWidth="3"/>
        <Circle cx="100" cy="18" r="7" fill="#fbbf24"/>
        <Circle cx="97" cy="14" r="3" fill="#fef9c3" opacity="0.8"/>
        {renderEyes()}
        {m.sunglasses && <G><Rect x="50" y="76" width="44" height="28" rx="8" fill="#1e1b4b" stroke="#3b0764" strokeWidth="2.5" opacity="0.95"/><Rect x="106" y="76" width="44" height="28" rx="8" fill="#1e1b4b" stroke="#3b0764" strokeWidth="2.5" opacity="0.95"/><Rect x="94" y="84" width="12" height="4" rx="2" fill="#3b0764"/></G>}
        <Path d={m.lbrow} fill="none" stroke="#3b0764" strokeWidth="5" strokeLinecap="round"/>
        <Path d={m.rbrow} fill="none" stroke="#3b0764" strokeWidth="5" strokeLinecap="round"/>
        <Path d={m.mouth} fill={m.mfill} stroke="#3b0764" strokeWidth="4.5" strokeLinejoin="round"/>
        {(mood === 'happy' || mood === 'celebrating' || mood === 'wink' || mood === 'love') && <Ellipse cx="100" cy="124" rx="13" ry="9" fill="#f9a8d4" stroke="#3b0764" strokeWidth="2"/>}
        {m.cheeks && <G><Ellipse cx="46" cy="110" rx="15" ry="11" fill="#fda4af" opacity="0.55"/><Ellipse cx="154" cy="110" rx="15" ry="11" fill="#fda4af" opacity="0.55"/></G>}
        {m.tears && <G><Path d="M68 112 Q70 122 66 130 Q72 132 74 122 Q72 114 68 112Z" fill="#93c5fd" opacity="0.9"/><Path d="M120 112 Q122 122 118 130 Q124 132 126 122 Q124 114 120 112Z" fill="#93c5fd" opacity="0.9"/></G>}
      </Svg>
    </View>
  );
}
