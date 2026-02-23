import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";

interface TopAppBarProps {
  /** Callback when the back button is pressed */
  onBack: () => void;
  /**
   * Optional title shown centered in the bar.
   * Ignored when `currentStep` / `totalSteps` are provided.
   */
  title?: string;
  /** Current step in the onboarding flow (1-indexed). */
  currentStep?: number;
  /** Total number of steps in the onboarding flow. */
  totalSteps?: number;
}

/**
 * Reusable top app bar for ClubSOS onboarding screens.
 *
 * Two modes:
 *  1. **Step indicator** — when `currentStep` and `totalSteps` are set the bar
 *     renders "Paso X de Y" + a progress-dot strip centred between the back
 *     button and a balancing spacer.
 *  2. **Title mode** (legacy) — when only `title` is set the bar renders a
 *     centred title next to the back button.
 *
 * Follows the ClubSOS design system (Poppins, sos-* colours, dark mode).
 */
export default function TopAppBar({
  onBack,
  title,
  currentStep,
  totalSteps,
}: TopAppBarProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const iconColor = isDark ? "#ffffff" : "#101418";

  const showStepIndicator =
    currentStep !== undefined && totalSteps !== undefined;

  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-sos-white dark:bg-[#101822]">
      {/* Back button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={onBack}
        className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
      >
        <MaterialIcons name="arrow-back" size={24} color={iconColor} />
      </Pressable>

      {showStepIndicator ? (
        /* ── Step-indicator mode ─────────────────────────── */
        <View className="flex-1 items-center">
          {/* Step label */}
          <Text className="text-[11px] font-poppins-bold uppercase tracking-widest text-sos-gray dark:text-gray-400">
            Paso {currentStep} de {totalSteps}
          </Text>

          {/* Progress dots */}
          <View
            className="flex-row items-center mt-1.5"
            accessibilityRole="progressbar"
            accessibilityLabel={`Progreso: paso ${currentStep} de ${totalSteps}`}
            style={{ gap: 4 }}
          >
            {Array.from({ length: totalSteps }).map((_, index) => {
              // 0-indexed comparison: active step is currentStep - 1
              const isActive = index === currentStep - 1;
              return (
                <View
                  key={index}
                  className={`h-1 rounded-full ${
                    isActive
                      ? "w-8 bg-sos-red"
                      : `w-2 ${isDark ? "bg-gray-700" : "bg-gray-300"}`
                  }`}
                />
              );
            })}
          </View>
        </View>
      ) : title ? (
        /* ── Title mode (legacy) ─────────────────────────── */
        <Text className="flex-1 text-lg font-poppins-bold leading-tight tracking-tight text-center text-gray-900 dark:text-sos-white">
          {title}
        </Text>
      ) : null}

      {/* Spacer to balance the back button */}
      <View className="w-10" />
    </View>
  );
}
