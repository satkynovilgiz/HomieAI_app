"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useEndVisible = void 0;
var _react = require("react");
var _reactNativeReanimated = require("react-native-reanimated");
var _helpers = require("./useChatKeyboard/helpers");
const hasWorkletHash = value => typeof value === "function" && !!value.__workletHash;
const useEndVisible = ({
  scroll,
  layout,
  size,
  inverted,
  onEndVisible
}) => {
  const isWorklet = (0, _react.useMemo)(() => hasWorkletHash(onEndVisible), [onEndVisible]);
  const isAtEnd = (0, _reactNativeReanimated.useDerivedValue)(() => {
    // Wait until the scroll view has been measured to avoid a spurious initial
    // `true` on a (0,0,0) layout (the helper would otherwise treat unmeasured
    // state as "at end" because 0 + 0 >= 0 - threshold).
    if (layout.value.height === 0 || size.value.height === 0) {
      return null;
    }
    return (0, _helpers.isScrollAtEnd)(scroll.value, layout.value.height, size.value.height, inverted);
  });
  (0, _reactNativeReanimated.useAnimatedReaction)(() => isAtEnd.value, (current, previous) => {
    if (current === null || current === previous || !onEndVisible) {
      return;
    }
    if (isWorklet) {
      onEndVisible(current);
    } else {
      (0, _reactNativeReanimated.runOnJS)(onEndVisible)(current);
    }
  }, [onEndVisible, isWorklet, inverted]);
};
exports.useEndVisible = useEndVisible;
//# sourceMappingURL=useEndVisible.js.map