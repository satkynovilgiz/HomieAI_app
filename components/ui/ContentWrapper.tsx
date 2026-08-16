import { View, StyleSheet, ViewStyle } from 'react-native';
import { responsive } from '../../constants/responsive';

interface Props { children: React.ReactNode; style?: ViewStyle; }

export default function ContentWrapper({ children, style }: Props) {
  if (!responsive.isTablet) return <>{children}</>;
  return (
    <View style={styles.outer}>
      <View style={[styles.inner, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, alignItems: 'center', width: '100%' },
  inner: { width: '100%', maxWidth: responsive.maxWidth },
});
