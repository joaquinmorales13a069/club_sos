import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { ProfileFieldProps } from "@/type";

const ProfileField = React.memo(function ProfileField({
    label,
    icon,
    isDark,
    badge,
    children,
}: ProfileFieldProps) {
    return (
        <View style={{ gap: 6 }}>
            <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-900 font-poppins-bold dark:text-gray-200">
                    {label}
                </Text>
                {badge && (
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                        <MaterialIcons
                            name="check-circle"
                            size={14}
                            color="#22c55e"
                        />
                        <Text className="text-xs text-green-600 font-poppins-semibold dark:text-green-400">
                            {badge}
                        </Text>
                    </View>
                )}
            </View>
            <View className="relative">
                <View className="absolute top-0 bottom-0 z-10 justify-center left-4">
                    <MaterialIcons name={icon} size={20} color="#9ca3af" />
                </View>
                {children}
            </View>
        </View>
    );
});

export default ProfileField;
