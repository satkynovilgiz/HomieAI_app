import React from "react";
import Reanimated from "react-native-reanimated";
declare const KeyboardChatScrollView: React.ForwardRefExoticComponent<{
    ScrollViewComponent?: import("../ScrollViewWithBottomPadding").AnimatedScrollViewComponent;
    inverted?: boolean;
    offset?: number;
    keyboardLiftBehavior?: import("./hooks").KeyboardLiftBehavior;
    freeze?: boolean | import("react-native-reanimated").SharedValue<boolean>;
    extraContentPadding?: import("react-native-reanimated").SharedValue<number>;
    applyWorkaroundForContentInsetHitTestBug?: boolean;
    blankSpace?: import("react-native-reanimated").SharedValue<number>;
    onContentInsetChange?: (insets: import("../ScrollViewWithBottomPadding").ScrollViewContentInsets) => void;
    onEndVisible?: (visible: boolean) => void;
} & import("react-native").ScrollViewProps & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<Reanimated.ScrollView>>;
export default KeyboardChatScrollView;
