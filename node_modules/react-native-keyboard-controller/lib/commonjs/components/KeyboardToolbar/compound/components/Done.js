"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _hooks = require("../../../../hooks");
var _module = require("../../../../module");
var _Button = _interopRequireDefault(require("../../Button"));
var _constants = require("../../constants");
var _context = require("../context");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Done = ({
  children,
  onPress,
  rippleRadius = 28,
  text,
  button: ButtonContainer = _Button.default
}) => {
  const colorScheme = (0, _hooks.useKeyboardState)(state => state.appearance);
  const context = (0, _context.useToolbarContext)();
  const {
    theme
  } = context;
  const doneStyle = (0, _react.useMemo)(() => [styles.doneButton, {
    color: theme[colorScheme].primary
  }], [colorScheme, theme]);
  const onPressDone = (0, _react.useCallback)(event => {
    onPress === null || onPress === void 0 || onPress(event);
    if (!event.isDefaultPrevented()) {
      _module.KeyboardController.dismiss();
    }
  }, [onPress]);
  return /*#__PURE__*/_react.default.createElement(ButtonContainer, {
    accessibilityHint: "Closes the keyboard",
    accessibilityLabel: "Done",
    rippleRadius: rippleRadius,
    style: styles.doneButtonContainer,
    testID: _constants.TEST_ID_KEYBOARD_TOOLBAR_DONE,
    theme: theme,
    onPress: onPressDone
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    maxFontSizeMultiplier: 1.3,
    style: doneStyle
  }, children ?? text ?? "Done"));
};
const styles = _reactNative.StyleSheet.create({
  doneButton: {
    fontWeight: "600",
    fontSize: 15
  },
  doneButtonContainer: {
    marginRight: 16,
    marginLeft: 8
  }
});
var _default = exports.default = Done;
//# sourceMappingURL=Done.js.map