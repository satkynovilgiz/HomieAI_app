import React from "react";
import type { KeyboardAwareScrollViewRef } from "react-native-keyboard-controller";
/**
 * A ScrollView component that automatically handles keyboard appearance and disappearance
 * by adjusting its content position to ensure the focused input remains visible.
 *
 * The component uses a sophisticated animation system to smoothly handle keyboard transitions
 * and maintain proper scroll position during keyboard interactions.
 *
 * @returns A ScrollView component that handles keyboard interactions.
 * @see {@link https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-aware-scroll-view|Documentation} page for more details.
 * @example
 * ```tsx
 * <KeyboardAwareScrollView bottomOffset={20}>
 *   <TextInput placeholder="Enter text" />
 *   <TextInput placeholder="Another input" />
 * </KeyboardAwareScrollView>
 * ```
 */
declare const KeyboardAwareScrollView: React.ForwardRefExoticComponent<{
    bottomOffset?: number;
    disableScrollOnKeyboardHide?: boolean;
    enabled?: boolean;
    extraKeyboardSpace?: number;
    mode?: import("react-native-keyboard-controller").KeyboardAwareScrollViewMode;
    ScrollViewComponent?: import("../ScrollViewWithBottomPadding").AnimatedScrollViewComponent;
} & import("react-native").ScrollViewProps & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<KeyboardAwareScrollViewRef>>;
export default KeyboardAwareScrollView;
