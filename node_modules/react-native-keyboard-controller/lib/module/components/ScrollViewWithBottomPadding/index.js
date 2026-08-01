function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef } from "react";
import { Platform } from "react-native";
import Reanimated, { runOnJS, useAnimatedProps, useAnimatedReaction, useDerivedValue, useSharedValue } from "react-native-reanimated";
import { ClippingScrollView } from "../../bindings";
import styles from "./styles";
const OS = Platform.OS;
const ReanimatedClippingScrollView = OS === "android" ? Reanimated.createAnimatedComponent(ClippingScrollView) : ClippingScrollView;
const ScrollViewWithBottomPadding = /*#__PURE__*/forwardRef(({
  ScrollViewComponent,
  bottomPadding,
  scrollIndicatorPadding,
  contentInset,
  scrollIndicatorInsets,
  inverted,
  contentOffsetY,
  applyWorkaroundForContentInsetHitTestBug,
  onContentInsetChange,
  children,
  ...rest
}, ref) => {
  const prevContentOffsetY = useSharedValue(null);
  const insets = useDerivedValue(() => {
    const dynamicTop = inverted ? bottomPadding.value : 0;
    const dynamicBottom = !inverted ? bottomPadding.value : 0;
    return {
      dynamic: {
        top: dynamicTop,
        bottom: dynamicBottom
      },
      effective: {
        top: dynamicTop + ((contentInset === null || contentInset === void 0 ? void 0 : contentInset.top) || 0),
        bottom: dynamicBottom + ((contentInset === null || contentInset === void 0 ? void 0 : contentInset.bottom) || 0),
        left: (contentInset === null || contentInset === void 0 ? void 0 : contentInset.left) || 0,
        right: (contentInset === null || contentInset === void 0 ? void 0 : contentInset.right) || 0
      }
    };
  }, [inverted, contentInset === null || contentInset === void 0 ? void 0 : contentInset.top, contentInset === null || contentInset === void 0 ? void 0 : contentInset.bottom, contentInset === null || contentInset === void 0 ? void 0 : contentInset.left, contentInset === null || contentInset === void 0 ? void 0 : contentInset.right]);
  useAnimatedReaction(() => insets.value.effective, (current, previous) => {
    if (!onContentInsetChange) {
      return;
    }
    if (previous && current.top === previous.top && current.bottom === previous.bottom && current.left === previous.left && current.right === previous.right) {
      return;
    }
    runOnJS(onContentInsetChange)(current);
  }, [onContentInsetChange]);
  const animatedProps = useAnimatedProps(() => {
    const {
      dynamic,
      effective
    } = insets.value;
    const indicatorPadding = scrollIndicatorPadding ?? bottomPadding;
    const indicatorTop = (inverted ? indicatorPadding.value : 0) + ((scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.top) || 0);
    const indicatorBottom = (!inverted ? indicatorPadding.value : 0) + ((scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.bottom) || 0);
    const result = {
      // iOS prop
      contentInset: effective,
      scrollIndicatorInsets: {
        bottom: indicatorBottom,
        top: indicatorTop,
        right: scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.right,
        left: scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.left
      },
      // Android prop
      contentInsetBottom: dynamic.bottom,
      contentInsetTop: dynamic.top
    };
    if (contentOffsetY) {
      const curr = contentOffsetY.value;
      if (prevContentOffsetY.value === null) {
        // Swallow the initial evaluation: emitting `contentOffset {x:0,y:0}`
        // in the first animatedProps run overrides the wrapped ScrollView's
        // own `contentOffset` prop on Fabric (e.g. a list's initial scroll
        // offset), making the list mount scrolled to the top natively.
        // eslint-disable-next-line react-compiler/react-compiler
        prevContentOffsetY.value = curr;
      } else if (curr !== prevContentOffsetY.value) {
        prevContentOffsetY.value = curr;
        result.contentOffset = {
          x: 0,
          y: curr
        };
      }
    }
    return result;
  }, [scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.bottom, scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.top, scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.right, scrollIndicatorInsets === null || scrollIndicatorInsets === void 0 ? void 0 : scrollIndicatorInsets.left, inverted, contentOffsetY]);
  return /*#__PURE__*/React.createElement(ReanimatedClippingScrollView, {
    animatedProps: animatedProps,
    applyWorkaroundForContentInsetHitTestBug: applyWorkaroundForContentInsetHitTestBug,
    style: styles.container
  }, /*#__PURE__*/React.createElement(ScrollViewComponent, _extends({
    ref: ref,
    animatedProps: animatedProps
  }, rest), children));
});
export default ScrollViewWithBottomPadding;
//# sourceMappingURL=index.js.map