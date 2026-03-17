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
import { getServiciosByCategoria } from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";
import type { Servicio } from "../../type";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDuracion = (minutos: number): string => {
    if (minutos < 60) return `${minutos} min`;
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
};

const formatPrecio = (precio: number, moneda: string): string => {
    return `${moneda} ${precio.toLocaleString("es-NI")}`;
};

// ─── Servicio Card ────────────────────────────────────────────────────────────

interface ServicioCardProps {
    servicio: Servicio;
    onSelect: (servicio: Servicio) => void;
    isDark: boolean;
}

function ServicioCard({ servicio, onSelect, isDark }: ServicioCardProps) {
    const iconColor = isDark ? "#9CA3AF" : THEME_COLORS.sosGray;
    return (
        <Pressable
            onPress={() => onSelect(servicio)}
            accessibilityRole="button"
            accessibilityLabel={`Seleccionar ${servicio.nombre}`}
            className="active:opacity-75"
        >
            <View className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] shadow-sm">
                {/* Nombre */}
                <Text className="text-base text-gray-900 dark:text-sos-white font-poppins-bold">
                    {servicio.nombre}
                </Text>

                {/* Descripción */}
                {servicio.descripcion ? (
                    <Text
                        className="mt-1 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium"
                        numberOfLines={2}
                    >
                        {servicio.descripcion}
                    </Text>
                ) : null}

                {/* Duración y precio */}
                <View className="flex-row items-center gap-4 mt-3">
                    <View className="flex-row items-center gap-1">
                        <MaterialIcons name="schedule" size={14} color={iconColor} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                            {formatDuracion(servicio.duracion)}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                        <MaterialIcons name="attach-money" size={14} color={iconColor} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium">
                            {formatPrecio(servicio.precio, servicio.moneda)}
                        </Text>
                    </View>
                </View>

                {/* Flecha */}
                <View className="absolute right-4 top-0 bottom-0 justify-center">
                    <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
                </View>
            </View>
        </Pressable>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ServicioScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const { categoriaId, ubicacionNombre } = useLocalSearchParams<{
        categoriaId: string;
        ubicacionNombre: string;
    }>();

    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadServicios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getServiciosByCategoria(parseInt(categoriaId));
            setServicios(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar los servicios",
            );
        } finally {
            setLoading(false);
        }
    }, [categoriaId]);

    useEffect(() => {
        loadServicios();
    }, [loadServicios]);

    const handleSeleccionar = (servicio: Servicio) => {
        router.push({
            pathname: "/(citas)/doctor",
            params: {
                categoriaId,
                ubicacionNombre,
                eaServiceId: String(servicio.ea_id),
                servicioNombre: servicio.nombre,
                servicioDuracion: String(servicio.duracion),
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={2}
                totalSteps={7}
            />

            {/* Título y badge de ubicación */}
            <View className="px-4 pt-2 pb-4">
                <Text className="text-3xl leading-tight tracking-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Selecciona el servicio
                </Text>
                <View className="flex-row items-center gap-1 mt-2">
                    <MaterialIcons
                        name="location-on"
                        size={14}
                        color={THEME_COLORS.sosBluegreen}
                    />
                    <Text className="text-sm text-sos-bluegreen font-poppins-medium">
                        {ubicacionNombre}
                    </Text>
                </View>
            </View>

            {/* Contenido */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={THEME_COLORS.sosBluegreen} />
                    <Text className="mt-4 text-sm text-sos-gray dark:text-gray-400 font-poppins-medium">
                        Cargando servicios...
                    </Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                    <Pressable
                        onPress={loadServicios}
                        className="mt-4 px-6 py-3 rounded-xl bg-sos-bluegreen"
                    >
                        <Text className="text-sm text-sos-white font-poppins-semibold">
                            Reintentar
                        </Text>
                    </Pressable>
                </View>
            ) : servicios.length === 0 ? (
                <View className="flex-1 items-center justify-center px-4">
                    <MaterialIcons name="medical-services" size={48} color="#9CA3AF" />
                    <Text className="mt-4 text-base text-center text-gray-500 dark:text-gray-400 font-poppins-semibold">
                        Sin servicios disponibles
                    </Text>
                    <Text className="mt-1 text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                        No hay servicios configurados para {ubicacionNombre} en este momento.
                    </Text>
                </View>
            ) : (
                <TabScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="gap-3">
                        {servicios.map((servicio) => (
                            <ServicioCard
                                key={servicio.$id}
                                servicio={servicio}
                                onSelect={handleSeleccionar}
                                isDark={isDark}
                            />
                        ))}
                    </View>
                </TabScrollView>
            )}
        </SafeAreaView>
    );
}
