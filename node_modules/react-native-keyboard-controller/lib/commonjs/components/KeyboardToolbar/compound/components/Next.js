"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _module = require("../../../../module");
var _Arrow = _interopRequireDefault(require("../../Arrow"));
var _Button = _interopRequireDefault(require("../../Button"));
var _constants = require("../../constants");
var _context = require("../context");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Next = ({
  children,
  onPress,
  disabled,
  rippleRadius,
  style,
  button: ButtonContainer = _Button.default,
  icon: IconContainer = _Arrow.default
}) => {
  const context = (0, _context.useToolbarContext)();
  const {
    theme,
    isNextDisabled
  } = context;
  const isDisabled = disabled ?? isNextDisabled;
  const onPressNext = (0, _react.useCallback)(event => {
    onPress === null || onPress === void 0 || onPress(event);
    if (!event.isDefaultPrevented()) {
      _module.KeyboardController.setFocusTo("next");
    }
  }, [onPress]);
  return /*#__PURE__*/_react.default.createElement(ButtonContainer, {
    accessibilityHint: "Moves focus to the next field",
    accessibilityLabel: "Next",
    disabled: isDisabled,
    rippleRadius: rippleRadius,
    style: style,
    testID: _constants.TEST_ID_KEYBOARD_TOOLBAR_NEXT,
    theme: theme,
    onPress: onPressNext
  }, children ?? /*#__PURE__*/_react.default.createElement(IconContainer, {
    disabled: isDisabled,
    theme: theme,
    type: "next"
  }));
};
var _default = exports.default = Next;
//# sourceMappingURL=Next.js.map