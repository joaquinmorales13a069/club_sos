import React from "react";
import { Pressable, View, Text } from "react-native";
import type { ToggleRowProps } from "@/type";

const SOS_BLUEGREEN = "#0066CC";

const ToggleRow = React.memo(function ToggleRow({
    label,
    description,
    value,
    onToggle,
    isDark,
    isLast,
}: ToggleRowProps) {
    return (
        <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel={label}
            onPress={onToggle}
            className="flex-row items-center py-3.5"
            style={{
                gap: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.05)",
            }}
        >
            <View className="flex-1">
                <Text className="text-sm text-gray-900 font-poppins-semibold dark:text-sos-white">
                    {label}
                </Text>
                <Text className="text-xs font-sans text-sos-gray dark:text-gray-400 mt-0.5">
                    {description}
                </Text>
            </View>

            <View
                className="justify-center h-6 rounded-full w-11"
                style={{
                    backgroundColor: value
                        ? SOS_BLUEGREEN
                        : isDark
                          ? "#374151"
                          : "#d1d5db",
                    paddingHorizontal: 2,
                }}
            >
                <View
                    className="w-5 h-5 rounded-full bg-sos-white"
                    style={{
                        alignSelf: value ? "flex-end" : "flex-start",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 2,
                    }}
                />
            </View>
        </Pressable>
    );
});

export default ToggleRow;
