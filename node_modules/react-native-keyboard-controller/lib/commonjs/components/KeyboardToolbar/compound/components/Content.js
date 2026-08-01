"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _constants = require("../../constants");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Content = ({
  children
}) => {
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.flex,
    testID: _constants.TEST_ID_KEYBOARD_TOOLBAR_CONTENT
  }, children);
};
const styles = _reactNative.StyleSheet.create({
  flex: {
    flex: 1
  }
});
var _default = exports.default = Content;
//# sourceMappingURL=Content.js.map