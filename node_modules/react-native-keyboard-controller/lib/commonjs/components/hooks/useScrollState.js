"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _reactNativeReanimated = require("react-native-reanimated");
var _internal = require("../../internal");
const NATIVE_SCROLL_EVENT_NAMES = ["onScroll", "onScrollBeginDrag", "onScrollEndDrag", "onMomentumScrollBegin", "onMomentumScrollEnd"];
const useScrollState = ref => {
  const offset = (0, _reactNativeReanimated.useSharedValue)(0);
  const layout = (0, _reactNativeReanimated.useSharedValue)({
    width: 0,
    height: 0
  });
  const size = (0, _reactNativeReanimated.useSharedValue)({
    width: 0,
    height: 0
  });
  const register = (0, _internal.useEventHandlerRegistration)(ref);
  const eventHandler = (0, _reactNativeReanimated.useEvent)(event => {
    "worklet";

    // eslint-disable-next-line react-compiler/react-compiler
    offset.value = event.contentOffset.y;
    layout.value = event.layoutMeasurement;
    size.value = event.contentSize;
  }, NATIVE_SCROLL_EVENT_NAMES);
  (0, _react.useEffect)(() => {
    const cleanup = register(eventHandler);
    return () => {
      cleanup();
    };
  }, []);

  // `onContentSizeChange` is synthesized in JS (from the content container's
  // onLayout) and `onLayout` has a different payload shape than scroll events,
  // so neither can be reliably captured via native event registration.
  // Instead we expose callbacks for the consumer to attach as props.
  const onLayout = (0, _react.useCallback)(e => {
    layout.value = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    };
  }, [layout]);
  const onContentSizeChange = (0, _react.useCallback)((w, h) => {
    size.value = {
      width: w,
      height: h
    };
  }, [size]);
  return {
    offset,
    layout,
    size,
    onLayout,
    onContentSizeChange
  };
};
var _default = exports.default = useScrollState;
//# sourceMappingURL=useScrollState.js.map