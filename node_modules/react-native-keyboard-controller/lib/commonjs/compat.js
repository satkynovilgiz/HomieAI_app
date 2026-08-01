"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAnimatedKeyboard = exports.KeyboardState = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
var _hooks = require("./hooks");
const KeyboardState = exports.KeyboardState = {
  UNKNOWN: 0,
  OPENING: 1,
  OPEN: 2,
  CLOSING: 3,
  CLOSED: 4
};

/**
 * A compatibility layer for migration from https://docs.swmansion.com/react-native-reanimated/docs/device/useAnimatedKeyboard.
 *
 * @returns An object containing `height` and `state` properties represented as `SharedValue<number>`.
 * @example
 * ```ts
 * import { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-keyboard-controller';
 *
 * export default function App() {
 *   const keyboard = useAnimatedKeyboard();
 *
 *   const animatedStyles = useAnimatedStyle(() => ({
 *     transform: [{ translateY: -keyboard.height.value }],
 *   }));
 * }
 */
const useAnimatedKeyboard = () => {
  const height = (0, _reactNativeReanimated.useSharedValue)(0);
  const state = (0, _reactNativeReanimated.useSharedValue)(KeyboardState.UNKNOWN);
  (0, _hooks.useKeyboardHandler)({
    onStart: e => {
      "worklet";

      state.set(e.height > 0 ? KeyboardState.OPENING : KeyboardState.CLOSING);
    },
    onMove: e => {
      "worklet";

      height.set(e.height);
    },
    onInteractive: e => {
      "worklet";

      height.set(e.height);
    },
    onEnd: e => {
      "worklet";

      state.set(e.height > 0 ? KeyboardState.OPEN : KeyboardState.CLOSED);
      height.set(e.height);
    }
  }, []);
  return {
    height,
    state
  };
};
exports.useAnimatedKeyboard = useAnimatedKeyboard;
//# sourceMappingURL=compat.js.map