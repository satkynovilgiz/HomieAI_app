import { Platform, PlatformColor } from "react-native";
export const colors = {
  light: {
    primary: Platform.select({
      ios: PlatformColor("link"),
      default: "#2c2c2c"
    }),
    disabled: Platform.select({
      ios: PlatformColor("systemGray4"),
      default: "#B0BEC5"
    }),
    background: Platform.select({
      ios: "#F8F8F8",
      default: "#f3f3f4"
    }),
    ripple: "#bcbcbcbc"
  },
  dark: {
    primary: Platform.select({
      ios: PlatformColor("label"),
      default: "#fafafa"
    }),
    disabled: Platform.select({
      ios: PlatformColor("systemGray"),
      default: "#707070"
    }),
    background: Platform.select({
      ios: "#555756",
      default: "#2C2C2E"
    }),
    ripple: "#F8F8F888"
  }
};
//# sourceMappingURL=colors.native.js.map