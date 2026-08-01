"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _hooks = require("../../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ArrowComponent = ({
  type,
  disabled,
  theme
}) => {
  const colorScheme = (0, _hooks.useKeyboardState)(state => state.appearance);
  const color = (0, _react.useMemo)(() => ({
    backgroundColor: disabled ? theme[colorScheme].disabled : theme[colorScheme].primary
  }), [disabled, theme, colorScheme]);
  const left = (0, _react.useMemo)(() => [styles.arrowLeftLine, color], [color]);
  const right = (0, _react.useMemo)(() => [styles.arrowRightLine, color], [color]);
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: type === "next" ? styles.arrowDownContainer : styles.arrowUpContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.arrow
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
    style: left
  }), /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
    style: right
  })));
};
const arrowLine = {
  width: 13,
  height: 2,
  borderRadius: 1
};
const arrowUpContainer = {
  marginHorizontal: 5,
  width: 30,
  height: 30,
  justifyContent: "center",
  alignItems: "center"
};
const styles = _reactNative.StyleSheet.create({
  arrowUpContainer: arrowUpContainer,
  arrowDownContainer: {
    ...arrowUpContainer,
    transform: [{
      rotate: "180deg"
    }]
  },
  arrow: {
    width: 20,
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  arrowLeftLine: {
    ...arrowLine,
    transform: [{
      rotate: "-45deg"
    }],
    left: -0.5
  },
  arrowRightLine: {
    ...arrowLine,
    transform: [{
      rotate: "45deg"
    }],
    left: -5.5
  }
});
var _default = exports.default = ArrowComponent;
//# sourceMappingURL=Arrow.js.map