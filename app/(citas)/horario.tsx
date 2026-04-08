import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import { getDisponibilidad } from "@/libs/eaApi";
import { THEME_COLORS } from "@/libs/themeColors";

// ─── Helper ───────────────────────────────────────────────────────────────────

const formatHora = (hora: string): string => {
    const [h, m] = hora.split(":").map(Number);
    const date = new Date(2000, 0, 1, h, m);
    return new Intl.DateTimeFormat("es-NI", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

// ─── Chip de hora ─────────────────────────────────────────────────────────────

interface HoraChipProps {
    hora: string;
    seleccionada: boolean;
    isDark: boolean;
    onPress: () => void;
}

function HoraChip({ hora, seleccionada, isDark, onPress }: HoraChipProps) {
    const borderColor = isDark ? "#4B5563" : "#D1D5DB";
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Horario ${formatHora(hora)}`}
            accessibilityState={{ selected: seleccionada }}
            className="active:opacity-75"
            style={{ width: "48%" }}
        >
            <View
                style={
                    seleccionada
                        ? { backgroundColor: THEME_COLORS.sosBluegreen }
                        : { borderWidth: 1, borderColor }
                }
                className="justify-center items-center py-3 rounded-xl"
            >
                <Text
                    className={`text-sm font-poppins-semibold ${
                        seleccionada
                            ? "text-sos-white"
                            : "text-gray-700 dark:text-gray-200"
                    }`}
                >
                    {formatHora(hora)}
                </Text>
            </View>
        </Pressable>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HorarioScreen() {
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
        citaIdToEdit,
    } = useLocalSearchParams<{
        categoriaId: string;
        ubicacionNombre: string;
        eaServiceId: string;
        servicioNombre: string;
        servicioDuracion: string;
        eaProviderId: string;
        doctorNombre: string;
        fecha: string;
        citaIdToEdit?: string;
    }>();

    const [horarios, setHorarios] = useState<string[]>([]);
    const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadHorarios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setHoraSeleccionada(null);
            const data = await getDisponibilidad(
                parseInt(eaProviderId),
                parseInt(eaServiceId),
                fecha,
            );

            // Filtrar slots que queden dentro de las próximas 24 horas
            const minTimestamp = Date.now() + 24 * 60 * 60 * 1000;
            const horariosValidos = data.filter((hora) => {
                const [h, m] = hora.split(":").map(Number);
                const slotDate = new Date(`${fecha}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
                return slotDate.getTime() >= minTimestamp;
            });
            setHorarios(horariosValidos);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al consultar disponibilidad",
            );
        } finally {
            setLoading(false);
        }
    }, [eaProviderId, eaServiceId, fecha]);

    useEffect(() => {
        loadHorarios();
    }, [loadHorarios]);

    const handleContinuar = () => {
        if (!horaSeleccionada) return;
        router.push({
            pathname: "/(citas)/paciente",
            params: {
                categoriaId,
                ubicacionNombre,
                eaServiceId,
                servicioNombre,
                servicioDuracion,
                eaProviderId,
                doctorNombre,
                fecha,
                hora: horaSeleccionada,
                ...(citaIdToEdit ? { citaIdToEdit } : {}),
            },
        });
    };

    const fechaLegible = new Intl.DateTimeFormat("es-NI", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date(fecha + "T12:00:00"));

    const grayIconColor = isDark ? "#9CA3AF" : THEME_COLORS.sosGray;

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={5}
                totalSteps={7}
            />

            {/* Título y contexto */}
            <View className="px-4 pt-2 pb-4">
                <Text className="text-3xl tracking-tight leading-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Selecciona el horario
                </Text>

                <View className="flex-row flex-wrap gap-3 mt-2">
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="calendar-today" size={13} color={THEME_COLORS.sosBluegreen} />
                        <Text className="text-xs capitalize text-sos-bluegreen font-poppins-medium">
                            {fechaLegible}
                        </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="person" size={13} color={grayIconColor} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                            {doctorNombre}
                        </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="medical-services" size={13} color={grayIconColor} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                            {servicioNombre}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Contenido */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={THEME_COLORS.sosBluegreen} />
                    <Text className="mt-4 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        Consultando disponibilidad...
                    </Text>
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                    <Pressable
                        onPress={loadHorarios}
                        className="px-6 py-3 mt-4 rounded-xl bg-sos-bluegreen"
                    >
                        <Text className="text-sm text-sos-white font-poppins-semibold">
                            Reintentar
                        </Text>
                    </Pressable>
                </View>
            ) : horarios.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <MaterialIcons name="event-busy" size={48} color="#9CA3AF" />
                    <Text className="mt-4 text-base text-center text-gray-500 dark:text-gray-400 font-poppins-semibold">
                        Sin horarios disponibles
                    </Text>
                    <Text className="mt-1 text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                        No hay citas disponibles para esta fecha. Regresa y selecciona otro día.
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        className="px-6 py-3 mt-5 rounded-xl border border-sos-bluegreen"
                    >
                        <Text className="text-sm text-sos-bluegreen font-poppins-semibold">
                            Cambiar fecha
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <>
                    <TabScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-row flex-wrap gap-y-3 justify-between">
                            {horarios.map((hora) => (
                                <HoraChip
                                    key={hora}
                                    hora={hora}
                                    seleccionada={hora === horaSeleccionada}
                                    isDark={isDark}
                                    onPress={() => setHoraSeleccionada(hora)}
                                />
                            ))}
                        </View>
                    </TabScrollView>

                    <View className="px-4 pt-2 pb-6">
                        <SOSButton
                            label="Continuar"
                            onPress={handleContinuar}
                            disabled={!horaSeleccionada}
                        />
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
