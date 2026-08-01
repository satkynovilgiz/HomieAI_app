"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
const useCombinedRef = (...refs) => {
  return (0, _react.useCallback)(value => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, refs);
};
var _default = exports.default = useCombinedRef;
//# sourceMappingURL=useCombinedRef.js.map