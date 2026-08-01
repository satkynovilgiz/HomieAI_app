"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _bindings = require("../../bindings");
var _hooks = require("../../hooks");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A component that embeds its children into the keyboard thus enhancing keyboard functionality.
 *
 * @param props - Component props.
 * @returns A view component that renders inside the keyboard above all system buttons.
 * @example
 * ```tsx
 * <KeyboardExtender>
 *   <Button>10$</Button>
 *   <Button>20$</Button>
 *   <Button>50$</Button>
 * </KeyboardExtender>
 * ```
 */
const KeyboardExtender = props => {
  const {
    children,
    enabled = true
  } = props;
  const {
    width
  } = (0, _hooks.useWindowDimensions)();
  return /*#__PURE__*/_react.default.createElement(_bindings.RCTKeyboardExtender, {
    enabled: enabled
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: {
      width
    }
  }, children));
};
var _default = exports.default = KeyboardExtender;
//# sourceMappingURL=index.ios.js.map