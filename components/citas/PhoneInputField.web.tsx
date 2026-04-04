import React from "react";
import { Text, TextInput, View } from "react-native";

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
    isDark,
    error,
    disabled = false,
}: PhoneInputFieldProps) {
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
                {/* Prefijo fijo (sin picker en web) */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        height: "100%",
                        paddingHorizontal: 12,
                        borderRightWidth: 1,
                        borderRightColor: isDark ? "#4B5563" : "#D1D5DB",
                        backgroundColor: isDark ? "#151f2b" : "#F3F4F6",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 15,
                            fontFamily: "Poppins_500Medium",
                            color: isDark ? "#FFFFFF" : "#111827",
                        }}
                    >
                        +{callingCode}
                    </Text>
                </View>

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
