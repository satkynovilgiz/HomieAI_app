import React from "react";
import type { KeyboardToolbarTheme } from "./types";
import type { PropsWithChildren } from "react";
import type { GestureResponderEvent, ViewStyle } from "react-native";
type ButtonProps = {
    disabled?: boolean;
    onPress: (event: GestureResponderEvent) => void;
    accessibilityLabel: string;
    accessibilityHint: string;
    testID: string;
    rippleRadius?: number;
    style?: ViewStyle;
    theme: KeyboardToolbarTheme;
};
declare const _default: ({ children, onPress, disabled, accessibilityLabel, accessibilityHint, testID, style, }: PropsWithChildren<ButtonProps>) => React.JSX.Element;
export default _default;
