import React from "react";
import { useCallback } from "react";
import { KeyboardController } from "../../../../module";
import Arrow from "../../Arrow";
import Button from "../../Button";
import { TEST_ID_KEYBOARD_TOOLBAR_PREVIOUS } from "../../constants";
import { useToolbarContext } from "../context";
const Prev = ({
  children,
  onPress: onPressCallback,
  disabled,
  rippleRadius,
  style,
  button: ButtonContainer = Button,
  icon: IconContainer = Arrow
}) => {
  const context = useToolbarContext();
  const {
    theme,
    isPrevDisabled
  } = context;
  const isDisabled = disabled ?? isPrevDisabled;
  const onPressPrev = useCallback(event => {
    onPressCallback === null || onPressCallback === void 0 || onPressCallback(event);
    if (!event.isDefaultPrevented()) {
      KeyboardController.setFocusTo("prev");
    }
  }, [onPressCallback]);
  return /*#__PURE__*/React.createElement(ButtonContainer, {
    accessibilityHint: "Moves focus to the previous field",
    accessibilityLabel: "Previous",
    disabled: isDisabled,
    rippleRadius: rippleRadius,
    style: style,
    testID: TEST_ID_KEYBOARD_TOOLBAR_PREVIOUS,
    theme: theme,
    onPress: onPressPrev
  }, children ?? /*#__PURE__*/React.createElement(IconContainer, {
    disabled: isDisabled,
    theme: theme,
    type: "prev"
  }));
};
export default Prev;
//# sourceMappingURL=Prev.js.map