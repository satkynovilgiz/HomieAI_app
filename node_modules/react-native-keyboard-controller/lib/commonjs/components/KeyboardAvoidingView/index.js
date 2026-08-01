"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _bindings = require("../../bindings");
var _hooks = require("../../hooks");
var _findNodeHandle = require("../../utils/findNodeHandle");
var _useCombinedRef = _interopRequireDefault(require("../hooks/useCombinedRef"));
var _hooks2 = require("./hooks");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
const KeyboardAvoidingView = /*#__PURE__*/(0, _react.forwardRef)(({
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
  const initialFrame = (0, _reactNativeReanimated.useSharedValue)(null);
  const internalRef = _react.default.useRef(null);
  const frame = (0, _reactNativeReanimated.useDerivedValue)(() => initialFrame.value || defaultLayout);
  const {
    translate,
    padding
  } = (0, _hooks2.useTranslateAnimation)();
  const keyboard = (0, _hooks2.useKeyboardAnimation)();
  const {
    height: screenHeight
  } = (0, _hooks.useWindowDimensions)();
  const relativeKeyboardHeight = (0, _react.useCallback)(() => {
    "worklet";

    const keyboardY = screenHeight - keyboard.heightWhenOpened.value - keyboardVerticalOffset;
    return Math.max(frame.value.y + frame.value.height - keyboardY, 0);
  }, [screenHeight, keyboardVerticalOffset]);
  const interpolateToRelativeKeyboardHeight = (0, _react.useCallback)(value => {
    "worklet";

    return (0, _reactNativeReanimated.interpolate)(value, [0, 1], [0, relativeKeyboardHeight()]);
  }, [relativeKeyboardHeight]);
  const onLayoutWorklet = (0, _react.useCallback)(layout => {
    "worklet";

    if (keyboard.isClosed.value || initialFrame.value === null || behavior !== "height") {
      // eslint-disable-next-line react-compiler/react-compiler
      initialFrame.value = layout;
    }
  }, [behavior]);
  const onLayout = (0, _react.useCallback)(e => {
    onLayoutProps === null || onLayoutProps === void 0 || onLayoutProps(e);
    const layout = e.nativeEvent.layout;
    if (automaticOffset) {
      const tag = (0, _findNodeHandle.findNodeHandle)(internalRef.current);
      if (tag !== null) {
        // Use native `viewPositionInWindow` to get true screen-absolute coordinates.
        // This fixes current RN bugs:
        // - https://github.com/facebook/react-native/pull/56062
        // - https://github.com/facebook/react-native/pull/56056
        return _bindings.KeyboardControllerNative.viewPositionInWindow(tag).then(position => {
          (0, _reactNativeReanimated.runOnUI)(onLayoutWorklet)({
            ...layout,
            x: position.x,
            y: position.y
          });
        }).catch(() => {
          (0, _reactNativeReanimated.runOnUI)(onLayoutWorklet)(layout);
        });
      }
    }
    return (0, _reactNativeReanimated.runOnUI)(onLayoutWorklet)(layout);
  }, [onLayoutProps, automaticOffset]);
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
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
  const combinedRef = (0, _useCombinedRef.default)(internalRef, ref);
  const isPositionBehavior = behavior === "position";
  const containerStyle = isPositionBehavior ? contentContainerStyle : style;
  const combinedStyles = (0, _react.useMemo)(() => [containerStyle, animatedStyle], [containerStyle, animatedStyle]);
  if (isPositionBehavior) {
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, _extends({
      ref: combinedRef,
      style: style,
      onLayout: onLayout
    }, props), /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
      style: combinedStyles
    }, children));
  }
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, _extends({
    ref: combinedRef,
    style: combinedStyles,
    onLayout: onLayout
  }, props), children);
});
var _default = exports.default = KeyboardAvoidingView;
//# sourceMappingURL=index.js.map