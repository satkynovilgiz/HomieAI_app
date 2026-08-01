"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _bindings = require("../../bindings");
var _components = require("../../components");
var _hooks = require("../../hooks");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const AnimatedKeyboardBackgroundView = _reactNative.Animated.createAnimatedComponent(_bindings.KeyboardBackgroundView);

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
    progress
  } = (0, _hooks.useKeyboardAnimation)();
  return /*#__PURE__*/_react.default.createElement(_components.KeyboardStickyView, {
    enabled: enabled
  }, /*#__PURE__*/_react.default.createElement(AnimatedKeyboardBackgroundView, {
    style: {
      opacity: progress
    }
  }, children));
};
var _default = exports.default = KeyboardExtender;
//# sourceMappingURL=index.js.map