import React from "react";
import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Keep these in sync with the tabBarStyle in app/(tabs)/_layout.tsx
const TAB_BAR_HEIGHT = 70;
const TAB_BAR_MARGIN_BOTTOM = 20;

type Props = ScrollViewProps & {
  /** NativeWind class string applied to the scroll content container */
  contentContainerClassName?: string;
};

/**
 * Drop-in replacement for ScrollView on tab screens.
 * Automatically adds bottom padding so the last item scrolls above the
 * floating tab bar on every device, regardless of safe area size.
 */
export default function TabScrollView({
  contentContainerStyle,
  children,
  ...props
}: Props) {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const paddingBottom = TAB_BAR_HEIGHT + TAB_BAR_MARGIN_BOTTOM + safeBottom;

  return (
    <ScrollView
      contentContainerStyle={[{ paddingBottom }, contentContainerStyle]}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
