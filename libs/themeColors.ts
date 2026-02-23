/* eslint-disable @typescript-eslint/no-require-imports */
const tailwindConfig = require("../tailwind.config") as {
  theme?: { extend?: { colors?: Record<string, string> } };
};

const extendedColors = tailwindConfig.theme?.extend?.colors ?? {};

export const THEME_COLORS = {
  sosBluegreen: extendedColors["sos-bluegreen"] ?? "blue",
  sosGray: extendedColors["sos-gray"] ?? "gray",
  sosWhite: extendedColors["sos-white"] ?? "white",
  sosRed: extendedColors["sos-red"] ?? "red",
} as const;
