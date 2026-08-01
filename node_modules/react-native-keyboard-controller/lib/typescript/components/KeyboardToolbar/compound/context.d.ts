import type { KeyboardToolbarTheme } from "../types";
type ToolbarContextType = {
    theme: KeyboardToolbarTheme;
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
};
export declare const ToolbarContext: import("react").Context<ToolbarContextType | undefined>;
export declare const useToolbarContext: () => ToolbarContextType;
export {};
