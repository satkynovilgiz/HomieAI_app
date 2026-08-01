import { NativeEventEmitter, Platform } from "react-native";
const LINKING_ERROR = `The package 'react-native-keyboard-controller' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ""
}) + "- You rebuilt the app after installing the package\n" + "- You are not using Expo Go\n";
const KeyboardControllerViewNativeComponentModule = require("./specs/KeyboardControllerViewNativeComponent");
const RCTKeyboardController = require("./specs/NativeKeyboardController").default;
export const KeyboardControllerNative = RCTKeyboardController ? RCTKeyboardController : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const KEYBOARD_CONTROLLER_NAMESPACE = "KeyboardController::";
const eventEmitter = new NativeEventEmitter(KeyboardControllerNative);
export const KeyboardEvents = {
  addListener: (name, cb) => eventEmitter.addListener(KEYBOARD_CONTROLLER_NAMESPACE + name, cb)
};

/**
 * This API is not documented, it's for internal usage only (for now), and is a subject to potential breaking changes in future.
 * Use it with cautious.
 */
export const FocusedInputEvents = {
  addListener: (name, cb) => eventEmitter.addListener(KEYBOARD_CONTROLLER_NAMESPACE + name, cb)
};
export const WindowDimensionsEvents = {
  addListener: (name, cb) => eventEmitter.addListener(KEYBOARD_CONTROLLER_NAMESPACE + name, cb)
};
export const KeyboardControllerView = KeyboardControllerViewNativeComponentModule.default;
export const KeyboardControllerViewCommands = KeyboardControllerViewNativeComponentModule.Commands;
export const KeyboardGestureArea = Platform.OS === "android" && Platform.Version >= 30 || Platform.OS === "ios" ? require("./specs/KeyboardGestureAreaNativeComponent").default : ({
  children
}) => children;
export const RCTOverKeyboardView = require("./specs/OverKeyboardViewNativeComponent").default;
export const KeyboardBackgroundView = require("./specs/KeyboardBackgroundViewNativeComponent").default;
export const RCTKeyboardExtender = Platform.OS === "ios" ? require("./specs/KeyboardExtenderNativeComponent").default : ({
  children
}) => children;
export const ClippingScrollView = require("./specs/ClippingScrollViewDecoratorViewNativeComponent").default;
export const RCTKeyboardToolbarGroupView = require("./specs/KeyboardToolbarGroupViewNativeComponent").default;
//# sourceMappingURL=bindings.native.js.map