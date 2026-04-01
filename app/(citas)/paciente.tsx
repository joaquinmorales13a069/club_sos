import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import TopAppBar from "@/components/auth/TopAppBar";
import SOSButton from "@/components/shared/SOSButton";
import { getCurrentUser, findMiembroByAuthUserId } from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModoAgendamiento = "titular" | "tercero";

interface DatosPaciente {
    nombre: string;
    telefono: string;
    noTieneTelefono: boolean;
    cedula: string;
    correo: string;
    noTieneCorreo: boolean;
}

interface FormErrors {
    nombre?: string;
    telefono?: string;
    correo?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Componentes internos ────────────────────────────────────────────────────

interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    isDark: boolean;
    error?: string;
    optional?: boolean;
    disabled?: boolean;
    keyboardType?: "default" | "phone-pad" | "email-address";
    autoCapitalize?: "none" | "sentences" | "words";
}

function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    isDark,
    error,
    optional = false,
    disabled = false,
    keyboardType = "default",
    autoCapitalize = "words",
}: InputFieldProps) {
    const borderColor = error
        ? "#CC3333"
        : isDark
          ? "#4B5563"
          : "#D1D5DB";

    return (
        <View>
            <View className="flex-row items-center gap-1 mb-1.5">
                <Text className="text-sm text-gray-900 dark:text-sos-white font-poppins-medium">
                    {label}
                </Text>
                {optional && (
                    <Text className="text-xs text-sos-gray dark:text-gray-500 font-poppins-medium">
                        (opcional)
                    </Text>
                )}
            </View>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                editable={!disabled}
                style={{
                    height: 52,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor,
                    paddingHorizontal: 16,
                    fontSize: 15,
                    color: isDark ? "#FFFFFF" : "#111827",
                    backgroundColor: disabled
                        ? isDark ? "#111827" : "#F9FAFB"
                        : isDark ? "#1E2A38" : "#FFFFFF",
                    fontFamily: "Poppins_400Regular",
                    opacity: disabled ? 0.5 : 1,
                }}
            />
            {error && (
                <Text className="mt-1 text-xs text-sos-red font-poppins-medium">
                    {error}
                </Text>
            )}
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PacienteScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const {
        categoriaId,
        ubicacionNombre,
        eaServiceId,
        servicioNombre,
        servicioDuracion,
        eaProviderId,
        doctorNombre,
        fecha,
        hora,
    } = useLocalSearchParams<{
        categoriaId: string;
        ubicacionNombre: string;
        eaServiceId: string;
        servicioNombre: string;
        servicioDuracion: string;
        eaProviderId: string;
        doctorNombre: string;
        fecha: string;
        hora: string;
    }>();

    // ─── Estado del miembro (para "Para mí") ──────────────────
    const [miembroNombre, setMiembroNombre] = useState("");
    const [miembroTelefono, setMiembroTelefono] = useState("");
    const [miembroCorreo, setMiembroCorreo] = useState("");
    const [loadingMiembro, setLoadingMiembro] = useState(true);

    // ─── Modo de agendamiento ─────────────────────────────────
    const [modo, setModo] = useState<ModoAgendamiento>("titular");

    // ─── Formulario de tercero ────────────────────────────────
    const [datos, setDatos] = useState<DatosPaciente>({
        nombre: "",
        telefono: "",
        noTieneTelefono: false,
        cedula: "",
        correo: "",
        noTieneCorreo: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // ─── Carga datos del miembro ──────────────────────────────
    const loadMiembro = useCallback(async () => {
        try {
            const user = await getCurrentUser();
            if (!user) return;
            const doc = await findMiembroByAuthUserId(user.$id);
            if (!doc) return;
            setMiembroNombre(doc.nombre_completo as string);
            setMiembroTelefono(doc.telefono as string);
            setMiembroCorreo((doc.correo as string) ?? "");
        } catch {
            // silencioso — si falla igual puede continuar
        } finally {
            setLoadingMiembro(false);
        }
    }, []);

    useEffect(() => {
        loadMiembro();
    }, [loadMiembro]);

    // ─── Helpers de formulario ────────────────────────────────
    const setField = (field: keyof DatosPaciente, value: string | boolean) => {
        setDatos((prev) => ({ ...prev, [field]: value }));
        if (field in errors) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!datos.nombre.trim()) {
            newErrors.nombre = "El nombre completo es obligatorio";
        }
        if (!datos.noTieneTelefono && !datos.telefono.trim()) {
            newErrors.telefono = "El teléfono es obligatorio";
        }
        if (!datos.noTieneCorreo && datos.correo.trim()) {
            if (!EMAIL_REGEX.test(datos.correo.trim())) {
                newErrors.correo = "Formato de correo inválido";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ─── Continuar ────────────────────────────────────────────
    const handleContinuar = () => {
        Keyboard.dismiss();

        if (modo === "titular") {
            router.push({
                pathname: "/(citas)/confirmar",
                params: {
                    ubicacionNombre,
                    eaServiceId,
                    servicioNombre,
                    eaProviderId,
                    doctorNombre,
                    fecha,
                    hora,
                    paraTitular: "true",
                    pacienteNombre: miembroNombre,
                    pacienteTelefono: miembroTelefono,
                    pacienteCorreo: miembroCorreo,
                    pacienteCedula: "",
                },
            });
            return;
        }

        if (!validate()) return;

        router.push({
            pathname: "/(citas)/confirmar",
            params: {
                ubicacionNombre,
                eaServiceId,
                servicioNombre,
                eaProviderId,
                doctorNombre,
                fecha,
                hora,
                paraTitular: "false",
                pacienteNombre: datos.nombre,
                pacienteTelefono: datos.noTieneTelefono ? miembroTelefono : datos.telefono,
                pacienteCorreo: datos.noTieneCorreo ? "" : datos.correo,
                pacienteCedula: datos.cedula,
            },
        });
    };

    const grayIcon = isDark ? "#9CA3AF" : THEME_COLORS.sosGray;
    const inputBg = isDark ? "#1E2A38" : "#FFFFFF";

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={6}
                totalSteps={7}
            />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Título */}
                        <Text className="pt-2 text-3xl leading-tight tracking-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                            ¿Para quién es la cita?
                        </Text>

                        {/* Resumen de selecciones previas */}
                        <View className="flex-row flex-wrap gap-3 mt-2 mb-6">
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="calendar-today" size={13} color={THEME_COLORS.sosBluegreen} />
                                <Text className="text-xs text-sos-bluegreen font-poppins-medium capitalize">
                                    {new Intl.DateTimeFormat("es-NI", { weekday: "short", day: "numeric", month: "short" }).format(new Date(fecha + "T12:00:00"))}
                                    {" · "}
                                    {new Intl.DateTimeFormat("es-NI", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(`2000-01-01T${hora}`))}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="person" size={13} color={grayIcon} />
                                <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                                    Dr. {doctorNombre}
                                </Text>
                            </View>
                        </View>

                        {/* Selector de modo */}
                        <View className="flex-row gap-3 mb-6">
                            {(["titular", "tercero"] as ModoAgendamiento[]).map((m) => {
                                const activo = modo === m;
                                const label = m === "titular" ? "Para mí" : "Para otra persona";
                                const icon = m === "titular" ? "person" : "person-add" as const;
                                return (
                                    <Pressable
                                        key={m}
                                        onPress={() => setModo(m)}
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: activo }}
                                        className="flex-1 active:opacity-75"
                                    >
                                        <View
                                            style={activo ? { borderColor: THEME_COLORS.sosBluegreen, borderWidth: 2 } : { borderColor: isDark ? "#4B5563" : "#E5E7EB", borderWidth: 1.5 }}
                                            className="items-center py-4 px-2 rounded-2xl bg-white dark:bg-[#151f2b]"
                                        >
                                            <View
                                                style={{ backgroundColor: activo ? THEME_COLORS.sosBluegreen : isDark ? "#374151" : "#F3F4F6" }}
                                                className="w-10 h-10 rounded-full items-center justify-center mb-2"
                                            >
                                                <MaterialIcons name={icon} size={20} color={activo ? "#FFFFFF" : grayIcon} />
                                            </View>
                                            <Text
                                                className="text-xs text-center font-poppins-semibold"
                                                style={{ color: activo ? THEME_COLORS.sosBluegreen : isDark ? "#9CA3AF" : "#6B7280" }}
                                            >
                                                {label}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* ── Modo: Para mí ── */}
                        {modo === "titular" && (
                            loadingMiembro ? (
                                <View className="items-center py-8">
                                    <ActivityIndicator size="large" color={THEME_COLORS.sosBluegreen} />
                                </View>
                            ) : (
                                <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] p-5 gap-4">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-12 h-12 rounded-full bg-sos-bluegreen/15 items-center justify-center shrink-0">
                                            <MaterialIcons name="person" size={22} color={THEME_COLORS.sosBluegreen} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base text-gray-900 dark:text-sos-white font-poppins-bold" numberOfLines={1}>
                                                {miembroNombre || "—"}
                                            </Text>
                                            <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                                                Titular de la cuenta
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                    <View className="gap-3">
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons name="phone" size={16} color={grayIcon} />
                                            <Text className="text-sm text-gray-700 dark:text-gray-300 font-poppins-medium">
                                                {miembroTelefono || "No registrado"}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons name="email" size={16} color={grayIcon} />
                                            <Text className="text-sm text-gray-700 dark:text-gray-300 font-poppins-medium">
                                                {miembroCorreo || "No registrado"}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        )}

                        {/* ── Modo: Para un tercero ── */}
                        {modo === "tercero" && (
                            <View className="gap-4">
                                {/* Aviso informativo */}
                                <View className="flex-row items-start gap-2 px-3 py-3 rounded-xl bg-sos-bluegreen/10 dark:bg-sos-bluegreen/5 border border-sos-bluegreen/20">
                                    <MaterialIcons name="info-outline" size={16} color={THEME_COLORS.sosBluegreen} />
                                    <Text className="flex-1 text-xs leading-relaxed text-sos-bluegreen dark:text-sos-bluegreen font-poppins-medium">
                                        Ingresa los datos de la persona que asistirá a la cita. Solo el nombre es obligatorio.
                                    </Text>
                                </View>

                                <InputField
                                    label="Nombre completo"
                                    value={datos.nombre}
                                    onChangeText={(v) => setField("nombre", v)}
                                    placeholder="Ej. María López García"
                                    isDark={isDark}
                                    error={errors.nombre}
                                />

                                {/* Teléfono + toggle "No tiene teléfono" */}
                                <View>
                                    <InputField
                                        label="Teléfono"
                                        value={datos.telefono}
                                        onChangeText={(v) => setField("telefono", v)}
                                        placeholder="Ej. +505 8888-8888"
                                        isDark={isDark}
                                        error={errors.telefono}
                                        keyboardType="phone-pad"
                                        autoCapitalize="none"
                                        disabled={datos.noTieneTelefono}
                                    />

                                    {/* Toggle no tiene teléfono */}
                                    <Pressable
                                        onPress={() => {
                                            const next = !datos.noTieneTelefono;
                                            setDatos((prev) => ({
                                                ...prev,
                                                noTieneTelefono: next,
                                                telefono: next ? "" : prev.telefono,
                                            }));
                                            setErrors((prev) => ({ ...prev, telefono: undefined }));
                                        }}
                                        accessibilityRole="checkbox"
                                        accessibilityState={{ checked: datos.noTieneTelefono }}
                                        className="flex-row items-center gap-2 mt-2 active:opacity-70"
                                    >
                                        <View
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 4,
                                                borderWidth: datos.noTieneTelefono ? 0 : 1.5,
                                                borderColor: isDark ? "#4B5563" : "#D1D5DB",
                                                backgroundColor: datos.noTieneTelefono ? THEME_COLORS.sosBluegreen : "transparent",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {datos.noTieneTelefono && (
                                                <MaterialIcons name="check" size={13} color="#FFFFFF" />
                                            )}
                                        </View>
                                        <Text className="text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                                            No tiene teléfono
                                        </Text>
                                    </Pressable>

                                    {/* Aviso: se usará el contacto del titular */}
                                    {datos.noTieneTelefono && (
                                        <View className="flex-row items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-sos-bluegreen/10 dark:bg-sos-bluegreen/5 border border-sos-bluegreen/20">
                                            <MaterialIcons name="info-outline" size={14} color={THEME_COLORS.sosBluegreen} />
                                            <Text className="flex-1 text-xs text-sos-bluegreen font-poppins-medium">
                                                Se utilizará el contacto del dueño de la cuenta
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <InputField
                                    label="Cédula de identidad"
                                    value={datos.cedula}
                                    onChangeText={(v) => setField("cedula", v)}
                                    placeholder="Ej. 001-280390-0001X"
                                    isDark={isDark}
                                    optional
                                    autoCapitalize="characters"
                                />

                                {/* Correo + toggle "No tiene correo" */}
                                <View>
                                    <View className="flex-row items-center gap-1 mb-1.5">
                                        <Text className="text-sm text-gray-900 dark:text-sos-white font-poppins-medium">
                                            Correo electrónico
                                        </Text>
                                        <Text className="text-xs text-sos-gray dark:text-gray-500 font-poppins-medium">
                                            (opcional)
                                        </Text>
                                    </View>
                                    <TextInput
                                        value={datos.correo}
                                        onChangeText={(v) => setField("correo", v)}
                                        placeholder="Ej. maria@correo.com"
                                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!datos.noTieneCorreo}
                                        style={{
                                            height: 52,
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: errors.correo ? "#CC3333" : isDark ? "#4B5563" : "#D1D5DB",
                                            paddingHorizontal: 16,
                                            fontSize: 15,
                                            color: isDark ? "#FFFFFF" : "#111827",
                                            backgroundColor: datos.noTieneCorreo
                                                ? isDark ? "#111827" : "#F9FAFB"
                                                : inputBg,
                                            fontFamily: "Poppins_400Regular",
                                            opacity: datos.noTieneCorreo ? 0.5 : 1,
                                        }}
                                    />
                                    {errors.correo && (
                                        <Text className="mt-1 text-xs text-sos-red font-poppins-medium">
                                            {errors.correo}
                                        </Text>
                                    )}

                                    {/* Toggle no tiene correo */}
                                    <Pressable
                                        onPress={() => {
                                            const next = !datos.noTieneCorreo;
                                            setDatos((prev) => ({ ...prev, noTieneCorreo: next, correo: next ? "" : prev.correo }));
                                            setErrors((prev) => ({ ...prev, correo: undefined }));
                                        }}
                                        accessibilityRole="checkbox"
                                        accessibilityState={{ checked: datos.noTieneCorreo }}
                                        className="flex-row items-center gap-2 mt-2 active:opacity-70"
                                    >
                                        <View
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 4,
                                                borderWidth: datos.noTieneCorreo ? 0 : 1.5,
                                                borderColor: isDark ? "#4B5563" : "#D1D5DB",
                                                backgroundColor: datos.noTieneCorreo ? THEME_COLORS.sosBluegreen : "transparent",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {datos.noTieneCorreo && (
                                                <MaterialIcons name="check" size={13} color="#FFFFFF" />
                                            )}
                                        </View>
                                        <Text className="text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                                            No tiene correo electrónico
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {/* Botón continuar */}
                        <View className="mt-8">
                            <SOSButton
                                label="Continuar"
                                onPress={handleContinuar}
                                disabled={modo === "titular" && loadingMiembro}
                            />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
