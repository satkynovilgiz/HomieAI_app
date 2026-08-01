import type { EventWithName, FocusedInputLayoutChangedEvent, FocusedInputLayoutHandlerHook, KeyboardHandlerHook, NativeEvent } from "./types";
type EventContext = Record<string, unknown>;
export declare const useAnimatedKeyboardHandler: KeyboardHandlerHook<EventContext, EventWithName<NativeEvent>>;
export declare const useFocusedInputLayoutHandler: FocusedInputLayoutHandlerHook<EventContext, EventWithName<FocusedInputLayoutChangedEvent>>;
export {};
