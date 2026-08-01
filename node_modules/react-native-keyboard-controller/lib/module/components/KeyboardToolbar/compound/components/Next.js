import React, { useCallback } from "react";
import { KeyboardController } from "../../../../module";
import Arrow from "../../Arrow";
import Button from "../../Button";
import { TEST_ID_KEYBOARD_TOOLBAR_NEXT } from "../../constants";
import { useToolbarContext } from "../context";
const Next = ({
  children,
  onPress,
  disabled,
  rippleRadius,
  style,
  button: ButtonContainer = Button,
  icon: IconContainer = Arrow
}) => {
  const context = useToolbarContext();
  const {
    theme,
    isNextDisabled
  } = context;
  const isDisabled = disabled ?? isNextDisabled;
  const onPressNext = useCallback(event => {
    onPress === null || onPress === void 0 || onPress(event);
    if (!event.isDefaultPrevented()) {
      KeyboardController.setFocusTo("next");
    }
  }, [onPress]);
  return /*#__PURE__*/React.createElement(ButtonContainer, {
    accessibilityHint: "Moves focus to the next field",
    accessibilityLabel: "Next",
    disabled: isDisabled,
    rippleRadius: rippleRadius,
    style: style,
    testID: TEST_ID_KEYBOARD_TOOLBAR_NEXT,
    theme: theme,
    onPress: onPressNext
  }, children ?? /*#__PURE__*/React.createElement(IconContainer, {
    disabled: isDisabled,
    theme: theme,
    type: "next"
  }));
};
export default Next;
//# sourceMappingURL=Next.js.map