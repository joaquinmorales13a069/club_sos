import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CountryPicker, {
    type Country,
    type CountryCode,
} from "react-native-country-picker-modal";

import { THEME_COLORS } from "@/libs/themeColors";

export interface PhoneInputFieldProps {
    digits: string;
    onChangeDigits: (v: string) => void;
    callingCode: string;
    countryCode: string;
    onCountryChange: (callingCode: string, cca2: string) => void;
    isDark: boolean;
    error?: string;
    disabled?: boolean;
}

export default function PhoneInputField({
    digits,
    onChangeDigits,
    callingCode,
    countryCode,
    onCountryChange,
    isDark,
    error,
    disabled = false,
}: PhoneInputFieldProps) {
    const [pickerVisible, setPickerVisible] = useState(false);

    const handleSelect = (country: Country) => {
        onCountryChange(country.callingCode[0] ?? "505", country.cca2);
        setPickerVisible(false);
    };

    const borderColor = error ? "#CC3333" : isDark ? "#4B5563" : "#D1D5DB";

    return (
        <View>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 52,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor,
                    overflow: "hidden",
                    opacity: disabled ? 0.5 : 1,
                    backgroundColor: disabled
                        ? isDark ? "#111827" : "#F9FAFB"
                        : isDark ? "#1E2A38" : "#FFFFFF",
                }}
            >
                {/* Selector de país */}
                <Pressable
                    onPress={() => !disabled && setPickerVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel={`Código de país: +${callingCode}`}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        height: "100%",
                        paddingLeft: 12,
                        paddingRight: 10,
                        borderRightWidth: 1,
                        borderRightColor: isDark ? "#4B5563" : "#D1D5DB",
                        backgroundColor: isDark ? "#151f2b" : "#F3F4F6",
                        gap: 4,
                    }}
                >
                    <CountryPicker
                        countryCode={countryCode as CountryCode}
                        withFilter
                        withFlag
                        withCallingCode
                        withEmoji
                        onSelect={handleSelect}
                        visible={pickerVisible}
                        onClose={() => setPickerVisible(false)}
                        containerButtonStyle={{ marginRight: 2 }}
                        theme={{
                            backgroundColor: isDark ? "#101822" : "#ffffff",
                            onBackgroundTextColor: isDark ? "#ffffff" : "#1f2937",
                            primaryColor: THEME_COLORS.sosBluegreen,
                            primaryColorVariant: "#004d99",
                            filterPlaceholderTextColor: isDark ? "#9ca3af" : "#6B7280",
                            activeOpacity: 0.7,
                            fontSize: 16,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 15,
                            fontFamily: "Poppins_500Medium",
                            color: isDark ? "#FFFFFF" : "#111827",
                        }}
                    >
                        +{callingCode}
                    </Text>
                    <MaterialIcons
                        name="keyboard-arrow-down"
                        size={18}
                        color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                </Pressable>

                {/* Input de dígitos */}
                <TextInput
                    value={digits}
                    onChangeText={(v) => onChangeDigits(v.replace(/\D/g, ""))}
                    placeholder="8888 8888"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    keyboardType="phone-pad"
                    editable={!disabled}
                    maxLength={15}
                    style={{
                        flex: 1,
                        height: "100%",
                        paddingHorizontal: 12,
                        fontSize: 15,
                        color: isDark ? "#FFFFFF" : "#111827",
                        fontFamily: "Poppins_400Regular",
                        backgroundColor: "transparent",
                    }}
                />
            </View>

            {error && (
                <Text
                    style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: "#CC3333",
                        fontFamily: "Poppins_500Medium",
                    }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
}
