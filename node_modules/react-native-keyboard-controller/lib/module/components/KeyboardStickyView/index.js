function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, useMemo } from "react";
import Reanimated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "../../hooks";
/**
 * A View component that sticks to the keyboard and moves with it when it appears or disappears.
 * The view can be configured with custom offsets for both closed and open keyboard states.
 *
 * @returns An animated View component that sticks to the keyboard.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-sticky-view|Documentation} page for more details.
 * @example
 * ```tsx
 * <KeyboardStickyView offset={{ closed: 0, opened: 20 }}>
 *   <Button title="Submit" />
 * </KeyboardStickyView>
 * ```
 */
const KeyboardStickyView = /*#__PURE__*/forwardRef(({
  children,
  offset: {
    closed = 0,
    opened = 0
  } = {},
  style,
  enabled = true,
  ...props
}, ref) => {
  const {
    height,
    progress
  } = useReanimatedKeyboardAnimation();
  const stickyViewStyle = useAnimatedStyle(() => {
    const offset = interpolate(progress.value, [0, 1], [closed, opened]);
    return {
      transform: [{
        translateY: enabled ? height.value + offset : closed
      }]
    };
  }, [closed, opened, enabled]);
  const styles = useMemo(() => [style, stickyViewStyle], [style, stickyViewStyle]);
  return /*#__PURE__*/React.createElement(Reanimated.View, _extends({
    ref: ref,
    style: styles
  }, props), children);
});
export default KeyboardStickyView;
//# sourceMappingURL=index.js.map