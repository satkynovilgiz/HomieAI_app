import { useKeyboardHandler } from "../../hooks";
/**
 * Hook that uses default transitions for iOS and Android > 11, and uses
 * custom interpolation on Android < 11 to achieve more smooth animation.
 *
 * @param handler - Object containing keyboard event handlers.
 * @param [deps] - Dependencies array for the effect.
 * @example
 * ```ts
 * useSmoothKeyboardHandler(
 *   {
 *     onStart: (e) => {
 *       "worklet";
 *
 *       // your handler for keyboard start
 *     },
 *   },
 *   [],
 * );
 * ```
 */
export declare const useSmoothKeyboardHandler: typeof useKeyboardHandler;
