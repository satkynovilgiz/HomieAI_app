"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _bindings = require("../../bindings");
var _styles = _interopRequireDefault(require("./styles"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const OS = _reactNative.Platform.OS;
const ReanimatedClippingScrollView = OS === "android" ? _reactNativeReanimated.default.createAnimatedComponent(_bindings.ClippingScrollView) : _bindings.ClippingScrollView;
const ScrollViewWithBottomPadding = /*#__PURE__*/(0, _react.forwardRef)(({
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
  const prevContentOffsetY = (0, _reactNativeReanimated.useSharedValue)(null);
  const insets = (0, _reactNativeReanimated.useDerivedValue)(() => {
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
  (0, _reactNativeReanimated.useAnimatedReaction)(() => insets.value.effective, (current, previous) => {
    if (!onContentInsetChange) {
      return;
    }
    if (previous && current.top === previous.top && current.bottom === previous.bottom && current.left === previous.left && current.right === previous.right) {
      return;
    }
    (0, _reactNativeReanimated.runOnJS)(onContentInsetChange)(current);
  }, [onContentInsetChange]);
  const animatedProps = (0, _reactNativeReanimated.useAnimatedProps)(() => {
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
  return /*#__PURE__*/_react.default.createElement(ReanimatedClippingScrollView, {
    animatedProps: animatedProps,
    applyWorkaroundForContentInsetHitTestBug: applyWorkaroundForContentInsetHitTestBug,
    style: _styles.default.container
  }, /*#__PURE__*/_react.default.createElement(ScrollViewComponent, _extends({
    ref: ref,
    animatedProps: animatedProps
  }, rest), children));
});
var _default = exports.default = ScrollViewWithBottomPadding;
//# sourceMappingURL=index.js.map