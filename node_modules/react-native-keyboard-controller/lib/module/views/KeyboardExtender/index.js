import React from "react";
import { Animated } from "react-native";
import { KeyboardBackgroundView } from "../../bindings";
import { KeyboardStickyView } from "../../components";
import { useKeyboardAnimation } from "../../hooks";
const AnimatedKeyboardBackgroundView = Animated.createAnimatedComponent(KeyboardBackgroundView);

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
  } = useKeyboardAnimation();
  return /*#__PURE__*/React.createElement(KeyboardStickyView, {
    enabled: enabled
  }, /*#__PURE__*/React.createElement(AnimatedKeyboardBackgroundView, {
    style: {
      opacity: progress
    }
  }, children));
};
export default KeyboardExtender;
//# sourceMappingURL=index.js.map