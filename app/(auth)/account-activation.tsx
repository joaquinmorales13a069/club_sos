import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopAppBar from "@/components/TopAppBar";
import { account, findMiembroByAuthUserId } from "@/libs/appwrite";

// ─── Storage Keys (read-only) ────────────────────────────────
const EMPRESA_ID_KEY = "clubSOS.empresa_id";
const PARENTESCO_KEY = "clubSOS.miembro.parentesco";
const TITULAR_ID_KEY = "clubSOS.miembro.titular_miembro_id";
const DRAFT_KEY = "clubSOS.miembro.draft";

// Brand colour constants for inline style props (RN icon / shadow limitation)
const SOS_BLUEGREEN = "#0066CC";

// ─── Progress Config ─────────────────────────────────────────
const CURRENT_STEP = 5;
const TOTAL_STEPS = 5;

// ─── Types ───────────────────────────────────────────────────
interface MiembroDraft {
    nombre_completo: string;
    documento_identidad: string;
    fecha_nacimiento: string; // ISO string
    sexo: string;
    telefono: string;
    correo: string | null;
}

// ─── Screen ──────────────────────────────────────────────────
export default function AccountActivationScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    // ─── State ───────────────────────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [draft, setDraft] = useState<MiembroDraft | null>(null);
    const [parentesco, setParentesco] = useState<string | null>(null);
    const [hasTitular, setHasTitular] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // ─── Load data from AsyncStorage on mount ────────────────
    useEffect(() => {
        (async () => {
            try {
                const [rawDraft, storedParentesco, titularId, empresaId] =
                    await Promise.all([
                        AsyncStorage.getItem(DRAFT_KEY),
                        AsyncStorage.getItem(PARENTESCO_KEY),
                        AsyncStorage.getItem(TITULAR_ID_KEY),
                        AsyncStorage.getItem(EMPRESA_ID_KEY),
                    ]);

                if (rawDraft) {
                    setDraft(JSON.parse(rawDraft) as MiembroDraft);
                }

                setParentesco(storedParentesco);
                setHasTitular(!!titularId);

                // empresaId read but not displayed — confirms context is valid
                if (!empresaId) {
                    console.warn(
                        "[account-activation] No empresa_id found in storage.",
                    );
                }
            } catch (error) {
                console.error(
                    "[account-activation] Error loading data:",
                    error,
                );
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // ─── Helpers ─────────────────────────────────────────────
    /** Format ISO date string → DD/MM/YYYY */
    const formatDate = (isoString: string): string => {
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;
            const dd = String(date.getDate()).padStart(2, "0");
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yyyy = String(date.getFullYear());
            return `${dd}/${mm}/${yyyy}`;
        } catch {
            return isoString;
        }
    };

    /** Whether the parentesco indicates a dependent (non-titular) */
    const isDependant =
        parentesco === "conyuge" ||
        parentesco === "hijo" ||
        parentesco === "familiar";

    // ─── Handlers ────────────────────────────────────────────
    const handleGoBack = () => {
        router.back();
    };

    const handleRefreshStatus = async () => {
        setIsRefreshing(true);
        try {
            const currentUser = await account.get();
            const miembro = await findMiembroByAuthUserId(currentUser.$id);

            if (miembro && miembro.activo === true) {
                // Account has been approved — navigate to the main app
                router.replace("/(tabs)" as never);
                return;
            }

            // Still pending — no action needed, UI already shows pending state
        } catch (error) {
            console.error(
                "[account-activation] Error checking estado:",
                error,
            );
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleContactSupport = () => {
        // TODO: Navigate to support screen or open email/chat
        console.log("[account-activation] Contactar soporte — placeholder");
    };

    // ─── Loading state ───────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
                <TopAppBar
                    onBack={handleGoBack}
                    currentStep={CURRENT_STEP}
                    totalSteps={TOTAL_STEPS}
                />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={SOS_BLUEGREEN} />
                    <Text className="mt-4 text-sm font-poppins-medium text-sos-gray dark:text-gray-400">
                        Cargando información…
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // ─── Render ──────────────────────────────────────────────
    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            {/* ── Top App Bar with step indicator (step 5 of 5) ── */}
            <TopAppBar
                onBack={handleGoBack}
                currentStep={CURRENT_STEP}
                totalSteps={TOTAL_STEPS}
            />

            {/* ── Scrollable Content ─────────────────────────────── */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero Section ────────────────────────────────── */}
                <View className="items-center px-6 pt-4 pb-2">
                    {/* Illustration placeholder */}
                    <View
                        className="items-center justify-center w-48 h-48 mb-6 rounded-3xl"
                        style={{
                            backgroundColor: isDark
                                ? "rgba(0, 102, 204, 0.08)"
                                : "rgba(0, 102, 204, 0.06)",
                        }}
                    >
                        <View
                            className="items-center justify-center w-24 h-24 rounded-full"
                            style={{
                                backgroundColor: isDark
                                    ? "rgba(0, 102, 204, 0.15)"
                                    : "rgba(0, 102, 204, 0.1)",
                            }}
                        >
                            <MaterialIcons
                                name="hourglass-top"
                                size={48}
                                color={SOS_BLUEGREEN}
                            />
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-2xl leading-tight text-center text-gray-900 font-poppins-bold dark:text-sos-white mb-3">
                        Cuenta en revisión
                    </Text>

                    {/* Description */}
                    <Text className="text-base leading-relaxed text-center font-sans text-sos-gray dark:text-gray-400 mb-6 px-2">
                        Tu empresa debe aprobar tu cuenta antes de que puedas
                        usar los beneficios.
                    </Text>

                    {/* Status Badge */}
                    <View
                        className="flex-row items-center px-4 py-2.5 rounded-full mb-8"
                        style={{
                            backgroundColor: isDark
                                ? "rgba(0, 102, 204, 0.12)"
                                : "rgba(0, 102, 204, 0.08)",
                            borderWidth: 1,
                            borderColor: isDark
                                ? "rgba(0, 102, 204, 0.25)"
                                : "rgba(0, 102, 204, 0.15)",
                        }}
                    >
                        <MaterialIcons
                            name="hourglass-top"
                            size={18}
                            color={SOS_BLUEGREEN}
                            style={{ marginRight: 8 }}
                        />
                        <Text className="text-sm font-poppins-semibold text-sos-bluegreen">
                            Pendiente de aprobación
                        </Text>
                    </View>
                </View>

                {/* ── Miembro Summary Card ────────────────────────── */}
                {draft && (
                    <View className="px-6">
                        <View
                            className="p-5 rounded-2xl bg-sos-white dark:bg-[#151f2b]"
                            style={{
                                shadowColor: "#000000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: isDark ? 0 : 0.06,
                                shadowRadius: 8,
                                elevation: isDark ? 0 : 2,
                                borderWidth: isDark ? 1 : 0,
                                borderColor: isDark
                                    ? "rgba(255, 255, 255, 0.06)"
                                    : "transparent",
                            }}
                        >
                            {/* Section header */}
                            <View
                                className="flex-row items-center mb-5"
                                style={{ gap: 8 }}
                            >
                                <View
                                    className="items-center justify-center w-8 h-8 rounded-lg"
                                    style={{
                                        backgroundColor: isDark
                                            ? "rgba(0, 102, 204, 0.15)"
                                            : "#eff6ff",
                                    }}
                                >
                                    <MaterialIcons
                                        name="person"
                                        size={18}
                                        color={SOS_BLUEGREEN}
                                    />
                                </View>
                                <Text className="text-sm tracking-widest uppercase font-poppins-bold text-sos-gray dark:text-gray-400">
                                    Resumen del miembro
                                </Text>
                            </View>

                            {/* Fields */}
                            <View style={{ gap: 16 }}>
                                {/* Nombre completo */}
                                <SummaryRow
                                    label="Nombre completo"
                                    value={draft.nombre_completo}
                                    isDark={isDark}
                                />

                                {/* Documento de identidad */}
                                <SummaryRow
                                    label="Documento de identidad"
                                    value={draft.documento_identidad}
                                    isDark={isDark}
                                />

                                {/* Sexo */}
                                <SummaryRow
                                    label="Sexo"
                                    value={draft.sexo}
                                    isDark={isDark}
                                />

                                {/* Fecha de nacimiento */}
                                <SummaryRow
                                    label="Fecha de nacimiento"
                                    value={formatDate(draft.fecha_nacimiento)}
                                    isDark={isDark}
                                />

                                {/* Teléfono */}
                                <SummaryRow
                                    label="Teléfono"
                                    value={draft.telefono}
                                    isDark={isDark}
                                />

                                {/* Correo */}
                                <SummaryRow
                                    label="Correo"
                                    value={
                                        draft.correo ?? "No proporcionado"
                                    }
                                    isPlaceholder={draft.correo === null}
                                    isDark={isDark}
                                />

                                {/* Titular vinculado (conditional) */}
                                {isDependant && (
                                    <SummaryRow
                                        label="Titular vinculado"
                                        value="Empleado vinculado correctamente"
                                        isDark={isDark}
                                        icon={
                                            hasTitular
                                                ? "check-circle"
                                                : "link"
                                        }
                                        iconColor={
                                            hasTitular
                                                ? "#22c55e"
                                                : SOS_BLUEGREEN
                                        }
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* ── Actions ─────────────────────────────────────── */}
                <View
                    className="px-6 mt-8 items-center"
                    style={{ gap: 16 }}
                >
                    {/* Actualizar estado — outline/ghost button */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Actualizar estado de aprobación"
                        onPress={handleRefreshStatus}
                        disabled={isRefreshing}
                        className="w-full flex-row items-center justify-center py-3.5 px-6 rounded-xl bg-sos-white dark:bg-transparent active:opacity-80"
                        style={{
                            borderWidth: 2,
                            borderColor: isDark
                                ? "rgba(0, 102, 204, 0.4)"
                                : "rgba(0, 102, 204, 0.3)",
                            opacity: isRefreshing ? 0.7 : 1,
                        }}
                    >
                        {isRefreshing ? (
                            <ActivityIndicator
                                size="small"
                                color={SOS_BLUEGREEN}
                                style={{ marginRight: 8 }}
                            />
                        ) : (
                            <MaterialIcons
                                name="refresh"
                                size={20}
                                color={SOS_BLUEGREEN}
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text className="text-base font-poppins-semibold text-sos-bluegreen">
                            Actualizar estado
                        </Text>
                    </Pressable>

                    {/* Contactar soporte — text button */}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Contactar soporte"
                        onPress={handleContactSupport}
                        className="flex-row items-center justify-center py-2 px-4 active:opacity-70"
                        style={{ gap: 6 }}
                    >
                        <MaterialIcons
                            name="support-agent"
                            size={18}
                            color={SOS_BLUEGREEN}
                        />
                        <Text className="text-sm font-poppins-medium text-sos-bluegreen">
                            Contactar soporte
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Summary Row Component ──────────────────────────────────
interface SummaryRowProps {
    label: string;
    value: string;
    isDark: boolean;
    isPlaceholder?: boolean;
    icon?: keyof typeof MaterialIcons.glyphMap;
    iconColor?: string;
}

function SummaryRow({
    label,
    value,
    isDark,
    isPlaceholder = false,
    icon,
    iconColor,
}: SummaryRowProps) {
    return (
        <View
            className="pb-4 border-b"
            style={{
                borderBottomColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.05)",
            }}
        >
            <Text className="text-xs font-poppins-medium text-sos-gray dark:text-gray-500 mb-1 uppercase tracking-wide">
                {label}
            </Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
                {icon && (
                    <MaterialIcons
                        name={icon}
                        size={16}
                        color={iconColor ?? (isDark ? "#9ca3af" : "#6b7280")}
                    />
                )}
                <Text
                    className={`text-base ${
                        isPlaceholder
                            ? "font-sans text-sos-gray dark:text-gray-500 italic"
                            : "font-poppins-medium text-gray-900 dark:text-sos-white"
                    }`}
                >
                    {value}
                </Text>
            </View>
        </View>
    );
}
