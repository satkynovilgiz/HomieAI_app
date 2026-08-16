import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.trim().slice(0, 2) || '?').toUpperCase();
}

// Old accounts stored an emoji string in user.avatar — treat anything that
// isn't a hex color as the legacy default rather than rendering raw emoji.
export function isAvatarColor(avatar?: string): avatar is string {
  return !!avatar && /^#[0-9a-fA-F]{3,8}$/.test(avatar);
}

interface Props {
  name: string;
  color?: string;
  size?: number;
}

export default function AvatarCircle({ name, color, size = 48 }: Props) {
  const bg = isAvatarColor(color) ? color : Colors.purple;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.white, fontWeight: '900' },
});
