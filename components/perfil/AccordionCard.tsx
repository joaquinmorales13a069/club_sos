import React, { useRef, useEffect } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { AccordionCardProps, AccordionSection } from "@/type";

const AccordionCard = React.memo(function AccordionCard({
    section,
    isExpanded,
    onToggle,
    isDark,
    children,
}: AccordionCardProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: isExpanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isExpanded, rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });

    return (
        <View
            className="rounded-2xl overflow-hidden"
            style={{
                backgroundColor: isExpanded
                    ? isDark
                        ? "#1a2735"
                        : "#f0f7ff"
                    : isDark
                    ? "#151f2b"
                    : "#FFFFFF",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.06,
                shadowRadius: 8,
                elevation: isDark ? 0 : 2,
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "transparent",
            }}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={section.title}
                accessibilityState={{ expanded: isExpanded }}
                onPress={onToggle}
                className="flex-row items-center p-4 active:opacity-80"
                style={{ gap: 12 }}
            >
                <View
                    className="items-center justify-center w-10 h-10 rounded-xl"
                    style={{
                        backgroundColor: isDark
                            ? section.iconBgDark
                            : section.iconBg,
                    }}
                >
                    <MaterialIcons
                        name={section.icon}
                        size={22}
                        color={section.iconColor}
                    />
                </View>

                <View className="flex-1">
                    <Text className="text-lg text-gray-900 font-poppins-semibold dark:text-sos-white">
                        {section.title}
                    </Text>
                    <Text className="text-sm font-sans text-sos-gray dark:text-gray-400 mt-0.5">
                        {section.subtitle}
                    </Text>
                </View>

                <Animated.View style={{ transform: [{ rotate }] }}>
                    <MaterialIcons
                        name="expand-more"
                        size={24}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                </Animated.View>
            </Pressable>

            {isExpanded && (
                <View
                    className="px-4 pb-4"
                    style={{
                        borderTopWidth: 1,
                        borderTopColor: isDark
                            ? "rgba(255, 255, 255, 0.06)"
                            : "rgba(0, 0, 0, 0.05)",
                    }}
                >
                    {children}
                </View>
            )}
        </View>
    );
});

export default AccordionCard;
