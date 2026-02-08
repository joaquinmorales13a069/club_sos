import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopAppBar from "@/components/TopAppBar";

// ─── Constants ─────────────────────────────────────────────
// Storage key — follows the same AsyncStorage pattern used in verify-company
const STORAGE_KEY = "clubSOS.miembro.parentesco";

// Brand colour constant for inline style props (RN icon / shadow limitation)
const SOS_BLUEGREEN = "#0066CC";

// ─── Types ─────────────────────────────────────────────────
type ParentescoType = "titular" | "conyuge" | "hijo" | "familiar";

interface MemberTypeOption {
    value: ParentescoType;
    label: string;
    subtitle: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    iconBgLight: string;
    iconBgDark: string;
    iconColor: string;
}

// ─── Card data ─────────────────────────────────────────────
const MEMBER_TYPES: MemberTypeOption[] = [
    {
        value: "titular",
        label: "Titular",
        subtitle: "Trabajador/a de la empresa",
        icon: "badge",
        iconBgLight: "#eff6ff", // Tailwind blue-50
        iconBgDark: "rgba(30, 58, 138, 0.3)", // Tailwind blue-900/30
        iconColor: SOS_BLUEGREEN,
    },
    {
        value: "conyuge",
        label: "Cónyuge",
        subtitle: "Esposo/a o pareja",
        icon: "favorite",
        iconBgLight: "#fef2f2", // Tailwind red-50
        iconBgDark: "rgba(127, 29, 29, 0.3)", // Tailwind red-900/30
        iconColor: "rgba(204, 51, 51, 0.8)", // sos-red at 80 % (primary/80)
    },
    {
        value: "hijo",
        label: "Dependiente",
        subtitle: "Hijo/a",
        icon: "face",
        iconBgLight: "#f0fdfa", // Tailwind teal-50
        iconBgDark: "rgba(19, 78, 74, 0.3)", // Tailwind teal-900/30
        iconColor: "#0d9488", // Tailwind teal-600
    },
    {
        value: "familiar",
        label: "Familiar",
        subtitle: "Padre, madre, tío/a u otro pariente",
        icon: "groups",
        iconBgLight: "#fefce8", // Tailwind yellow-50
        iconBgDark: "rgba(113, 63, 18, 0.3)", // Tailwind yellow-900/30
        iconColor: "#ca8a04", // Tailwind yellow-600
    },
];

// ─── Screen ────────────────────────────────────────────────
export default function VerifyAccountTypeScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    // ─── State ─────────────────────────────────────────────
    const [selectedType, setSelectedType] =
        useState<ParentescoType>("titular");

    // ─── Handlers ──────────────────────────────────────────

    /**
     * Persist the selected parentesco via AsyncStorage and navigate
     * to the appropriate next onboarding screen.
     */
    const handleContinue = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, selectedType);

            if (selectedType === "titular") {
                // Titular skips link-main-account and goes straight to
                // the personal-info form (step 4).
                router.push("/(auth)/verify-account-info" as never);
            } else {
                // Navigate to the link-main-account screen where the user
                // searches for the titular employee and links their account.
                router.push("/(auth)/link-main-account" as never);
            }
        } catch (error) {
            console.error(
                "[verify-account-type] Error saving parentesco:",
                error,
            );
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    // ─── Render ────────────────────────────────────────────
    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            {/* ── Top App Bar with step indicator (step 2 of 5) ── */}
            <TopAppBar onBack={handleGoBack} currentStep={2} totalSteps={5} />

            {/* ── Main Content ────────────────────────────────── */}
            <View className="flex-1 px-6 pt-2 pb-8">
                {/* Title */}
                <Text className="text-[28px] font-poppins-bold leading-tight text-gray-900 dark:text-sos-white mb-3">
                    Tipo de miembro
                </Text>

                {/* Description */}
                <Text className="mb-8 font-sans text-base leading-relaxed text-sos-gray dark:text-gray-400">
                    Selecciona tu relación con algun trabajador de la empresa para configurar tu
                    perfil correctamente.
                </Text>

                {/* ── Selection Cards (radio group) ──────────────── */}
                <View
                    accessibilityRole="radiogroup"
                    accessibilityLabel="Tipo de miembro"
                    style={{ gap: 16 }}
                >
                    {MEMBER_TYPES.map((type) => {
                        const isSelected = selectedType === type.value;

                        return (
                            <Pressable
                                key={type.value}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                accessibilityLabel={`${type.label}: ${type.subtitle}`}
                                onPress={() => setSelectedType(type.value)}
                                className={`flex-row items-center p-4 pr-5 rounded-2xl border-2 ${
                                    isSelected
                                        ? "border-sos-bluegreen"
                                        : "border-transparent"
                                }`}
                                style={[
                                    {
                                        backgroundColor: isSelected
                                            ? isDark
                                                ? "rgba(0, 102, 204, 0.06)"
                                                : "rgba(0, 102, 204, 0.03)"
                                            : isDark
                                              ? "#151f2b"
                                              : "#ffffff",
                                    },
                                    {
                                        // shadow-soft equivalent
                                        shadowColor: "#000000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: isSelected ? 0.08 : 0.05,
                                        shadowRadius: isSelected ? 12 : 10,
                                        elevation: isSelected ? 4 : 2,
                                    },
                                ]}
                            >
                                {/* Icon Container */}
                                <View
                                    className="justify-center items-center w-12 h-12 rounded-xl"
                                    style={{
                                        backgroundColor: isDark
                                            ? type.iconBgDark
                                            : type.iconBgLight,
                                    }}
                                >
                                    <MaterialIcons
                                        name={type.icon}
                                        size={24}
                                        color={type.iconColor}
                                    />
                                </View>

                                {/* Text */}
                                <View className="flex-1 ml-4">
                                    <Text className="text-lg text-gray-900 font-poppins-semibold dark:text-sos-white">
                                        {type.label}
                                    </Text>
                                    <Text className="text-xs font-poppins-medium text-sos-gray dark:text-gray-400 mt-0.5">
                                        {type.subtitle}
                                    </Text>
                                </View>

                                {/* Radio Indicator */}
                                <View
                                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                        isSelected
                                            ? "border-sos-bluegreen bg-sos-bluegreen"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    {isSelected && (
                                        <MaterialIcons
                                            name="check"
                                            size={16}
                                            color="#ffffff"
                                        />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* ── Bottom Sticky CTA ───────────────────────────── */}
            <View
                className="p-6 pb-8 border-t border-gray-100 dark:border-gray-800"
                style={{
                    backgroundColor: isDark
                        ? "rgba(16, 24, 34, 0.9)"
                        : "rgba(255, 255, 255, 0.9)",
                }}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Continuar al siguiente paso"
                    onPress={handleContinue}
                    className="flex-row justify-center items-center w-full h-14 rounded-full bg-sos-bluegreen active:opacity-90"
                    style={{
                        shadowColor: SOS_BLUEGREEN,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.39,
                        shadowRadius: 14,
                        elevation: 6,
                    }}
                >
                    <Text className="text-base font-poppins-bold text-sos-white">
                        Continuar
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
