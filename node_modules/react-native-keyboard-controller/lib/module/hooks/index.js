import { useEffect, useLayoutEffect } from "react";
import { useEvent, useHandler } from "react-native-reanimated";
import { AndroidSoftInputModes } from "../constants";
import { useKeyboardContext } from "../context";
import { KeyboardController } from "../module";
/**
 * Hook that sets the Android soft input mode to adjust resize on mount and
 * restores default mode on unmount. This ensures the keyboard behavior is consistent
 * on all Android versions.
 *
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/keyboard-controller#setinputmode-|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   useResizeMode();
 *   return <View />;
 * }
 * ```
 */
export const useResizeMode = () => {
  useEffect(() => {
    KeyboardController.setInputMode(AndroidSoftInputModes.SOFT_INPUT_ADJUST_RESIZE);
    return () => KeyboardController.setDefaultMode();
  }, []);
};

/**
 * Hook that provides animated (`height`/`progress`) values for tracking keyboard movement.
 * Automatically sets the resize mode for Android.
 *
 * @returns Object {@link AnimatedContext|containing} animated values for keyboard movement.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-keyboard-animation|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { height, progress } = useKeyboardAnimation();
 *   return <Animated.View style={{ transform: [{ translateY: height }] }} />;
 * }
 * ```
 */
export const useKeyboardAnimation = () => {
  useResizeMode();
  const context = useKeyboardContext();
  return context.animated;
};

/**
 * Hook that provides reanimated (`height`/`progress`) values for tracking keyboard movement.
 * Automatically sets the resize mode for Android.
 *
 * @returns Object {@link ReanimatedContext|containing} reanimated values for keyboard movement.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-reanimated-keyboard-animation|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { height, progress } = useReanimatedKeyboardAnimation();
 *   return <Reanimated.View style={{ transform: [{ translateY: height }] }} />;
 * }
 * ```
 */
export const useReanimatedKeyboardAnimation = () => {
  useResizeMode();
  const context = useKeyboardContext();
  return context.reanimated;
};

/**
 * An alternative to {@link useKeyboardHandler} that doesn't set resize mode on mount. If your
 * app already uses `adjustResize`, then you can use this hook instead of `useKeyboardHandler`.
 *
 * @param handler - Object containing keyboard event handlers.
 * @param [deps] - Dependencies array for the effect.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const height = useSharedValue(0);
 *   const progress = useSharedValue(0);
 *
 *   useGenericKeyboardHandler({
 *     onMove: (e) => {
 *       "worklet";
 *
 *       height.value = e.height;
 *       progress.value = e.progress;
 *     },
 *     onEnd: (e) => {
 *       "worklet";
 *
 *       height.value = e.height;
 *       progress.value = e.progress;
 *     },
 *   }, []);
 *
 *   return <Reanimated.View style={{ height: height }] }} />;
 * }
 * ```
 */
export function useGenericKeyboardHandler(handler, deps) {
  const context = useKeyboardContext();
  const {
    doDependenciesDiffer
  } = useHandler(handler, deps);
  const eventHandler = useEvent(event => {
    "worklet";

    if (event.eventName.endsWith("onKeyboardMoveStart")) {
      var _handler$onStart;
      (_handler$onStart = handler.onStart) === null || _handler$onStart === void 0 || _handler$onStart.call(handler, event);
    }
    if (event.eventName.endsWith("onKeyboardMove")) {
      var _handler$onMove;
      (_handler$onMove = handler.onMove) === null || _handler$onMove === void 0 || _handler$onMove.call(handler, event);
    }
    if (event.eventName.endsWith("onKeyboardMoveEnd")) {
      var _handler$onEnd;
      (_handler$onEnd = handler.onEnd) === null || _handler$onEnd === void 0 || _handler$onEnd.call(handler, event);
    }
    if (event.eventName.endsWith("onKeyboardMoveInteractive")) {
      var _handler$onInteractiv;
      (_handler$onInteractiv = handler.onInteractive) === null || _handler$onInteractiv === void 0 || _handler$onInteractiv.call(handler, event);
    }
  }, ["onKeyboardMoveStart", "onKeyboardMove", "onKeyboardMoveEnd", "onKeyboardMoveInteractive"], doDependenciesDiffer);
  useLayoutEffect(() => {
    const cleanup = context.setKeyboardHandlers(eventHandler);
    return () => cleanup();
  }, deps);
}

/**
 * Hook that gives an access to each aspect of keyboard movement with workletized `onStart`/`onMove`/`onInteractive`/`onEnd` handlers.
 *
 * @param handler - Object containing keyboard event handlers.
 * @param [deps] - Dependencies array for the effect.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/keyboard/use-keyboard-handler|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const height = useSharedValue(0);
 *   const progress = useSharedValue(0);
 *
 *   useKeyboardHandler({
 *     onMove: (e) => {
 *       "worklet";
 *
 *       height.value = e.height;
 *       progress.value = e.progress;
 *     },
 *     onEnd: (e) => {
 *       "worklet";
 *
 *       height.value = e.height;
 *       progress.value = e.progress;
 *     },
 *   }, []);
 *
 *   return <Reanimated.View style={{ height: height }] }} />;
 * }
 * ```
 */
export function useKeyboardHandler(handler, deps) {
  useResizeMode();
  useGenericKeyboardHandler(handler, deps);
}

/**
 * Hook for controlling keyboard controller module.
 * Allows to disable/enable it and check the actual state (whether it's enabled or not).
 * When disabled it fallbacks to default android keyboard handling and stops tracking all
 * the events that are exposed from this library.
 *
 * @property {Function} setEnabled - Function to enable/disable keyboard handling.
 * @property {boolean} enabled - Current enabled state.
 * @returns Object containing keyboard control functions and state.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/module/use-keyboard-controller|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { setEnabled, enabled } = useKeyboardController();
 *   return (
 *     <Button
 *       title={enabled ? 'Disable' : 'Enable'}
 *       onPress={() => setEnabled(!enabled)}
 *     />
 *   );
 * }
 * ```
 */
export function useKeyboardController() {
  const context = useKeyboardContext();
  return {
    setEnabled: context.setEnabled,
    enabled: context.enabled
  };
}

/**
 * Hook that provides access to the layout of the currently focused input.
 *
 * @returns Object containing reanimated values for focused input.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/input/use-reanimated-focused-input|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { input } = useReanimatedFocusedInput();
 *   return <Reanimated.View style={{ height: input.value?.layout.height }} />;
 * }
 * ```
 */
export function useReanimatedFocusedInput() {
  const context = useKeyboardContext();
  return {
    input: context.layout,
    update: context.update
  };
}

/**
 * Hook for handling focused input events, such as changes of selection, text etc.
 *
 * @param handler - Object containing focused input event handlers.
 * @param [deps] - Dependencies array for the effect.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/hooks/input/use-focused-input-handler|Documentation} page for more details.
 * @example
 * ```tsx
 * function MyComponent() {
 *   useFocusedInputHandler({
 *     onChangeText: (e) => console.log('Text changed:', e.text),
 *     onSelectionChange: (e) => console.log('Selection changed:', e.selection)
 *   });
 *   return <View />;
 * }
 * ```
 */
export function useFocusedInputHandler(handler, deps) {
  const context = useKeyboardContext();
  const {
    doDependenciesDiffer
  } = useHandler(handler, deps);
  const eventHandler = useEvent(event => {
    "worklet";

    if (event.eventName.endsWith("onFocusedInputTextChanged")) {
      var _handler$onChangeText;
      (_handler$onChangeText = handler.onChangeText) === null || _handler$onChangeText === void 0 || _handler$onChangeText.call(handler, event);
    }
    if (event.eventName.endsWith("onFocusedInputSelectionChanged")) {
      var _handler$onSelectionC;
      (_handler$onSelectionC = handler.onSelectionChange) === null || _handler$onSelectionC === void 0 || _handler$onSelectionC.call(handler, event);
    }
  }, ["onFocusedInputTextChanged", "onFocusedInputSelectionChanged"], doDependenciesDiffer);
  useLayoutEffect(() => {
    const cleanup = context.setInputHandlers(eventHandler);
    return () => cleanup();
  }, deps);
}
export * from "./useWindowDimensions";
export * from "./useKeyboardState";
//# sourceMappingURL=index.js.map