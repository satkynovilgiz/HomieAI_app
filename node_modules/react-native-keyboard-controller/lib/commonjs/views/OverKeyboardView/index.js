"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _bindings = require("../../bindings");
var _hooks = require("../../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A view component that renders its children over the keyboard without closing the keyboard.
 * Acts similar to modal, but doesn't close the keyboard when it's visible.
 *
 * @param props - Component props.
 * @returns A view component that renders over the keyboard.
 * @example
 * ```tsx
 * <OverKeyboardView visible={true}>
 *   <Text>This will appear over the keyboard</Text>
 * </OverKeyboardView>
 * ```
 */
const OverKeyboardView = props => {
  const {
    children,
    visible
  } = props;
  const {
    height,
    width
  } = (0, _hooks.useWindowDimensions)();
  const inner = (0, _react.useMemo)(() => ({
    height,
    width
  }), [height, width]);
  const style = (0, _react.useMemo)(() => [styles.absolute,
  // On iOS - stretch view to full window dimensions to make yoga work
  _reactNative.Platform.OS === "ios" ? inner : undefined,
  // On Android - we are laid out by ShadowNode, so just stretch to full container
  _reactNative.Platform.OS === "android" ? styles.stretch : undefined], [inner]);
  return /*#__PURE__*/_react.default.createElement(_bindings.RCTOverKeyboardView, {
    visible: visible
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    collapsable: false,
    style: style
  }, visible && children));
};
const styles = _reactNative.StyleSheet.create({
  absolute: {
    position: "absolute"
  },
  stretch: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});
var _default = exports.default = OverKeyboardView;
//# sourceMappingURL=index.js.map