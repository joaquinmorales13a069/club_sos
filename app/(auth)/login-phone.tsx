import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import CountryPicker, {
  type Country,
  type CountryCode,
} from "react-native-country-picker-modal";
import { SafeAreaView } from "react-native-safe-area-context";

import { sendPhoneOtp } from "@/libs/appwrite";

// Using colors from tailwind.config.js for inline styles (e.g., icons)
const SOS_BLUEGREEN = "#0066CC";
const SOS_GRAY = "#666666";

export default function LoginPhoneScreen() {
  const router = useRouter();
  const scheme = useColorScheme();

  // Country picker state
  const [countryCode, setCountryCode] = useState<CountryCode>("NI");
  const [callingCode, setCallingCode] = useState("505");
  const [pickerVisible, setPickerVisible] = useState(false);

  // Phone input state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Support modal state
  const [supportOpen, setSupportOpen] = useState(false);

  // Validation logic
  const phoneValidation = useMemo(() => {
    const digits = phoneNumber.replace(/\D/g, "");

    // Nicaragua: exactly 8 digits
    if (countryCode === "NI") {
      const isValid = digits.length === 8;
      return {
        isValid,
        error: digits.length > 0 && !isValid ? "Ingresa 8 dígitos" : null,
      };
    }

    // Other countries: 6-15 digits
    const isValid = digits.length >= 6 && digits.length <= 15;
    return {
      isValid,
      error:
        digits.length > 0 && !isValid ? "Ingresa entre 6 y 15 dígitos" : null,
    };
  }, [phoneNumber, countryCode]);

  const isButtonDisabled = !phoneValidation.isValid || loading;

  // Handle country selection
  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0] || "505");
    setPickerVisible(false);
  };

  // Handle phone input - only allow digits
  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, "");
    setPhoneNumber(digitsOnly);
  };

  // Handle send OTP
  const handleSendCode = async () => {
    const phoneDigits = phoneNumber.replace(/\D/g, "");
    const phoneE164 = `+${callingCode}${phoneDigits}`;

    setLoading(true);
    try {
      const response = await sendPhoneOtp(phoneE164);
      // Navigate to verify-otp screen on success
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          phone: phoneE164,
          userId: response.userId,
          countryCode: countryCode,
          callingCode: callingCode,
          phoneNumber: phoneDigits,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al enviar el código";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={scheme === "dark" ? "#ffffff" : SOS_GRAY}
          />
        </Pressable>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-4 w-full max-w-md mx-auto">
        {/* Headline */}
        <View className="pt-2 pb-6">
          <Text className="text-[32px] font-poppins-bold leading-tight tracking-tight text-gray-900 dark:text-sos-white text-left">
            Inicia sesión
          </Text>
          <Text className="text-base font-sans mt-2 text-sos-gray dark:text-gray-400">
            Ingresa tu número de celular para continuar
          </Text>
        </View>

        {/* Phone Input Section */}
        <View className="flex flex-col gap-4 py-2">
          {/* Label */}
          <View className="flex flex-col gap-2">
            <Text className="text-base font-poppins-medium leading-normal text-gray-900 dark:text-sos-white">
              Teléfono
            </Text>

            {/* Phone Input Container */}
            <View
              className={`flex-row items-center h-14 rounded-xl border overflow-hidden shadow-sm ${
                phoneValidation.error
                  ? "border-sos-red"
                  : "border-gray-300 dark:border-gray-600"
              } bg-sos-white dark:bg-gray-800`}
            >
              {/* Country Code Prefix - Pressable area */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Seleccionar país. Actual: +${callingCode}`}
                onPress={() => setPickerVisible(true)}
                className="flex-row items-center justify-center h-full pl-4 pr-3 border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 active:bg-gray-100 dark:active:bg-gray-800"
              >
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCallingCode
                  withEmoji
                  onSelect={onSelectCountry}
                  visible={pickerVisible}
                  onClose={() => setPickerVisible(false)}
                  containerButtonStyle={{ marginRight: 4 }}
                  theme={{
                    backgroundColor: scheme === "dark" ? "#101822" : "#ffffff",
                    onBackgroundTextColor:
                      scheme === "dark" ? "#ffffff" : "#1f2937",
                    primaryColor: SOS_BLUEGREEN,
                    primaryColorVariant: "#004d99",
                    filterPlaceholderTextColor:
                      scheme === "dark" ? "#9ca3af" : SOS_GRAY,
                    activeOpacity: 0.7,
                    fontSize: 16,
                  }}
                />
                <Text className="text-base font-poppins-medium text-gray-900 dark:text-sos-white">
                  +{callingCode}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={20}
                  color={scheme === "dark" ? "#9ca3af" : SOS_GRAY}
                  style={{ marginLeft: 2 }}
                />
              </Pressable>

              {/* Phone Number Input */}
              <TextInput
                className="flex-1 h-full px-3 text-base font-sans text-gray-900 dark:text-sos-white bg-transparent"
                placeholder="8888 8888"
                placeholderTextColor={scheme === "dark" ? "#6b7280" : "#9ca3af"}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                maxLength={15}
                accessibilityLabel="Número de teléfono"
                accessibilityHint="Ingresa tu número de teléfono sin el código de país"
              />
            </View>

            {/* Error Message */}
            {phoneValidation.error && (
              <Text className="text-sm font-sans text-sos-red">
                {phoneValidation.error}
              </Text>
            )}
          </View>

          {/* Helper Text */}
          <Text className="text-sm font-sans leading-normal text-sos-gray dark:text-gray-400">
            Te enviaremos un SMS con un código de verificación.
          </Text>
        </View>

        {/* Spacer */}
        <View className="flex-1 min-h-[40px]" />

        {/* Action Button Section */}
        <View className="pb-8 pt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enviar código"
            accessibilityState={{ disabled: isButtonDisabled }}
            disabled={isButtonDisabled}
            onPress={handleSendCode}
            className={`w-full flex items-center justify-center rounded-xl h-12 px-5 bg-sos-bluegreen ${
              isButtonDisabled ? "opacity-50" : ""
            }`}
          >
            <Text className="text-base font-poppins-bold leading-normal tracking-[0.015em] text-sos-white">
              {loading ? "Enviando..." : "Enviar código"}
            </Text>
          </Pressable>

          {/* Help Link */}
          <View className="mt-4 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Necesitas ayuda"
              onPress={() => setSupportOpen(true)}
              className="py-2 px-4"
            >
              <Text className="text-sm font-poppins-medium text-sos-bluegreen">
                ¿Necesitas ayuda?
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Support / Help Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={supportOpen}
        onRequestClose={() => setSupportOpen(false)}
      >
        <View className="flex-1 justify-center items-center px-6 bg-black/50">
          <View className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-sos-white dark:bg-[#101822]">
            <View className="px-5 pt-5 pb-4">
              <Text className="text-lg font-poppins-bold text-gray-900 dark:text-sos-white">
                ¿Necesitas ayuda?
              </Text>
              <Text className="mt-2 text-sm font-sans leading-5 text-sos-gray dark:text-gray-300">
                Si tienes problemas para iniciar sesión, verifica que tu número
                de teléfono esté correcto y que tengas señal para recibir SMS.
                {"\n\n"}
                También puedes contactarnos en:{"\n"}
                soporte@clubsos.com
              </Text>
            </View>
            <View className="flex-row gap-2 justify-end px-5 pb-5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar ayuda"
                onPress={() => setSupportOpen(false)}
                className="justify-center items-center px-4 h-11 bg-gray-100 rounded-xl dark:bg-gray-800"
              >
                <Text className="text-sm font-poppins-semibold text-gray-900 dark:text-sos-white">
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
