import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    account,
    findMiembroByAuthUserId,
    sendPhoneOtp,
    verifyPhoneOtp,
} from "@/libs/appwrite";

// SOS Brand Colors (from tailwind.config.js)
const SOS_BLUEGREEN = "#0066CC";
const SOS_GRAY = "#666666";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type RouteParams = {
    phone: string; // E.164 format (e.g., +50588888888)
    userId: string; // User ID from sendPhoneOtp response
    countryCode?: string;
    callingCode?: string;
    phoneNumber?: string; // Raw phone digits without country code
};

export default function VerifyOtpScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const params = useLocalSearchParams<RouteParams>();

    // Extract params
    const phoneE164 = params.phone || "";
    const initialUserId = params.userId || "";
    const callingCode = params.callingCode || "";
    const phoneDigits = params.phoneNumber || "";

    // OTP input state
    const [otpDigits, setOtpDigits] = useState<string[]>(
        Array(OTP_LENGTH).fill(""),
    );
    const [focusedIndex, setFocusedIndex] = useState(0);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Loading & error states
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Resend timer state
    const [secondsRemaining, setSecondsRemaining] = useState(
        RESEND_COOLDOWN_SECONDS,
    );
    const [currentUserId, setCurrentUserId] = useState(initialUserId);

    // Computed values
    const otpCode = otpDigits.join("");
    const isOtpComplete = otpCode.length === OTP_LENGTH;
    const isVerifyDisabled = !isOtpComplete || loading;
    const isResendDisabled = secondsRemaining > 0 || resendLoading;

    /**
     * Format phone number for display
     * E.g., +505 8888-8888 for 8 digit numbers
     */
    const formatPhoneForDisplay = useCallback(() => {
        if (callingCode && phoneDigits) {
            // If 8 digits (Nicaragua style), format as XXXX-XXXX
            if (phoneDigits.length === 8) {
                const formatted = `${phoneDigits.slice(0, 4)}-${phoneDigits.slice(4)}`;
                return `+${callingCode} ${formatted}`;
            }
            // Otherwise just show +callingCode digits
            return `+${callingCode} ${phoneDigits}`;
        }
        // Fallback to raw E.164
        return phoneE164;
    }, [callingCode, phoneDigits, phoneE164]);

    /**
     * Focus on the first input on mount
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Resend cooldown timer
     */
    useEffect(() => {
        if (secondsRemaining <= 0) return;

        const interval = setInterval(() => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsRemaining]);

    /**
     * Format seconds as MM:SS
     */
    const formatTimer = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    /**
     * Handle single digit input change
     */
    const handleDigitChange = (text: string, index: number) => {
        // Clear any previous error
        setError(null);

        // Handle paste of multiple digits
        if (text.length > 1) {
            const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
            if (digits.length > 0) {
                const newOtpDigits = [...otpDigits];
                for (
                    let i = 0;
                    i < digits.length && index + i < OTP_LENGTH;
                    i++
                ) {
                    newOtpDigits[index + i] = digits[i];
                }
                setOtpDigits(newOtpDigits);
                // Focus on the next empty input or last input
                const nextIndex = Math.min(
                    index + digits.length,
                    OTP_LENGTH - 1,
                );
                inputRefs.current[nextIndex]?.focus();
                setFocusedIndex(nextIndex);
            }
            return;
        }

        // Only allow digits
        const digit = text.replace(/\D/g, "");

        // Update the digit at current index
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = digit;
        setOtpDigits(newOtpDigits);

        // Auto-advance to next input
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
            setFocusedIndex(index + 1);
        }
    };

    /**
     * Handle backspace key press
     */
    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace") {
            if (otpDigits[index] === "" && index > 0) {
                // If current input is empty, go to previous and clear it
                const newOtpDigits = [...otpDigits];
                newOtpDigits[index - 1] = "";
                setOtpDigits(newOtpDigits);
                inputRefs.current[index - 1]?.focus();
                setFocusedIndex(index - 1);
            }
        }
    };

    /**
     * Handle input focus
     */
    const handleFocus = (index: number) => {
        setFocusedIndex(index);
    };

    /**
     * Verify OTP code
     */
    const handleVerify = async () => {
        if (!isOtpComplete || loading) return;

        if (!currentUserId) {
            Alert.alert(
                "Error",
                "No se encontró la sesión. Por favor vuelve a intentar.",
            );
            router.replace("/(auth)/login-phone");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await verifyPhoneOtp(currentUserId, otpCode);

            // Check if this auth user already has a miembro record
            const currentUser = await account.get();
            const existingMiembro = await findMiembroByAuthUserId(
                currentUser.$id,
            );

            if (existingMiembro) {
                if (existingMiembro.activo === true) {
                    // Already approved — go straight to the main app
                    router.replace("/(tabs)/inicio" as never);
                } else {
                    // Miembro exists but pending approval — go to activation screen
                    router.replace("/(auth)/account-activation" as never);
                }
                return;
            }

            // No miembro yet — continue with the onboarding flow
            router.push("/(auth)/verify-company");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Código inválido o expirado. Intenta de nuevo.";
            setError(message);
            // Clear OTP inputs on error
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setFocusedIndex(0);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resend OTP code
     */
    const handleResend = async () => {
        if (isResendDisabled) return;

        setResendLoading(true);
        setError(null);

        try {
            const response = await sendPhoneOtp(phoneE164);
            // Update userId for the new token
            if (response?.userId) {
                setCurrentUserId(response.userId);
            }
            // Reset timer
            setSecondsRemaining(RESEND_COOLDOWN_SECONDS);
            // Clear previous OTP
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setFocusedIndex(0);
            inputRefs.current[0]?.focus();
            // Show confirmation
            Alert.alert(
                "Código reenviado",
                "Te enviamos un nuevo código de verificación.",
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Error al reenviar el código. Intenta de nuevo.";
            Alert.alert("Error", message);
        } finally {
            setResendLoading(false);
        }
    };

    /**
     * Navigate back to change phone number
     */
    const handleChangeNumber = () => {
        router.replace("/(auth)/login-phone");
    };

    /**
     * Navigate back
     */
    const handleGoBack = () => {
        router.back();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
                {/* Top App Bar */}
                <View className="flex-row items-center justify-between px-4 py-4">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Volver"
                        onPress={handleGoBack}
                        className="flex items-center justify-center w-10 h-10 rounded-full active:bg-slate-100 dark:active:bg-slate-800"
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={scheme === "dark" ? "#ffffff" : "#0f172a"}
                        />
                    </Pressable>
                    <View className="flex-1" />
                </View>

                {/* Main Content */}
                <View className="flex-1 px-6 pt-4 pb-8">
                    {/* Headline */}
                    <Text className="text-3xl font-poppins-bold leading-tight tracking-tight text-center mb-3 text-slate-900 dark:text-sos-white">
                        Verifica tu número
                    </Text>

                    {/* Body Text */}
                    <Text className="text-base font-sans leading-relaxed text-center px-2 mb-10 text-sos-gray dark:text-slate-400">
                        Ingresa el código de 6 dígitos que enviamos a tu celular{" "}
                        <Text className="font-poppins-semibold text-slate-800 dark:text-slate-200">
                            {formatPhoneForDisplay()}
                        </Text>
                    </Text>

                    {/* OTP Input Fields */}
                    <View className="flex-row justify-center mb-4">
                        <View className="flex-row gap-2">
                            {otpDigits.map((digit, index) => {
                                const isFocused = focusedIndex === index;
                                const hasValue = digit !== "";
                                const borderColor =
                                    isFocused || hasValue
                                        ? SOS_BLUEGREEN
                                        : scheme === "dark"
                                          ? "#334155"
                                          : "#e2e8f0";

                                return (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => {
                                            inputRefs.current[index] = ref;
                                        }}
                                        value={digit}
                                        onChangeText={(text) =>
                                            handleDigitChange(text, index)
                                        }
                                        onKeyPress={({ nativeEvent }) =>
                                            handleKeyPress(
                                                nativeEvent.key,
                                                index,
                                            )
                                        }
                                        onFocus={() => handleFocus(index)}
                                        keyboardType="number-pad"
                                        maxLength={OTP_LENGTH} // Allow paste of full code
                                        selectTextOnFocus
                                        accessibilityLabel={`Dígito ${index + 1}`}
                                        accessibilityHint={`Ingresa el dígito ${index + 1} del código de verificación`}
                                        className="h-14 w-11 text-center text-2xl font-poppins-bold text-slate-900 dark:text-sos-white bg-transparent"
                                        style={{
                                            borderBottomWidth: 2,
                                            borderBottomColor: borderColor,
                                        }}
                                        selectionColor={SOS_BLUEGREEN}
                                        cursorColor={SOS_BLUEGREEN}
                                    />
                                );
                            })}
                        </View>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <Text className="text-sm text-center text-red-500 dark:text-red-400 mb-6">
                            {error}
                        </Text>
                    )}

                    {/* Spacer when no error */}
                    {!error && <View className="mb-6" />}

                    {/* Verify Button */}
                    <View className="mb-8">
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Verificar código"
                            accessibilityState={{ disabled: isVerifyDisabled }}
                            disabled={isVerifyDisabled}
                            onPress={handleVerify}
                            className={`w-full flex-row items-center justify-center rounded-xl h-14 px-5 ${
                                isVerifyDisabled ? "opacity-50" : ""
                            }`}
                            style={{
                                backgroundColor: SOS_BLUEGREEN,
                                shadowColor: SOS_BLUEGREEN,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.25,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator
                                    color="#ffffff"
                                    size="small"
                                />
                            ) : (
                                <Text className="text-lg font-poppins-bold tracking-wide text-sos-white">
                                    Verificar
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Footer Links */}
                    <View className="flex-1" />
                    <View className="flex-col items-center gap-6">
                        {/* Resend & Timer */}
                        <View className="items-center">
                            <Text className="text-sm font-sans text-sos-gray dark:text-slate-400 mb-1">
                                ¿No recibiste el código?
                            </Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    isResendDisabled
                                        ? `Reenviar código en ${formatTimer(secondsRemaining)}`
                                        : "Reenviar código"
                                }
                                accessibilityState={{
                                    disabled: isResendDisabled,
                                }}
                                disabled={isResendDisabled}
                                onPress={handleResend}
                                className="flex-row items-center justify-center gap-1.5 py-1"
                            >
                                {secondsRemaining > 0 && (
                                    <MaterialIcons
                                        name="timer"
                                        size={18}
                                        color={SOS_GRAY}
                                    />
                                )}
                                <Text
                                    className={`text-sm font-poppins-semibold ${
                                        isResendDisabled
                                            ? "text-sos-gray dark:text-slate-500"
                                            : "text-sos-bluegreen"
                                    }`}
                                >
                                    {resendLoading
                                        ? "Enviando..."
                                        : secondsRemaining > 0
                                          ? `Reenviar en ${formatTimer(secondsRemaining)}`
                                          : "Reenviar código"}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Change Number */}
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Cambiar número de teléfono"
                            onPress={handleChangeNumber}
                            className="py-2 px-4 rounded-lg active:bg-sos-bluegreen/10 dark:active:bg-sos-bluegreen/20"
                        >
                            <Text className="text-sm font-poppins-bold text-sos-bluegreen">
                                Cambiar número
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}
