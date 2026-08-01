"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTranslateAnimation = exports.useKeyboardAnimation = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _reactNativeReanimated = require("react-native-reanimated");
var _context = require("../../context");
var _hooks = require("../../hooks");
const OS = _reactNative.Platform.OS;
const useKeyboardAnimation = () => {
  const {
    reanimated
  } = (0, _context.useKeyboardContext)();
  const heightWhenOpened = (0, _reactNativeReanimated.useSharedValue)(0);
  const height = (0, _reactNativeReanimated.useSharedValue)(0);
  const progress = (0, _reactNativeReanimated.useSharedValue)(0);
  const isClosed = (0, _reactNativeReanimated.useSharedValue)(true);
  (0, _react.useLayoutEffect)(() => {
    const initialHeight = -reanimated.height.value;
    const initialProgress = reanimated.progress.value;

    // eslint-disable-next-line react-compiler/react-compiler
    heightWhenOpened.value = initialHeight;
    height.value = initialHeight;
    progress.value = initialProgress;
    isClosed.value = initialProgress === 0;
  }, []);
  (0, _hooks.useKeyboardHandler)({
    onStart: e => {
      "worklet";

      if (e.height > 0) {
        isClosed.value = false;
        heightWhenOpened.value = e.height;
      }
    },
    onMove: e => {
      "worklet";

      progress.value = e.progress;
      height.value = e.height;
    },
    onInteractive: e => {
      "worklet";

      progress.value = e.progress;
      height.value = e.height;
    },
    onEnd: e => {
      "worklet";

      isClosed.value = e.height === 0;
      height.value = e.height;
      progress.value = e.progress;
    }
  }, []);
  return {
    height,
    progress,
    heightWhenOpened,
    isClosed
  };
};
exports.useKeyboardAnimation = useKeyboardAnimation;
const useTranslateAnimation = () => {
  const {
    reanimated
  } = (0, _context.useKeyboardContext)();
  const padding = (0, _reactNativeReanimated.useSharedValue)(0);
  const translate = (0, _reactNativeReanimated.useSharedValue)(0);
  (0, _react.useLayoutEffect)(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    padding.value = reanimated.progress.value;
  }, []);
  (0, _hooks.useKeyboardHandler)({
    onStart: e => {
      "worklet";

      if (e.height === 0) {
        padding.value = 0;
      }
      if (OS === "ios") {
        translate.value = e.progress;
      }
    },
    onMove: e => {
      "worklet";

      if (OS !== "ios") {
        translate.value = e.progress;
      }
    },
    onInteractive: e => {
      "worklet";

      padding.value = 0;
      translate.value = e.progress;
    },
    onEnd: e => {
      "worklet";

      padding.value = e.progress;
      if (OS !== "ios") {
        translate.value = e.progress;
      }
    }
  }, []);
  return {
    translate,
    padding
  };
};
exports.useTranslateAnimation = useTranslateAnimation;
//# sourceMappingURL=hooks.js.map