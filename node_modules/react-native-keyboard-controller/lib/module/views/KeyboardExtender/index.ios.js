import React from "react";
import { View } from "react-native";
import { RCTKeyboardExtender } from "../../bindings";
import { useWindowDimensions } from "../../hooks";
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
  } = useWindowDimensions();
  return /*#__PURE__*/React.createElement(RCTKeyboardExtender, {
    enabled: enabled
  }, /*#__PURE__*/React.createElement(View, {
    style: {
      width
    }
  }, children));
};
export default KeyboardExtender;
//# sourceMappingURL=index.ios.js.map