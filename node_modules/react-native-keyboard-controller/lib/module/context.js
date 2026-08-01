import { createContext, useContext } from "react";
import { Animated } from "react-native";
const NOOP = () => {};
const NESTED_NOOP = () => NOOP;
const withSharedValue = value => ({
  value,
  addListener: NOOP,
  removeListener: NOOP,
  modify: NOOP,
  get: () => value,
  set: NOOP
});
const DEFAULT_SHARED_VALUE = withSharedValue(0);
const DEFAULT_LAYOUT = withSharedValue(null);
const defaultContext = {
  enabled: true,
  animated: {
    progress: new Animated.Value(0),
    height: new Animated.Value(0)
  },
  reanimated: {
    progress: DEFAULT_SHARED_VALUE,
    height: DEFAULT_SHARED_VALUE
  },
  layout: DEFAULT_LAYOUT,
  update: Promise.resolve,
  setKeyboardHandlers: NESTED_NOOP,
  setInputHandlers: NESTED_NOOP,
  setEnabled: NOOP
};
export const KeyboardContext = /*#__PURE__*/createContext(defaultContext);

/**
 * A hook that returns a reference to {@link KeyboardAnimationContext} object.
 *
 * @returns Object {@link KeyboardAnimationContext|containing} keyboard-controller context.
 * @example
 * ```ts
 *   const context = useKeyboardContext();
 *
 *   useLayoutEffect(() => {
 *     const cleanup = context.setInputHandlers(handler);
 *
 *     return () => cleanup();
 *   }, deps);
 * ```
 */
export const useKeyboardContext = () => {
  const context = useContext(KeyboardContext);
  if (__DEV__ && context === defaultContext) {
    console.warn("Couldn't find real values for `KeyboardContext`. Please make sure you're inside of `KeyboardProvider` - otherwise functionality of `react-native-keyboard-controller` will not work.");
  }
  return context;
};
//# sourceMappingURL=context.js.map