"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyboardProvider = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeIsEdgeToEdge = require("react-native-is-edge-to-edge");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _bindings = require("./bindings");
var _context = require("./context");
var _internal = require("./internal");
var _module = require("./module");
var _reanimated = require("./reanimated");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/* eslint react/jsx-sort-props: off */

const IS_EDGE_TO_EDGE = (0, _reactNativeIsEdgeToEdge.isEdgeToEdge)();
const KeyboardControllerViewAnimated = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.Animated.createAnimatedComponent(_bindings.KeyboardControllerView));
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1
  },
  hidden: {
    display: "none",
    position: "absolute"
  }
});

// capture `Platform.OS` in separate variable to avoid deep workletization of entire RN package
// see https://github.com/kirillzyusko/react-native-keyboard-controller/issues/393 and https://github.com/kirillzyusko/react-native-keyboard-controller/issues/294 for more details
const OS = _reactNative.Platform.OS;

/**
 * A component that wrap your app. Under the hood it works with {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/keyboard-controller-view|KeyboardControllerView} to receive events during keyboard movements,
 * maps these events to `Animated`/`Reanimated` values and store them in context.
 *
 * @param props - Provider props, such as `statusBarTranslucent`, `navigationBarTranslucent`, etc.
 * @returns A component that should be mounted in root of your App layout.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/keyboard-provider|Documentation} page for more details.
 * @example
 * ```tsx
 * <KeyboardProvider>
 *   <NavigationContainer />
 * </KeyboardProvider>
 * ```
 */
const KeyboardProvider = props => {
  const {
    children,
    statusBarTranslucent,
    navigationBarTranslucent,
    preserveEdgeToEdge,
    enabled: initiallyEnabled = true,
    preload = true
  } = props;
  // ref
  const viewRef = (0, _react.useRef)(null);
  // state
  const [enabled, setEnabled] = (0, _react.useState)(initiallyEnabled);
  // animated values
  const progress = (0, _internal.useAnimatedValue)(0);
  const height = (0, _internal.useAnimatedValue)(0);
  // shared values
  const progressSV = (0, _reactNativeReanimated.useSharedValue)(0);
  const heightSV = (0, _reactNativeReanimated.useSharedValue)(0);
  const layout = (0, _reactNativeReanimated.useSharedValue)(null);
  const setKeyboardHandlers = (0, _internal.useEventHandlerRegistration)(viewRef);
  const setInputHandlers = (0, _internal.useEventHandlerRegistration)(viewRef);
  const update = (0, _react.useCallback)(async () => {
    _bindings.KeyboardControllerViewCommands.synchronizeFocusedInputLayout(viewRef.current);
    await new Promise(resolve => {
      const subscription = _bindings.FocusedInputEvents.addListener("layoutDidSynchronize", () => {
        subscription.remove();
        resolve(null);
      });
    });
  }, []);
  // memo
  const context = (0, _react.useMemo)(() => ({
    enabled,
    animated: {
      progress: progress,
      height: _reactNative.Animated.multiply(height, -1)
    },
    reanimated: {
      progress: progressSV,
      height: heightSV
    },
    layout,
    update,
    setKeyboardHandlers,
    setInputHandlers,
    setEnabled
  }), [enabled]);
  const style = (0, _react.useMemo)(() => [styles.hidden, {
    transform: [{
      translateX: height
    }, {
      translateY: progress
    }]
  }], []);
  const onKeyboardMove = (0, _react.useMemo)(() => _reactNative.Animated.event([{
    nativeEvent: {
      progress,
      height
    }
  }],
  // Setting useNativeDriver to true on web triggers a warning due to the absence of a native driver for web. Therefore, it is set to false.
  {
    useNativeDriver: _reactNative.Platform.OS !== "web"
  }), []);
  // handlers
  const updateSharedValues = (event, platforms) => {
    "worklet";

    if (platforms.includes(OS)) {
      // eslint-disable-next-line react-compiler/react-compiler
      progressSV.value = event.progress;
      heightSV.value = -event.height;
    }
  };
  const keyboardHandler = (0, _reanimated.useAnimatedKeyboardHandler)({
    onKeyboardMoveStart: event => {
      "worklet";

      updateSharedValues(event, ["ios"]);
    },
    onKeyboardMove: event => {
      "worklet";

      updateSharedValues(event, ["android"]);
    },
    onKeyboardMoveInteractive: event => {
      "worklet";

      updateSharedValues(event, ["android", "ios"]);
    },
    onKeyboardMoveEnd: event => {
      "worklet";

      updateSharedValues(event, ["android"]);
    }
  }, []);
  const inputLayoutHandler = (0, _reanimated.useFocusedInputLayoutHandler)({
    onFocusedInputLayoutChanged: e => {
      "worklet";

      if (e.target !== -1) {
        layout.value = e;
      } else {
        layout.value = null;
      }
    }
  }, []);
  (0, _react.useEffect)(() => {
    if (preload) {
      _module.KeyboardController.preload();
    }
  }, [preload]);
  if (__DEV__) {
    (0, _reactNativeIsEdgeToEdge.controlEdgeToEdgeValues)({
      statusBarTranslucent,
      navigationBarTranslucent,
      preserveEdgeToEdge
    });
  }
  return /*#__PURE__*/_react.default.createElement(_context.KeyboardContext.Provider, {
    value: context
  }, /*#__PURE__*/_react.default.createElement(KeyboardControllerViewAnimated, {
    ref: viewRef,
    enabled: enabled,
    navigationBarTranslucent: IS_EDGE_TO_EDGE || navigationBarTranslucent,
    statusBarTranslucent: IS_EDGE_TO_EDGE || statusBarTranslucent,
    preserveEdgeToEdge: IS_EDGE_TO_EDGE || preserveEdgeToEdge,
    style: styles.container
    // on*Reanimated prop must precede animated handlers to work correctly
    ,
    onKeyboardMoveReanimated: keyboardHandler,
    onKeyboardMoveStart: OS === "ios" ? onKeyboardMove : undefined,
    onKeyboardMove: OS === "android" ? onKeyboardMove : undefined,
    onKeyboardMoveInteractive: onKeyboardMove,
    onKeyboardMoveEnd: OS === "android" ? onKeyboardMove : undefined,
    onFocusedInputLayoutChangedReanimated: inputLayoutHandler
  }, children), /*#__PURE__*/_react.default.createElement(_reactNative.Animated.View, {
    // we are using this small hack, because if the component (where
    // animated value has been used) is unmounted, then animation will
    // stop receiving events (seems like it's react-native optimization).
    // So we need to keep a reference to the animated value, to keep it's
    // always mounted (keep a reference to an animated value).
    //
    // To test why it's needed, try to open screen which consumes Animated.Value
    // then close it and open it again (for example 'Animated transition').
    style: style
  }));
};
exports.KeyboardProvider = KeyboardProvider;
//# sourceMappingURL=animated.js.map