import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";

interface TopAppBarProps {
  /** Title shown centered in the bar */
  title: string;
  /** Callback when the back button is pressed */
  onBack: () => void;
}

/**
 * Reusable top app bar with a back arrow and a centered title.
 * Follows the ClubSOS design system (Poppins, sos-* colours).
 */
export default function TopAppBar({ title, onBack }: TopAppBarProps) {
  const scheme = useColorScheme();

  return (
    <View className="flex-row items-center px-4 py-4 pb-2 justify-between bg-sos-white dark:bg-[#101822]">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={onBack}
        className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
      >
        <MaterialIcons
          name="arrow-back"
          size={24}
          color={scheme === "dark" ? "#ffffff" : "#111418"}
        />
      </Pressable>

      <Text className="flex-1 text-lg font-poppins-bold leading-tight tracking-tight text-center pr-12 text-gray-900 dark:text-sos-white">
        {title}
      </Text>
    </View>
  );
}
