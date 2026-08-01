import React from "react";
import type { KeyboardToolbarTheme } from "./types";
type ArrowProps = {
    type: "prev" | "next";
    disabled?: boolean;
    theme: KeyboardToolbarTheme;
};
declare const ArrowComponent: React.FC<ArrowProps>;
export default ArrowComponent;
