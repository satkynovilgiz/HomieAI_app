import React from "react";
import type { ButtonSubProps } from "./types";
import type { ReactNode } from "react";
declare const Done: React.FC<Omit<ButtonSubProps, "icon"> & {
    text?: ReactNode;
}>;
export default Done;
