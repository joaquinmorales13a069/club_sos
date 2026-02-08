import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopAppBar from "@/components/TopAppBar";
import TitularFoundCard from "@/components/TitularFoundCard";
import { findTitular } from "@/libs/appwrite";

// ─── Storage Keys ───────────────────────────────────────────
const EMPRESA_ID_KEY = "clubSOS.empresa_id";
const EMPRESA_NAME_KEY = "clubSOS.empresa_nombre";
const PARENTESCO_KEY = "clubSOS.miembro.parentesco";
const TITULAR_ID_KEY = "clubSOS.miembro.titular_miembro_id";
const TITULAR_SNAPSHOT_KEY = "clubSOS.miembro.titular_snapshot";

// Brand colour constants for inline style props (RN icon / shadow limitation)
const SOS_BLUEGREEN = "#0066CC";
const SOS_RED = "#CC3333";


// ─── Progress Config ────────────────────────────────────────
// Onboarding flow: 1 = verify-company, 2 = verify-account-type, 3 = link-main-account
const CURRENT_STEP = 3;
const TOTAL_STEPS = 5;

// ─── Types ──────────────────────────────────────────────────
interface FoundEmployee {
    $id: string;
    nombre_completo: string;
    documento_identidad: string;
    empresa_id: string;
}

// ─── Screen ─────────────────────────────────────────────────
export default function LinkMainAccountScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    // ─── State ──────────────────────────────────────────────
    const [employeeName, setEmployeeName] = useState("");
    const [employeeDocument, setEmployeeDocument] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [foundEmployee, setFoundEmployee] = useState<FoundEmployee | null>(
        null,
    );
    const [empresaName, setEmpresaName] = useState("");

    // ─── Guard: redirect if parentesco is "titular" ─────────
    // Also load the empresa name from storage (saved in verify-company step)
    useEffect(() => {
        (async () => {
            try {
                const [parentesco, storedName] = await Promise.all([
                    AsyncStorage.getItem(PARENTESCO_KEY),
                    AsyncStorage.getItem(EMPRESA_NAME_KEY),
                ]);

                if (parentesco === "titular") {
                    router.back();
                    return;
                }

                if (storedName) {
                    setEmpresaName(storedName);
                }
            } catch {
                // Silently ignore — worst case the user stays on screen
            }
        })();
    }, [router]);

    // ─── Handlers ───────────────────────────────────────────
    const handleGoBack = () => {
        router.back();
    };

    /** Query Appwrite `miembros` for the titular employee. */
    const handleSearch = async () => {
        const name = employeeName.trim();
        // Strip spaces, dashes and symbols — keep only alphanumeric chars
        const doc = employeeDocument.trim().replace(/[^A-Za-z0-9]/g, "").toUpperCase();

        if (!name || !doc) {
            setErrorMessage("Por favor completa ambos campos.");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");
        setFoundEmployee(null);

        try {
            const empresaId = await AsyncStorage.getItem(EMPRESA_ID_KEY);

            if (!empresaId) {
                setErrorMessage(
                    "No se encontró la empresa. Vuelve al paso anterior.",
                );
                setIsLoading(false);
                return;
            }

            const documents = await findTitular(empresaId, name, doc);

            if (documents.length === 0) {
                setErrorMessage(
                    "No se encontró ningún titular con los datos ingresados.",
                );
            } else if (documents.length > 1) {
                setErrorMessage(
                    "Se encontraron múltiples titulares. Verifica los datos e intenta de nuevo.",
                );
            } else {
                const employee = documents[0];
                setFoundEmployee({
                    $id: employee.$id,
                    nombre_completo: employee.nombre_completo as string,
                    documento_identidad: employee.documento_identidad as string,
                    empresa_id: employee.empresa_id as string,
                });
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Error al buscar el titular. Intenta de nuevo.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    /** Persist the titular's member ID and navigate forward. */
    const handleConfirm = async () => {
        if (!foundEmployee) return;

        try {
            await AsyncStorage.setItem(TITULAR_ID_KEY, foundEmployee.$id);
            await AsyncStorage.setItem(
                TITULAR_SNAPSHOT_KEY,
                JSON.stringify({
                    nombre_completo: foundEmployee.nombre_completo,
                    documento_identidad: foundEmployee.documento_identidad,
                }),
            );

            router.push("/(auth)/verify-account-info" as never);
        } catch (error) {
            console.error("[link-main-account] Error saving titular:", error);
        }
    };

    // ─── Render ─────────────────────────────────────────────
    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            {/* ── Top App Bar with step indicator (step 3 of 5) ── */}
            <TopAppBar
                onBack={handleGoBack}
                currentStep={CURRENT_STEP}
                totalSteps={TOTAL_STEPS}
            />

            {/* ── Scrollable Content ─────────────────────────────── */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Title + Description */}
                <View className="mb-8">
                    <Text className="mb-2 text-2xl leading-tight text-gray-900 font-poppins-bold dark:text-sos-white">
                        Busca al titular
                    </Text>
                    <Text className="font-sans text-base leading-relaxed text-sos-gray dark:text-gray-300">
                        Ingresa los datos del trabajador de{" "}
                        <Text className="font-poppins-semibold text-gray-800 dark:text-gray-200">
                            {empresaName || "la empresa"}
                        </Text>{" "}
                        para vincular tu cuenta como beneficiario.
                    </Text>
                </View>

                {/* ── Search Form ──────────────────────────────────── */}
                <View style={{ gap: 24 }}>
                    {/* Input: Nombre completo */}
                    <View style={{ gap: 8 }}>
                        <Text className="text-sm text-gray-900 font-poppins-bold dark:text-gray-200">
                            Nombre completo del titular
                        </Text>
                        <View className="relative">
                            <View className="absolute top-0 bottom-0 left-4 z-10 justify-center">
                                <MaterialIcons
                                    name="person"
                                    size={22}
                                    color="#9ca3af"
                                />
                            </View>
                            <TextInput
                                accessibilityLabel="Nombre completo del titular"
                                placeholder="Ej. Juan Pérez"
                                placeholderTextColor={
                                    isDark ? "#6b7280" : "#9ca3af"
                                }
                                value={employeeName}
                                onChangeText={(text) => {
                                    setEmployeeName(text);
                                    if (errorMessage) setErrorMessage("");
                                    if (foundEmployee) setFoundEmployee(null);
                                }}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A262B] text-gray-900 dark:text-sos-white text-base font-sans"
                                style={{
                                    paddingVertical: 14,
                                    paddingLeft: 48,
                                    paddingRight: 16,
                                }}
                                autoCapitalize="words"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Input: Documento de identidad */}
                    <View style={{ gap: 8 }}>
                        <Text className="text-sm text-gray-900 font-poppins-bold dark:text-gray-200">
                            Documento de identidad
                        </Text>
                        <View className="relative">
                            <View className="absolute top-0 bottom-0 left-4 z-10 justify-center">
                                <MaterialIcons
                                    name="badge"
                                    size={22}
                                    color="#9ca3af"
                                />
                            </View>
                            <TextInput
                                accessibilityLabel="Documento de identidad"
                                placeholder="Ej. 0012412970005N"
                                placeholderTextColor={
                                    isDark ? "#6b7280" : "#9ca3af"
                                }
                                value={employeeDocument}
                                onChangeText={(text) => {
                                    setEmployeeDocument(text);
                                    if (errorMessage) setErrorMessage("");
                                    if (foundEmployee) setFoundEmployee(null);
                                }}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A262B] text-gray-900 dark:text-sos-white text-base font-sans"
                                style={{
                                    paddingVertical: 14,
                                    paddingLeft: 48,
                                    paddingRight: 16,
                                }}
                                keyboardType="default"
                                autoCapitalize="characters"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Search Button (Secondary — AzulVerde) */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Buscar titular"
                        onPress={handleSearch}
                        disabled={isLoading}
                        className="flex-row justify-center items-center mt-2 w-full rounded-full bg-sos-bluegreen active:opacity-90"
                        style={[
                            { paddingVertical: 14, paddingHorizontal: 16 },
                            {
                                shadowColor: SOS_BLUEGREEN,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 10,
                                elevation: 4,
                            },
                            isLoading && { opacity: 0.7 },
                        ]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="search"
                                    size={20}
                                    color="#ffffff"
                                    style={{ marginRight: 8 }}
                                />
                                <Text className="text-base font-poppins-bold text-sos-white">
                                    Buscar titular
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                {/* ── Error Message ────────────────────────────────── */}
                {errorMessage ? (
                    <View
                        className="flex-row items-start p-4 mt-6 bg-red-50 rounded-xl dark:bg-red-900/20"
                        style={{ gap: 10 }}
                    >
                        <MaterialIcons
                            name="error-outline"
                            size={20}
                            color={SOS_RED}
                        />
                        <Text className="flex-1 text-sm font-poppins-medium text-sos-red">
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}

                {/* ── Divider ──────────────────────────────────────── */}
                {foundEmployee ? (
                    <View className="py-8">
                        <View className="w-full border-t border-gray-100 dark:border-gray-800" />
                    </View>
                ) : null}

                {/* ── Success Card (Titular Found) ─────────────────── */}
                {foundEmployee ? (
                    <TitularFoundCard
                        nombreCompleto={foundEmployee.nombre_completo}
                        documentoIdentidad={foundEmployee.documento_identidad}
                        nombreEmpresa={empresaName || "Empresa vinculada"}
                    />
                ) : null}
            </ScrollView>

            {/* ── Sticky Footer: Confirm CTA ─────────────────────── */}
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
                    accessibilityLabel="Confirmar vínculo"
                    accessibilityState={{ disabled: !foundEmployee }}
                    onPress={handleConfirm}
                    disabled={!foundEmployee}
                    className={`w-full flex-row items-center justify-center rounded-full h-14 bg-sos-bluegreen active:opacity-90 ${
                        !foundEmployee ? "opacity-50" : ""}`}
                    style={{
                        shadowColor: SOS_BLUEGREEN,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.39,
                        shadowRadius: 14,
                        elevation: 6,
                    }}
                >
                    <Text className="text-base font-poppins-bold text-sos-white">
                        Confirmar vínculo
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
