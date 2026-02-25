import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    account,
    findMiembroByAuthUserId,
    sendPhoneOtp,
    verifyPhoneOtp,
} from "@/libs/appwrite";
import SOSButton from "@/components/shared/SOSButton";

// SOS Brand Colors (from tailwind.config.js)
const SOS_BLUEGREEN = "#0066CC";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

type RouteParams = {
    phone: string;
    userId: string;
    countryCode?: string;
    callingCode?: string;
    phoneNumber?: string;
};

export default function VerifyOtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<RouteParams>();

    const phoneE164 = params.phone || "";
    const initialUserId = params.userId || "";
    const callingCode = params.callingCode || "";
    const phoneDigits = params.phoneNumber || "";

    const [otpDigits, setOtpDigits] = useState<string[]>(
        Array(OTP_LENGTH).fill(""),
    );
    const [focusedIndex, setFocusedIndex] = useState(0);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [secondsRemaining, setSecondsRemaining] = useState(
        RESEND_COOLDOWN_SECONDS,
    );
    const [currentUserId, setCurrentUserId] = useState(initialUserId);

    const otpCode = otpDigits.join("");
    const isOtpComplete = otpCode.length === OTP_LENGTH;
    const isVerifyDisabled = !isOtpComplete || loading;
    const isResendDisabled = secondsRemaining > 0 || resendLoading;

    const formatPhoneForDisplay = useCallback(() => {
        if (callingCode && phoneDigits) {
            if (phoneDigits.length === 8) {
                const formatted = `${phoneDigits.slice(0, 4)}-${phoneDigits.slice(4)}`;
                return `+${callingCode} ${formatted}`;
            }
            return `+${callingCode} ${phoneDigits}`;
        }
        return phoneE164;
    }, [callingCode, phoneDigits, phoneE164]);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

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

    const formatTimer = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleDigitChange = (text: string, index: number) => {
        setError(null);

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
                const nextIndex = Math.min(
                    index + digits.length,
                    OTP_LENGTH - 1,
                );
                inputRefs.current[nextIndex]?.focus();
                setFocusedIndex(nextIndex);
            }
            return;
        }

        const digit = text.replace(/\D/g, "");
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = digit;
        setOtpDigits(newOtpDigits);

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
            setFocusedIndex(index + 1);
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace") {
            if (otpDigits[index] === "" && index > 0) {
                const newOtpDigits = [...otpDigits];
                newOtpDigits[index - 1] = "";
                setOtpDigits(newOtpDigits);
                inputRefs.current[index - 1]?.focus();
                setFocusedIndex(index - 1);
            }
        }
    };

    const handleFocus = (index: number) => {
        setFocusedIndex(index);
    };

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

            const currentUser = await account.get();
            const existingMiembro = await findMiembroByAuthUserId(
                currentUser.$id,
            );

            if (existingMiembro) {
                if (existingMiembro.activo === true) {
                    router.replace("/(tabs)/inicio" as never);
                } else {
                    router.replace("/(auth)/account-activation" as never);
                }
                return;
            }

            router.push("/(auth)/verify-company");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Código inválido o expirado. Intenta de nuevo.";
            setError(message);
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setFocusedIndex(0);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (isResendDisabled) return;

        setResendLoading(true);
        setError(null);

        try {
            const response = await sendPhoneOtp(phoneE164);
            if (response?.userId) {
                setCurrentUserId(response.userId);
            }
            setSecondsRemaining(RESEND_COOLDOWN_SECONDS);
            setOtpDigits(Array(OTP_LENGTH).fill(""));
            setFocusedIndex(0);
            inputRefs.current[0]?.focus();
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

    const handleChangeNumber = () => {
        router.replace("/(auth)/login-phone");
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
                {/* Top App Bar */}
                <View className="flex-row items-center px-4 py-4">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Volver"
                        onPress={() => router.back()}
                        className="flex-row items-center gap-2 active:opacity-70"
                    >
                        <Image
                            source={require("../../assets/images/ICON-regresar.webp")}
                            className="w-5 h-5"
                            resizeMode="contain"
                        />
                        <Text className="text-base font-poppins-medium text-sos-gray dark:text-gray-400">
                            Anterior
                        </Text>
                    </Pressable>
                </View>

                {/* Main Content */}
                <View className="flex-1 px-4">
                    {/* Headline */}
                    <Text className="mb-3 text-3xl leading-tight tracking-tight text-left font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                        Verifica tu número
                    </Text>

                    {/* Body Text */}
                    <Text className="px-2 mb-10 font-sans text-base leading-relaxed text-left text-sos-gray dark:text-slate-400">
                        Ingresa el código de 6 dígitos que enviamos a tu celular{" "}
                        <Text className="text-lg font-poppins-semibold text-slate-800 dark:text-slate-200">
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
                                        maxLength={OTP_LENGTH}
                                        selectTextOnFocus
                                        accessibilityLabel={`Dígito ${index + 1}`}
                                        accessibilityHint={`Ingresa el dígito ${index + 1} del código de verificación`}
                                        className="text-2xl text-center bg-transparent h-14 w-11 font-poppins-bold text-slate-900 dark:text-sos-white"
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
                        <Text className="mb-4 text-sm text-center text-sos-red">
                            {error}
                        </Text>
                    )}
                    {!error && <View className="mb-4" />}

                    {/* Verify Button */}
                    <View className="mx-auto w-full max-w-[480px]">
                        <View className="px-4">
                            <SOSButton
                                label="Verificar"
                                onPress={handleVerify}
                                disabled={isVerifyDisabled}
                                loading={loading}
                                loadingLabel="Verificando..."
                            />
                        </View>
                    </View>

                    {/* Clinic Image */}
                    <View className="flex-1 mt-4 mx-auto w-full max-w-[480px] overflow-hidden rounded-xl">
                        <Image
                            source={require("../../assets/images/VerificarOTP-Imagen.webp")}
                            className="flex-1 w-full"
                            resizeMode="cover"
                            accessibilityLabel="Exterior clínica SOS Medical"
                        />
                    </View>

                    {/* Footer Links */}
                    <View className="items-center gap-4 py-6">
                        {/* Resend & Timer */}
                        <View className="items-center">
                            <Text className="mb-1 font-sans text-sm text-sos-gray dark:text-slate-400">
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
                                    <Image
                                        source={require("../../assets/images/ICON-reloj.webp")}
                                        className="w-5 h-5"
                                        resizeMode="contain"
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
                            className="px-4 py-2 rounded-lg active:bg-sos-bluegreen/10"
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
