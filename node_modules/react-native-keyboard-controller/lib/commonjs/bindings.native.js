"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WindowDimensionsEvents = exports.RCTOverKeyboardView = exports.RCTKeyboardToolbarGroupView = exports.RCTKeyboardExtender = exports.KeyboardGestureArea = exports.KeyboardEvents = exports.KeyboardControllerViewCommands = exports.KeyboardControllerView = exports.KeyboardControllerNative = exports.KeyboardBackgroundView = exports.FocusedInputEvents = exports.ClippingScrollView = void 0;
var _reactNative = require("react-native");
const LINKING_ERROR = `The package 'react-native-keyboard-controller' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ""
}) + "- You rebuilt the app after installing the package\n" + "- You are not using Expo Go\n";
const KeyboardControllerViewNativeComponentModule = require("./specs/KeyboardControllerViewNativeComponent");
const RCTKeyboardController = require("./specs/NativeKeyboardController").default;
const KeyboardControllerNative = exports.KeyboardControllerNative = RCTKeyboardController ? RCTKeyboardController : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const KEYBOARD_CONTROLLER_NAMESPACE = "KeyboardController::";
const eventEmitter = new _reactNative.NativeEventEmitter(KeyboardControllerNative);
const KeyboardEvents = exports.KeyboardEvents = {
  addListener: (name, cb) => eventEmitter.addListener(KEYBOARD_CONTROLLER_NAMESPACE + name, cb)
};

/**
 * This API is not documented, it's for internal usage only (for now), and is a subject to potential breaking changes in future.
 * Use it with cautious.
 */
const FocusedInputEvents = exports.FocusedInputEvents = {
  addListener: (name, cb) => eventEmitter.addListener(KEYBOARD_CONTROLLER_NAMESPACE + name, cb)
};
const WindowDimensionsEvents = exports.WindowDimensionsEvents = {
  addListener: (name, cb) => eventEmitter.addListener(KEYBOARD_CONTROLLER_NAMESPACE + name, cb)
};
const KeyboardControllerView = exports.KeyboardControllerView = KeyboardControllerViewNativeComponentModule.default;
const KeyboardControllerViewCommands = exports.KeyboardControllerViewCommands = KeyboardControllerViewNativeComponentModule.Commands;
const KeyboardGestureArea = exports.KeyboardGestureArea = _reactNative.Platform.OS === "android" && _reactNative.Platform.Version >= 30 || _reactNative.Platform.OS === "ios" ? require("./specs/KeyboardGestureAreaNativeComponent").default : ({
  children
}) => children;
const RCTOverKeyboardView = exports.RCTOverKeyboardView = require("./specs/OverKeyboardViewNativeComponent").default;
const KeyboardBackgroundView = exports.KeyboardBackgroundView = require("./specs/KeyboardBackgroundViewNativeComponent").default;
const RCTKeyboardExtender = exports.RCTKeyboardExtender = _reactNative.Platform.OS === "ios" ? require("./specs/KeyboardExtenderNativeComponent").default : ({
  children
}) => children;
const ClippingScrollView = exports.ClippingScrollView = require("./specs/ClippingScrollViewDecoratorViewNativeComponent").default;
const RCTKeyboardToolbarGroupView = exports.RCTKeyboardToolbarGroupView = require("./specs/KeyboardToolbarGroupViewNativeComponent").default;
//# sourceMappingURL=bindings.native.js.map