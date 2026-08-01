import { useMemo } from "react";
import { runOnJS, useAnimatedReaction, useDerivedValue } from "react-native-reanimated";
import { isScrollAtEnd } from "./useChatKeyboard/helpers";
const hasWorkletHash = value => typeof value === "function" && !!value.__workletHash;
export const useEndVisible = ({
  scroll,
  layout,
  size,
  inverted,
  onEndVisible
}) => {
  const isWorklet = useMemo(() => hasWorkletHash(onEndVisible), [onEndVisible]);
  const isAtEnd = useDerivedValue(() => {
    // Wait until the scroll view has been measured to avoid a spurious initial
    // `true` on a (0,0,0) layout (the helper would otherwise treat unmeasured
    // state as "at end" because 0 + 0 >= 0 - threshold).
    if (layout.value.height === 0 || size.value.height === 0) {
      return null;
    }
    return isScrollAtEnd(scroll.value, layout.value.height, size.value.height, inverted);
  });
  useAnimatedReaction(() => isAtEnd.value, (current, previous) => {
    if (current === null || current === previous || !onEndVisible) {
      return;
    }
    if (isWorklet) {
      onEndVisible(current);
    } else {
      runOnJS(onEndVisible)(current);
    }
  }, [onEndVisible, isWorklet, inverted]);
};
//# sourceMappingURL=useEndVisible.js.map