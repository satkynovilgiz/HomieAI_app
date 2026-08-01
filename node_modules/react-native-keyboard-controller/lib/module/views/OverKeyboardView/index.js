import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { RCTOverKeyboardView } from "../../bindings";
import { useWindowDimensions } from "../../hooks";
/**
 * A view component that renders its children over the keyboard without closing the keyboard.
 * Acts similar to modal, but doesn't close the keyboard when it's visible.
 *
 * @param props - Component props.
 * @returns A view component that renders over the keyboard.
 * @example
 * ```tsx
 * <OverKeyboardView visible={true}>
 *   <Text>This will appear over the keyboard</Text>
 * </OverKeyboardView>
 * ```
 */
const OverKeyboardView = props => {
  const {
    children,
    visible
  } = props;
  const {
    height,
    width
  } = useWindowDimensions();
  const inner = useMemo(() => ({
    height,
    width
  }), [height, width]);
  const style = useMemo(() => [styles.absolute,
  // On iOS - stretch view to full window dimensions to make yoga work
  Platform.OS === "ios" ? inner : undefined,
  // On Android - we are laid out by ShadowNode, so just stretch to full container
  Platform.OS === "android" ? styles.stretch : undefined], [inner]);
  return /*#__PURE__*/React.createElement(RCTOverKeyboardView, {
    visible: visible
  }, /*#__PURE__*/React.createElement(View, {
    collapsable: false,
    style: style
  }, visible && children));
};
const styles = StyleSheet.create({
  absolute: {
    position: "absolute"
  },
  stretch: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});
export default OverKeyboardView;
//# sourceMappingURL=index.js.map