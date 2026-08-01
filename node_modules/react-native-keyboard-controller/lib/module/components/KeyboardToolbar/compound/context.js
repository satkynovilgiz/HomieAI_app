import { createContext, useContext } from "react";
export const ToolbarContext = /*#__PURE__*/createContext(undefined);
export const useToolbarContext = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error("KeyboardToolbar.* component must be used inside <KeyboardToolbar>");
  }
  return context;
};
//# sourceMappingURL=context.js.map