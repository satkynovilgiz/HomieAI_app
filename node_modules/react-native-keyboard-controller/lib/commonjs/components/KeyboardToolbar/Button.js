"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _hooks = require("../../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
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
  const Container = disabled ? _reactNative.View : _reactNative.TouchableOpacity;
  const accessibilityState = (0, _react.useMemo)(() => ({
    disabled
  }), [disabled]);
  return /*#__PURE__*/_react.default.createElement(Container, {
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
  const colorScheme = (0, _hooks.useKeyboardState)(state => state.appearance);
  const accessibilityState = (0, _react.useMemo)(() => ({
    disabled
  }), [disabled]);
  const ripple = (0, _react.useMemo)(() => _reactNative.TouchableNativeFeedback.Ripple(theme[colorScheme].ripple, true, rippleRadius), [colorScheme, rippleRadius, theme]);
  return /*#__PURE__*/_react.default.createElement(_reactNative.TouchableNativeFeedback, {
    accessibilityHint: accessibilityHint,
    accessibilityLabel: accessibilityLabel,
    accessibilityRole: "button",
    accessibilityState: accessibilityState,
    background: ripple,
    style: style,
    testID: testID,
    onPress: onPress
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: style
  }, children));
};
var _default = exports.default = _reactNative.Platform.select({
  android: ButtonAndroid,
  default: ButtonIOS
});
//# sourceMappingURL=Button.js.map