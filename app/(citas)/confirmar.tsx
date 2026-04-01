import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import TopAppBar from "@/components/auth/TopAppBar";
import TabScrollView from "@/components/shared/TabScrollView";
import SOSButton from "@/components/shared/SOSButton";
import {
    crearCita,
    getCurrentUser,
    findMiembroByAuthUserId,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFecha = (fecha: string): string =>
    new Intl.DateTimeFormat("es-NI", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(fecha + "T12:00:00"));

const formatHora = (hora: string): string => {
    const [h, m] = hora.split(":").map(Number);
    return new Intl.DateTimeFormat("es-NI", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(2000, 0, 1, h, m));
};

// ─── Fila de resumen ──────────────────────────────────────────────────────────

interface FilaResumenProps {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    label: string;
    value: string;
    isDark: boolean;
}

function FilaResumen({ icon, label, value, isDark }: FilaResumenProps) {
    const iconColor = isDark ? "#9CA3AF" : THEME_COLORS.sosGray;
    return (
        <View className="flex-row gap-3 items-start">
            <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700/60 items-center justify-center shrink-0 mt-0.5">
                <MaterialIcons name={icon} size={16} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium mb-0.5">
                    {label}
                </Text>
                <Text className="text-sm text-gray-900 capitalize dark:text-sos-white font-poppins-semibold">
                    {value}
                </Text>
            </View>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ConfirmarScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const {
        ubicacionNombre,
        eaServiceId,
        servicioNombre,
        eaProviderId,
        doctorNombre,
        fecha,
        hora,
        paraTitular,
        pacienteNombre,
        pacienteTelefono,
        pacienteCorreo,
        pacienteCedula,
    } = useLocalSearchParams<{
        ubicacionNombre: string;
        eaServiceId: string;
        servicioNombre: string;
        eaProviderId: string;
        doctorNombre: string;
        fecha: string;
        hora: string;
        paraTitular: string;      // "true" | "false"
        pacienteNombre: string;
        pacienteTelefono: string;
        pacienteCorreo: string;
        pacienteCedula: string;
    }>();

    const [loading, setLoading] = useState(false);

    const esTitular = paraTitular === "true";

    const handleConfirmar = async () => {
        setLoading(true);
        try {
            const user = await getCurrentUser();
            if (!user) throw new Error("No hay sesión activa.");

            const miembro = await findMiembroByAuthUserId(user.$id);
            if (!miembro) throw new Error("No se encontró el perfil de miembro.");

            // Build ISO datetime: combine fecha (YYYY-MM-DD) + hora (HH:mm)
            const fechaHoraCita = `${fecha}T${hora}:00.000+00:00`;

            await crearCita({
                miembro_id: miembro.$id,
                empresa_id: miembro.empresa_id as string,
                fecha_hora_cita: fechaHoraCita,
                ea_service_id: eaServiceId,
                ea_provider_id: eaProviderId,
                ea_customer_id: (miembro.ea_customer_id as string) ?? "",
                para_titular: esTitular,
                paciente_nombre: pacienteNombre,
                paciente_telefono: pacienteTelefono || null,
                paciente_correo: pacienteCorreo || null,
                paciente_cedula: pacienteCedula || null,
            });

            // Navegar fuera del flujo de citas al éxito
            router.dismissAll();
            router.replace("/(tabs)/citas");
        } catch (err) {
            Alert.alert(
                "Error al agendar",
                err instanceof Error ? err.message : "Ocurrió un error inesperado.",
                [{ text: "Entendido" }],
            );
        } finally {
            setLoading(false);
        }
    };

    const divider = <View className="h-px bg-gray-100 dark:bg-gray-700/60" />;

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={7}
                totalSteps={7}
            />

            <TabScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Título */}
                <Text className="pt-2 text-3xl tracking-tight leading-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Confirma tu cita
                </Text>
                <Text className="mt-1 mb-6 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                    Revisa los detalles antes de agendar.
                </Text>

                {/* Aviso estado pendiente */}
                <View className="flex-row gap-2 items-start px-3 py-3 mb-6 bg-amber-50 rounded-xl border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50">
                    <MaterialIcons name="schedule" size={16} color="#D97706" />
                    <Text className="flex-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400 font-poppins-medium">
                        Tu cita quedará en estado{" "}
                        <Text className="font-poppins-bold">pendiente</Text> hasta que un administrador la apruebe y coordine con la clínica.
                    </Text>
                </View>

                {/* Tarjeta: Servicio y ubicación */}
                <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] p-5 gap-4 mb-4">
                    <Text className="text-xs tracking-wide uppercase text-sos-gray dark:text-gray-500 font-poppins-semibold">
                        Servicio
                    </Text>
                    {divider}
                    <FilaResumen
                        icon="medical-services"
                        label="Especialidad"
                        value={servicioNombre}
                        isDark={isDark}
                    />
                    <FilaResumen
                        icon="location-on"
                        label="Ubicación"
                        value={ubicacionNombre}
                        isDark={isDark}
                    />
                </View>

                {/* Tarjeta: Doctor y fecha/hora */}
                <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] p-5 gap-4 mb-4">
                    <Text className="text-xs tracking-wide uppercase text-sos-gray dark:text-gray-500 font-poppins-semibold">
                        Cita
                    </Text>
                    {divider}
                    <FilaResumen
                        icon="person"
                        label="Doctor"
                        value={`${doctorNombre}`}
                        isDark={isDark}
                    />
                    <FilaResumen
                        icon="calendar-today"
                        label="Fecha"
                        value={formatFecha(fecha)}
                        isDark={isDark}
                    />
                    <FilaResumen
                        icon="access-time"
                        label="Hora"
                        value={formatHora(hora)}
                        isDark={isDark}
                    />
                </View>

                {/* Tarjeta: Paciente */}
                <View className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] p-5 gap-4 mb-8">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-xs tracking-wide uppercase text-sos-gray dark:text-gray-500 font-poppins-semibold">
                            Paciente
                        </Text>
                        {!esTitular && (
                            <View className="px-2 py-0.5 rounded-full bg-sos-bluegreen/10">
                                <Text className="text-xs text-sos-bluegreen font-poppins-semibold">
                                    Tercero
                                </Text>
                            </View>
                        )}
                    </View>
                    {divider}
                    <FilaResumen
                        icon="badge"
                        label="Nombre"
                        value={pacienteNombre}
                        isDark={isDark}
                    />
                    {!!pacienteTelefono && (
                        <FilaResumen
                            icon="phone"
                            label="Teléfono"
                            value={pacienteTelefono}
                            isDark={isDark}
                        />
                    )}
                    {!!pacienteCorreo && (
                        <FilaResumen
                            icon="email"
                            label="Correo"
                            value={pacienteCorreo}
                            isDark={isDark}
                        />
                    )}
                    {!!pacienteCedula && (
                        <FilaResumen
                            icon="credit-card"
                            label="Cédula"
                            value={pacienteCedula}
                            isDark={isDark}
                        />
                    )}
                </View>

                {/* Botón confirmar */}
                {loading ? (
                    <View className="items-center py-4">
                        <ActivityIndicator size="large" color={THEME_COLORS.sosBluegreen} />
                        <Text className="mt-3 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                            Agendando cita...
                        </Text>
                    </View>
                ) : (
                    <SOSButton
                        label="Confirmar cita"
                        onPress={handleConfirmar}
                    />
                )}
            </TabScrollView>
        </SafeAreaView>
    );
}
