import type { EventWithName, FocusedInputLayoutChangedEvent, FocusedInputLayoutHandlerHook, KeyboardHandlerHook, NativeEvent } from "./types";
export declare const useAnimatedKeyboardHandler: KeyboardHandlerHook<Record<string, unknown>, EventWithName<NativeEvent>>;
export declare const useFocusedInputLayoutHandler: FocusedInputLayoutHandlerHook<Record<string, unknown>, EventWithName<FocusedInputLayoutChangedEvent>>;
