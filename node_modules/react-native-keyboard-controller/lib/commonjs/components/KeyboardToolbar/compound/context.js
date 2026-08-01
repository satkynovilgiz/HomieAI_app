"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useToolbarContext = exports.ToolbarContext = void 0;
var _react = require("react");
const ToolbarContext = exports.ToolbarContext = /*#__PURE__*/(0, _react.createContext)(undefined);
const useToolbarContext = () => {
  const context = (0, _react.useContext)(ToolbarContext);
  if (!context) {
    throw new Error("KeyboardToolbar.* component must be used inside <KeyboardToolbar>");
  }
  return context;
};
exports.useToolbarContext = useToolbarContext;
//# sourceMappingURL=context.js.map