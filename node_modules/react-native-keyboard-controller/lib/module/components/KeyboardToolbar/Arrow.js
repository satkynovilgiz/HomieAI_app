import React, { useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useKeyboardState } from "../../hooks";
const ArrowComponent = ({
  type,
  disabled,
  theme
}) => {
  const colorScheme = useKeyboardState(state => state.appearance);
  const color = useMemo(() => ({
    backgroundColor: disabled ? theme[colorScheme].disabled : theme[colorScheme].primary
  }), [disabled, theme, colorScheme]);
  const left = useMemo(() => [styles.arrowLeftLine, color], [color]);
  const right = useMemo(() => [styles.arrowRightLine, color], [color]);
  return /*#__PURE__*/React.createElement(View, {
    style: type === "next" ? styles.arrowDownContainer : styles.arrowUpContainer
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.arrow
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: left
  }), /*#__PURE__*/React.createElement(Animated.View, {
    style: right
  })));
};
const arrowLine = {
  width: 13,
  height: 2,
  borderRadius: 1
};
const arrowUpContainer = {
  marginHorizontal: 5,
  width: 30,
  height: 30,
  justifyContent: "center",
  alignItems: "center"
};
const styles = StyleSheet.create({
  arrowUpContainer: arrowUpContainer,
  arrowDownContainer: {
    ...arrowUpContainer,
    transform: [{
      rotate: "180deg"
    }]
  },
  arrow: {
    width: 20,
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  arrowLeftLine: {
    ...arrowLine,
    transform: [{
      rotate: "-45deg"
    }],
    left: -0.5
  },
  arrowRightLine: {
    ...arrowLine,
    transform: [{
      rotate: "45deg"
    }],
    left: -5.5
  }
});
export default ArrowComponent;
//# sourceMappingURL=Arrow.js.map