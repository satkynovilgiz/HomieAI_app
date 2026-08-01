"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _hooks = require("../../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * A View component that sticks to the keyboard and moves with it when it appears or disappears.
 * The view can be configured with custom offsets for both closed and open keyboard states.
 *
 * @returns An animated View component that sticks to the keyboard.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-sticky-view|Documentation} page for more details.
 * @example
 * ```tsx
 * <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
 *   <Button title="Submit" />
 * </KeyboardStickyView>
 * ```
 */
const KeyboardStickyView = /*#__PURE__*/(0, _react.forwardRef)(({
  children,
  offset: {
    closed = 0,
    opened = 0
  } = {},
  style,
  enabled = true,
  ...props
}, ref) => {
  const {
    height,
    progress
  } = (0, _hooks.useReanimatedKeyboardAnimation)();
  const stickyViewStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const offset = (0, _reactNativeReanimated.interpolate)(progress.value, [0, 1], [closed, opened]);
    return {
      transform: [{
        translateY: enabled ? height.value + offset : closed
      }]
    };
  }, [closed, opened, enabled]);
  const styles = (0, _react.useMemo)(() => [style, stickyViewStyle], [style, stickyViewStyle]);
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, _extends({
    ref: ref,
    style: styles
  }, props), children);
});
var _default = exports.default = KeyboardStickyView;
//# sourceMappingURL=index.js.map