function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, useCallback, useMemo } from "react";
import { View } from "react-native";
import Reanimated, { interpolate, runOnUI, useAnimatedStyle, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { KeyboardControllerNative } from "../../bindings";
import { useWindowDimensions } from "../../hooks";
import { findNodeHandle } from "../../utils/findNodeHandle";
import useCombinedRef from "../hooks/useCombinedRef";
import { useKeyboardAnimation, useTranslateAnimation } from "./hooks";
const defaultLayout = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

/**
 * A View component that automatically adjusts its height, position, or bottom padding
 * when the keyboard appears to ensure that the content remains visible.
 *
 * @returns A View component that adjusts to keyboard visibility.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-avoiding-view|Documentation} page for more details.
 * @example
 * ```tsx
 * <KeyboardAvoidingView behavior="padding">
 *   <TextInput />
 * </KeyboardAvoidingView>
 * ```
 */
const KeyboardAvoidingView = /*#__PURE__*/forwardRef(({
  behavior,
  children,
  contentContainerStyle,
  enabled = true,
  keyboardVerticalOffset = 0,
  automaticOffset = false,
  style,
  onLayout: onLayoutProps,
  ...props
}, ref) => {
  const initialFrame = useSharedValue(null);
  const internalRef = React.useRef(null);
  const frame = useDerivedValue(() => initialFrame.value || defaultLayout);
  const {
    translate,
    padding
  } = useTranslateAnimation();
  const keyboard = useKeyboardAnimation();
  const {
    height: screenHeight
  } = useWindowDimensions();
  const relativeKeyboardHeight = useCallback(() => {
    "worklet";

    const keyboardY = screenHeight - keyboard.heightWhenOpened.value - keyboardVerticalOffset;
    return Math.max(frame.value.y + frame.value.height - keyboardY, 0);
  }, [screenHeight, keyboardVerticalOffset]);
  const interpolateToRelativeKeyboardHeight = useCallback(value => {
    "worklet";

    return interpolate(value, [0, 1], [0, relativeKeyboardHeight()]);
  }, [relativeKeyboardHeight]);
  const onLayoutWorklet = useCallback(layout => {
    "worklet";

    if (keyboard.isClosed.value || initialFrame.value === null || behavior !== "height") {
      // eslint-disable-next-line react-compiler/react-compiler
      initialFrame.value = layout;
    }
  }, [behavior]);
  const onLayout = useCallback(e => {
    onLayoutProps === null || onLayoutProps === void 0 || onLayoutProps(e);
    const layout = e.nativeEvent.layout;
    if (automaticOffset) {
      const tag = findNodeHandle(internalRef.current);
      if (tag !== null) {
        // Use native `viewPositionInWindow` to get true screen-absolute coordinates.
        // This fixes current RN bugs:
        // - https://github.com/facebook/react-native/pull/56062
        // - https://github.com/facebook/react-native/pull/56056
        return KeyboardControllerNative.viewPositionInWindow(tag).then(position => {
          runOnUI(onLayoutWorklet)({
            ...layout,
            x: position.x,
            y: position.y
          });
        }).catch(() => {
          runOnUI(onLayoutWorklet)(layout);
        });
      }
    }
    return runOnUI(onLayoutWorklet)(layout);
  }, [onLayoutProps, automaticOffset]);
  const animatedStyle = useAnimatedStyle(() => {
    if (!enabled) {
      return {};
    }
    const bottom = interpolateToRelativeKeyboardHeight(keyboard.progress.value);
    const translateY = interpolateToRelativeKeyboardHeight(translate.value);
    const paddingBottom = interpolateToRelativeKeyboardHeight(padding.value);
    const height = frame.value.height - bottom;
    switch (behavior) {
      case "height":
        if (!keyboard.isClosed.value && height > 0) {
          return {
            height,
            flex: 0
          };
        }
        return {};
      case "position":
        return {
          bottom
        };
      case "padding":
        return {
          paddingBottom: bottom
        };
      case "translate-with-padding":
        return {
          paddingTop: paddingBottom,
          transform: [{
            translateY: -translateY
          }]
        };
      default:
        return {};
    }
  }, [behavior, enabled, interpolateToRelativeKeyboardHeight]);
  const combinedRef = useCombinedRef(internalRef, ref);
  const isPositionBehavior = behavior === "position";
  const containerStyle = isPositionBehavior ? contentContainerStyle : style;
  const combinedStyles = useMemo(() => [containerStyle, animatedStyle], [containerStyle, animatedStyle]);
  if (isPositionBehavior) {
    return /*#__PURE__*/React.createElement(View, _extends({
      ref: combinedRef,
      style: style,
      onLayout: onLayout
    }, props), /*#__PURE__*/React.createElement(Reanimated.View, {
      style: combinedStyles
    }, children));
  }
  return /*#__PURE__*/React.createElement(Reanimated.View, _extends({
    ref: combinedRef,
    style: combinedStyles,
    onLayout: onLayout
  }, props), children);
});
export default KeyboardAvoidingView;
//# sourceMappingURL=index.js.map