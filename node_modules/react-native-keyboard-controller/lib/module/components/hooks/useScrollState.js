import { useCallback, useEffect } from "react";
import { useEvent, useSharedValue } from "react-native-reanimated";
import { useEventHandlerRegistration } from "../../internal";
const NATIVE_SCROLL_EVENT_NAMES = ["onScroll", "onScrollBeginDrag", "onScrollEndDrag", "onMomentumScrollBegin", "onMomentumScrollEnd"];
const useScrollState = ref => {
  const offset = useSharedValue(0);
  const layout = useSharedValue({
    width: 0,
    height: 0
  });
  const size = useSharedValue({
    width: 0,
    height: 0
  });
  const register = useEventHandlerRegistration(ref);
  const eventHandler = useEvent(event => {
    "worklet";

    // eslint-disable-next-line react-compiler/react-compiler
    offset.value = event.contentOffset.y;
    layout.value = event.layoutMeasurement;
    size.value = event.contentSize;
  }, NATIVE_SCROLL_EVENT_NAMES);
  useEffect(() => {
    const cleanup = register(eventHandler);
    return () => {
      cleanup();
    };
  }, []);

  // `onContentSizeChange` is synthesized in JS (from the content container's
  // onLayout) and `onLayout` has a different payload shape than scroll events,
  // so neither can be reliably captured via native event registration.
  // Instead we expose callbacks for the consumer to attach as props.
  const onLayout = useCallback(e => {
    layout.value = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    };
  }, [layout]);
  const onContentSizeChange = useCallback((w, h) => {
    size.value = {
      width: w,
      height: h
    };
  }, [size]);
  return {
    offset,
    layout,
    size,
    onLayout,
    onContentSizeChange
  };
};
export default useScrollState;
//# sourceMappingURL=useScrollState.js.map