import React from "react";
import { SafeAreaView, type SafeAreaViewProps } from "react-native-safe-area-context";

type Props = Omit<SafeAreaViewProps, "edges">;

/**
 * Drop-in replacement for SafeAreaView on tab screens.
 * Excludes the bottom safe area so content extends to the physical screen edge,
 * allowing the floating tab bar to overlay it naturally.
 */
export default function TabScreenView({ children, ...props }: Props) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} {...props}>
      {children}
    </SafeAreaView>
  );
}
