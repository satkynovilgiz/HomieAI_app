"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAnimatedValue = useAnimatedValue;
exports.useEventHandlerRegistration = useEventHandlerRegistration;
var _react = require("react");
var _reactNative = require("react-native");
var _findNodeHandle = require("./utils/findNodeHandle");
/**
 * An internal hook that helps to register workletized event handlers.
 *
 * @param viewTagRef - Ref to the view that produces events.
 * @returns A function that registers supplied event handlers.
 * @example
 * ```ts
 * const setKeyboardHandlers = useEventHandlerRegistration<KeyboardHandler>(
 *     keyboardEventsMap,
 *     viewTagRef,
 * );
 * ```
 */
function useEventHandlerRegistration(viewTagRef) {
  const onRegisterHandler = handler => {
    const currentHandler = handler;
    const attachWorkletHandlers = () => {
      const viewTag = (0, _findNodeHandle.findNodeHandle)(viewTagRef.current);
      if (__DEV__ && !viewTag) {
        console.warn("Can not attach worklet handlers for `react-native-keyboard-controller` because view tag can not be resolved. Be sure that `KeyboardProvider` is fully mounted before registering handlers. If you think it is a bug in library, please open an issue.");
      }
      if (viewTag) {
        if ("workletEventHandler" in currentHandler) {
          currentHandler.workletEventHandler.registerForEvents(viewTag);
        } else {
          currentHandler.registerForEvents(viewTag);
        }
      }
    };
    if (viewTagRef.current) {
      attachWorkletHandlers();
    } else {
      // view may not be mounted yet - defer registration until call-stack becomes empty
      queueMicrotask(attachWorkletHandlers);
    }
    return () => {
      const viewTag = (0, _findNodeHandle.findNodeHandle)(viewTagRef.current);
      if (viewTag) {
        if ("workletEventHandler" in currentHandler) {
          currentHandler.workletEventHandler.unregisterFromEvents(viewTag);
        } else {
          currentHandler.unregisterFromEvents(viewTag);
        }
      }
    };
  };
  return onRegisterHandler;
}

/**
 * TS variant of `useAnimatedValue` hook which is added in RN 0.71
 * A better alternative of storing animated values in refs, since
 * it doesn't recreate a new `Animated.Value` object on every re-render
 * and therefore consumes less memory. We can not use a variant from
 * RN, since this library supports earlier versions of RN.
 *
 * @param initialValue - Initial value of the animated value (numeric).
 * @param config - Additional {@link Animated.AnimatedConfig|configuration} for the animated value.
 * @returns Properly memoized {@link Animated.Value|Animated} value.
 * @see https://github.com/facebook/react-native/commit/e22217fe8b9455e32695f88ca835e11442b0a937
 * @example
 * ```ts
 * const progress = useAnimatedValue(0);
 * ```
 */
function useAnimatedValue(initialValue, config) {
  const ref = (0, _react.useRef)(null);
  if (ref.current === null) {
    ref.current = new _reactNative.Animated.Value(initialValue, config);
  }
  return ref.current;
}
//# sourceMappingURL=internal.js.map