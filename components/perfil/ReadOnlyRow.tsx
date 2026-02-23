import React from "react";
import { View, Text } from "react-native";
import type { ReadOnlyRowProps } from "@/type";

const ReadOnlyRow = React.memo(function ReadOnlyRow({
    label,
    value,
    isDark,
}: ReadOnlyRowProps) {
    return (
        <View
            className="pb-3"
            style={{
                borderBottomWidth: 1,
                borderBottomColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.05)",
            }}
        >
            <Text className="mb-1 text-xs tracking-wide uppercase font-poppins-medium text-sos-gray dark:text-gray-500">
                {label}
            </Text>
            <Text className="text-base text-gray-900 font-poppins-medium dark:text-sos-white">
                {value}
            </Text>
        </View>
    );
});

export default ReadOnlyRow;
