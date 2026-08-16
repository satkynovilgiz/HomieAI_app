
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props extends TextInputProps { label?: string; error?: string; rightIcon?: React.ReactNode; }

export default function Input({ label, error, style, rightIcon, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <TextInput
          {...props}
          style={[styles.input, !!rightIcon && styles.inputWithIcon, focused && styles.focused, error && styles.error, style]}
          placeholderTextColor={Colors.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text2, marginBottom: 7 },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: { backgroundColor: Colors.bg3, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, color: Colors.text, height: 52, paddingHorizontal: 14, fontSize: 14 },
  inputWithIcon: { paddingRight: 44 },
  rightIcon: { position: 'absolute', right: 14 },
  focused: { borderColor: Colors.purple, backgroundColor: 'rgba(124,58,237,0.05)' },
  error: { borderColor: Colors.red },
  errorText: { fontSize: 12, color: Colors.red, marginTop: 4 },
});
