import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopAppBar from "@/components/auth/TopAppBar";
import SOSButton from "@/components/shared/SOSButton";

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
    iconSource: any;
}

// ─── Card data ─────────────────────────────────────────────
const MEMBER_TYPES: MemberTypeOption[] = [
    {
        value: "titular",
        label: "Titular",
        subtitle: "Trabajador/a de la empresa",
        iconSource: require("../../assets/images/ICON-titular.webp"),
    },
    {
        value: "conyuge",
        label: "Cónyuge",
        subtitle: "Esposo/a o pareja",
        iconSource: require("../../assets/images/ICON-conyuge.webp"),
    },
    {
        value: "hijo",
        label: "Dependiente",
        subtitle: "Hijo/a",
        iconSource: require("../../assets/images/ICON-dependiente.webp"),
    },
    {
        value: "familiar",
        label: "Familiar",
        subtitle: "Padre, madre, tío/a u otro pariente",
        iconSource: require("../../assets/images/ICON-familiar.webp"),
    },
];

// ─── Screen ────────────────────────────────────────────────
export default function VerifyAccountTypeScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    // ─── State ─────────────────────────────────────────────
    const [selectedType, setSelectedType] = useState<ParentescoType>("titular");

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
                <Text className="mb-3 text-3xl leading-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Tipo de miembro
                </Text>

                {/* Description */}
                <Text className="mb-8 font-sans text-base leading-relaxed text-sos-gray dark:text-gray-400">
                    Selecciona tu relación con algun trabajador de la empresa
                    para configurar tu perfil correctamente.
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
                                className={`flex-row items-center p-5 rounded-2xl ${
                                    isSelected
                                        ? "border-2 border-sos-bluegreen bg-white dark:bg-[#1a2634]"
                                        : "border border-gray-200 dark:border-gray-700 bg-[#F5F7FA] dark:bg-[#151f2b]"
                                }`}
                                style={{
                                    shadowColor: "#000000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 2,
                                }}
                            >
                                {/* Icon Container */}
                                <View className="justify-center items-center w-14 h-14 rounded-full bg-[#E8F1FA] dark:bg-[#1a2634]">
                                    <Image
                                        source={type.iconSource}
                                        className="w-10 h-10"
                                        resizeMode="contain"
                                    />
                                </View>

                                {/* Text */}
                                <View className="flex-1 ml-4">
                                    <Text className="text-lg text-gray-900 font-poppins-bold dark:text-sos-white">
                                        {type.label}
                                    </Text>
                                    <Text className="text-sm font-poppins-regular text-sos-gray dark:text-gray-400 mt-0.5">
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
            <View className="p-6 pb-8 border-t border-gray-100 dark:border-gray-800">
                <SOSButton
                    label="Continuar"
                    onPress={handleContinue}
                    accessibilityLabel="Continuar al siguiente paso"
                />
            </View>
        </SafeAreaView>
    );
}
