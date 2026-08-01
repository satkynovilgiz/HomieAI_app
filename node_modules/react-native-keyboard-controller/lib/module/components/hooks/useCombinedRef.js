import { useCallback } from "react";
const useCombinedRef = (...refs) => {
  return useCallback(value => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, refs);
};
export default useCombinedRef;
//# sourceMappingURL=useCombinedRef.js.map