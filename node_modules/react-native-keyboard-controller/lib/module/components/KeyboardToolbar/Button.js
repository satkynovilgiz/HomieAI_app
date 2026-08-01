import React, { useMemo } from "react";
import { Platform, TouchableNativeFeedback, TouchableOpacity, View } from "react-native";
import { useKeyboardState } from "../../hooks";
const ButtonIOS = ({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style
}) => {
  // immediately switch to plain view to avoid animation flickering
  // when fade out animation happens and view becomes disabled
  const Container = disabled ? View : TouchableOpacity;
  const accessibilityState = useMemo(() => ({
    disabled
  }), [disabled]);
  return /*#__PURE__*/React.createElement(Container, {
    accessibilityHint: accessibilityHint,
    accessibilityLabel: accessibilityLabel,
    accessibilityRole: "button",
    accessibilityState: accessibilityState,
    style: style,
    testID: testID,
    onPress: onPress
  }, children);
};
const ButtonAndroid = ({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
  rippleRadius = 18,
  style,
  theme
}) => {
  const colorScheme = useKeyboardState(state => state.appearance);
  const accessibilityState = useMemo(() => ({
    disabled
  }), [disabled]);
  const ripple = useMemo(() => TouchableNativeFeedback.Ripple(theme[colorScheme].ripple, true, rippleRadius), [colorScheme, rippleRadius, theme]);
  return /*#__PURE__*/React.createElement(TouchableNativeFeedback, {
    accessibilityHint: accessibilityHint,
    accessibilityLabel: accessibilityLabel,
    accessibilityRole: "button",
    accessibilityState: accessibilityState,
    background: ripple,
    style: style,
    testID: testID,
    onPress: onPress
  }, /*#__PURE__*/React.createElement(View, {
    style: style
  }, children));
};
export default Platform.select({
  android: ButtonAndroid,
  default: ButtonIOS
});
//# sourceMappingURL=Button.js.map