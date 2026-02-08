import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CompanyFoundCard from "@/components/CompanyFoundCard";
import TopAppBar from "@/components/TopAppBar";
import { findEmpresaByCodigo } from "@/libs/appwrite";

// Brand colour constant for inline style props (RN icon limitation)
const SOS_BLUEGREEN = "#0066CC";

// Estados that allow company linking (compared case-insensitively)
const VALID_ESTADOS = ["activo"];

// Storage keys for persisting empresa data across onboarding steps
const STORAGE_KEY = "clubSOS.empresa_id";
const EMPRESA_NAME_KEY = "clubSOS.empresa_nombre";

type EmpresaEncontrada = {
  $id: string;
  nombre_empresa: string;
  estado: string;
};

export default function VerifyCompanyScreen() {
  const router = useRouter();
  const scheme = useColorScheme();

  // ─── State ──────────────────────────────────────────────
  const [companyCode, setCompanyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [empresaEncontrada, setEmpresaEncontrada] =
    useState<EmpresaEncontrada | null>(null);

  // ─── Derived ────────────────────────────────────────────
  const isValidateDisabled = companyCode.trim().length === 0 || isLoading;

  // ─── Handlers ───────────────────────────────────────────

  /**
   * Validate the entered company code against the `empresas` Appwrite collection.
   * Normalises input (trim + uppercase) before querying.
   */
  const validateCompanyCode = async () => {
    const normalized = companyCode.trim().toUpperCase();
    if (!normalized) {
      setErrorMessage("Ingresa un código de empresa.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setEmpresaEncontrada(null);
    Keyboard.dismiss();

    try {
      const empresa = await findEmpresaByCodigo(normalized);

      // Case D: no results
      if (!empresa) {
        setErrorMessage("No se encontró ninguna empresa con ese código.");
        return;
      }

      // Case E: estado does not allow linking
      const estadoNormalized = (empresa.estado || "").toLowerCase();
      if (!VALID_ESTADOS.includes(estadoNormalized)) {
        setErrorMessage(
          "Esta empresa no está disponible para vinculación. Contacta a tu empleador.",
        );
        return;
      }

      // Case F: valid empresa found
      setEmpresaEncontrada({
        $id: empresa.$id,
        nombre_empresa: empresa.nombre_empresa,
        estado: empresa.estado,
      });
    } catch (error) {
      // Log the real Appwrite error for debugging
      console.error("[verify-company] validateCompanyCode error:", error);
      setErrorMessage(
        "Ocurrió un error al validar el código. Intenta de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Persist the empresa $id and navigate to the next onboarding step.
   */
  const confirmCompany = async () => {
    if (!empresaEncontrada) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, empresaEncontrada.$id);
      await AsyncStorage.setItem(EMPRESA_NAME_KEY, empresaEncontrada.nombre_empresa);
      // Navigate to next onboarding step
      router.push("/(auth)/verify-account-type");
    } catch (_error) {
      setErrorMessage("Error al guardar la empresa. Intenta de nuevo.");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
      {/* Top App Bar with step indicator (step 1 of 5) */}
      <TopAppBar onBack={handleGoBack} currentStep={1} totalSteps={5} />

      {/* Main content */}
      <View className="flex-1 px-4">
        {/* Headline */}
        <Text className="text-[32px] font-poppins-bold leading-tight tracking-tight text-left pb-2 pt-2 text-gray-900 dark:text-sos-white">
          Vincula tu empresa
        </Text>

        {/* Description */}
        <Text className="pb-6 font-sans text-base leading-normal text-sos-gray dark:text-gray-400">
          Ingresa el código único proporcionado por tu empleador para acceder a
          tus beneficios.
        </Text>

        {/* Input section */}
        <View className="py-3">
          <Text className="pb-2 text-base leading-normal text-gray-900 font-poppins-medium dark:text-sos-white">
            Código de empresa
          </Text>

          {/* Input + inline Validar button */}
          <View
            className={`flex-row items-center h-14 rounded-xl border ${
              errorMessage
                ? "border-sos-red"
                : "border-gray-300 dark:border-gray-600"
            } bg-sos-white dark:bg-gray-800`}
          >
            <TextInput
              className="flex-1 px-4 h-full font-sans text-base text-gray-900 dark:text-sos-white"
              placeholder="Ej. EMP-1234"
              placeholderTextColor={scheme === "dark" ? "#6b7280" : "#617289"}
              value={companyCode}
              onChangeText={(text) => {
                setCompanyCode(text);
                setErrorMessage(null);
                setEmpresaEncontrada(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Código de empresa"
              accessibilityHint="Ingresa el código único de tu empresa"
              editable={!isLoading}
              onSubmitEditing={validateCompanyCode}
              returnKeyType="go"
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isLoading ? "Validando" : "Validar código"}
              disabled={isValidateDisabled}
              onPress={validateCompanyCode}
              className={`mx-2 h-10 px-4 rounded-lg items-center justify-center flex-row gap-2 bg-gray-100 dark:bg-gray-700 ${
                isValidateDisabled ? "opacity-50" : ""}`}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color={SOS_BLUEGREEN} />
                  <Text className="text-sm text-gray-900 font-poppins-bold dark:text-sos-white">
                    Validando…
                  </Text>
                </>
              ) : (
                <Text className="text-sm text-gray-900 font-poppins-bold dark:text-sos-white">
                  Validar
                </Text>
              )}
            </Pressable>
          </View>

          {/* Error message */}
          {errorMessage && (
            <Text
              className="mt-2 font-sans text-sm text-sos-red"
              accessibilityRole="alert"
            >
              {errorMessage}
            </Text>
          )}
        </View>

        {/* Company found card */}
        {empresaEncontrada && (
          <CompanyFoundCard
            nombreEmpresa={empresaEncontrada.nombre_empresa}
            estado={empresaEncontrada.estado}
            isVerified={
              empresaEncontrada.estado.toLowerCase() === "verificada"
            }
          />
        )}

        {/* Spacer */}
        <View className="flex-1" />

        {/* Bottom actions */}
        <View className="py-6 mt-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirmar empresa"
            accessibilityState={{ disabled: !empresaEncontrada }}
            disabled={!empresaEncontrada}
            onPress={confirmCompany}
            className={`w-full flex-row items-center justify-center rounded-xl h-12 px-5 bg-sos-bluegreen ${
              !empresaEncontrada ? "opacity-50" : ""}`}
            style={{
              shadowColor: SOS_BLUEGREEN,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-base font-poppins-bold leading-normal tracking-[0.015em] text-sos-white">
              Confirmar empresa
            </Text>
          </Pressable>

          <Text className="mt-4 text-xs text-center font-poppins-medium text-sos-gray dark:text-gray-500">
            Tu empresa deberá aprobar tu cuenta al finalizar el registro.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
