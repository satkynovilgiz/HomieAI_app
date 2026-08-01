"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useWindowDimensions = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _bindings = require("../../bindings");
const window = _reactNative.Dimensions.get("window");
let initialDimensions = {
  width: window.width,
  height: window.height
};
_bindings.WindowDimensionsEvents.addListener("windowDidResize", e => {
  initialDimensions = e;
});
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = (0, _react.useState)(initialDimensions);
  (0, _react.useEffect)(() => {
    const subscription = _bindings.WindowDimensionsEvents.addListener("windowDidResize", e => {
      setDimensions(e);
    });

    // we might have missed an update between reading a value in render and
    // `addListener` in this handler, so we set it here. If there was
    // no change, React will filter out this update as a no-op.
    setDimensions(initialDimensions);
    return () => {
      subscription.remove();
    };
  }, []);
  return dimensions;
};
exports.useWindowDimensions = useWindowDimensions;
//# sourceMappingURL=index.js.map