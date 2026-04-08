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
import { getDoctoresByServicioEaId } from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";
import type { Doctor } from "../../type";

// ─── Avatar con iniciales ─────────────────────────────────────────────────────

function AvatarIniciales({ nombres, apellidos }: { nombres: string; apellidos: string }) {
    const iniciales =
        (nombres[0] ?? "").toUpperCase() + (apellidos[0] ?? "").toUpperCase();
    return (
        <View className="justify-center items-center w-12 h-12 rounded-full bg-sos-bluegreen/15 shrink-0">
            <Text className="text-base text-sos-bluegreen font-poppins-bold">
                {iniciales}
            </Text>
        </View>
    );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────

interface DoctorCardProps {
    doctor: Doctor;
    onSelect: (doctor: Doctor) => void;
    isDark: boolean;
}

function DoctorCard({ doctor, onSelect, isDark }: DoctorCardProps) {
    const iconColor = isDark ? "#9CA3AF" : THEME_COLORS.sosGray;
    return (
        <Pressable
            onPress={() => onSelect(doctor)}
            accessibilityRole="button"
            accessibilityLabel={`Seleccionar Dr. ${doctor.nombres} ${doctor.apellidos}`}
            className="active:opacity-75"
        >
            <View className="flex-row gap-4 items-center p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#151f2b] shadow-sm">
                <AvatarIniciales nombres={doctor.nombres} apellidos={doctor.apellidos} />

                <View className="flex-1">
                    <Text className="text-base text-gray-900 dark:text-sos-white font-poppins-bold" numberOfLines={1}>
                        {doctor.nombres} {doctor.apellidos}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                        <MaterialIcons name="email" size={13} color={iconColor} />
                        <Text className="text-xs text-sos-gray dark:text-gray-400 font-poppins-medium" numberOfLines={1}>
                            {doctor.email}
                        </Text>
                    </View>
                </View>

                <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
            </View>
        </Pressable>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DoctorScreen() {
    const router = useRouter();
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const {
        categoriaId,
        ubicacionNombre,
        eaServiceId,
        servicioNombre,
        servicioDuracion,
    } = useLocalSearchParams<{
        categoriaId: string;
        ubicacionNombre: string;
        eaServiceId: string;
        servicioNombre: string;
        servicioDuracion: string;
    }>();

    const [doctores, setDoctores] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDoctores = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDoctoresByServicioEaId(parseInt(eaServiceId));
            setDoctores(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar los doctores",
            );
        } finally {
            setLoading(false);
        }
    }, [eaServiceId]);

    useEffect(() => {
        loadDoctores();
    }, [loadDoctores]);

    const handleSeleccionar = (doctor: Doctor) => {
        router.push({
            pathname: "/(citas)/fecha",
            params: {
                categoriaId,
                ubicacionNombre,
                eaServiceId,
                servicioNombre,
                servicioDuracion,
                eaProviderId: String(doctor.ea_id),
                doctorNombre: `${doctor.nombres} ${doctor.apellidos}`,
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-sos-white dark:bg-[#101822]">
            <TopAppBar
                onBack={() => router.back()}
                currentStep={3}
                totalSteps={7}
            />

            {/* Título y contexto */}
            <View className="px-4 pt-2 pb-4">
                <Text className="text-3xl tracking-tight leading-tight font-poppins-bold text-sos-bluegreen dark:text-sos-white">
                    Selecciona el doctor
                </Text>
                <View className="flex-row flex-wrap gap-3 items-center mt-2">
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="location-on" size={13} color={THEME_COLORS.sosBluegreen} />
                        <Text className="text-xs text-sos-bluegreen font-poppins-medium">
                            {ubicacionNombre}
                        </Text>
                    </View>
                    <View className="flex-row gap-1 items-center">
                        <MaterialIcons name="medical-services" size={13} color={isDark ? "#9CA3AF" : THEME_COLORS.sosGray} />
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
                        Cargando doctores...
                    </Text>
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center px-4">
                    <Text className="text-base text-center text-red-600 dark:text-red-400 font-poppins-medium">
                        {error}
                    </Text>
                    <Pressable
                        onPress={loadDoctores}
                        className="px-6 py-3 mt-4 rounded-xl bg-sos-bluegreen"
                    >
                        <Text className="text-sm text-sos-white font-poppins-semibold">
                            Reintentar
                        </Text>
                    </Pressable>
                </View>
            ) : doctores.length === 0 ? (
                <View className="flex-1 justify-center items-center px-4">
                    <MaterialIcons name="person-off" size={48} color="#9CA3AF" />
                    <Text className="mt-4 text-base text-center text-gray-500 dark:text-gray-400 font-poppins-semibold">
                        Sin doctores disponibles
                    </Text>
                    <Text className="mt-1 text-sm text-center text-sos-gray dark:text-gray-400 font-poppins-medium">
                        No hay doctores activos para este servicio en este momento.
                    </Text>
                </View>
            ) : (
                <TabScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="gap-3">
                        {doctores.map((doctor) => (
                            <DoctorCard
                                key={doctor.$id}
                                doctor={doctor}
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
