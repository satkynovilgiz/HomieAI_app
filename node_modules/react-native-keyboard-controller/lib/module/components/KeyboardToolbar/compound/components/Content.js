import React from "react";
import { StyleSheet, View } from "react-native";
import { TEST_ID_KEYBOARD_TOOLBAR_CONTENT } from "../../constants";
const Content = ({
  children
}) => {
  return /*#__PURE__*/React.createElement(View, {
    style: styles.flex,
    testID: TEST_ID_KEYBOARD_TOOLBAR_CONTENT
  }, children);
};
const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
export default Content;
//# sourceMappingURL=Content.js.map