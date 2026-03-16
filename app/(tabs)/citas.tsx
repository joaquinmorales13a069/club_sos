import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import CitaCard from "@/components/citas/CitaCard";
import TabScreenView from "@/components/shared/TabScreenView";
import TabScrollView from "@/components/shared/TabScrollView";
import {
    getCurrentUser,
    findMiembroByAuthUserId,
    getCitasByMiembro,
    getServiciosByEaIds,
    getDoctoresByEaIds,
} from "@/libs/appwrite";
import { THEME_COLORS } from "@/libs/themeColors";
import type { Cita, Servicio, Doctor } from "../../type";

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceMap = Map<number, string>;
type DoctorMap = Map<number, string>;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CitasTabScreen() {
    const router = useRouter();

    const [citas, setCitas] = useState<Cita[]>([]);
    const [serviceMap, setServiceMap] = useState<ServiceMap>(new Map());
    const [doctorMap, setDoctorMap] = useState<DoctorMap>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const loadCitas = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            setError(null);

            const currentUser = await getCurrentUser();
            if (!currentUser) throw new Error("Usuario no autenticado");

            const miembroDoc = await findMiembroByAuthUserId(currentUser.$id);
            if (!miembroDoc) {
                setCitas([]);
                return;
            }

            const citasData = await getCitasByMiembro(miembroDoc.$id);

            if (citasData.length > 0) {
                const serviceEaIds = [
                    ...new Set(
                        citasData
                            .map((c) => parseInt(c.ea_service_id))
                            .filter((n) => !isNaN(n)),
                    ),
                ];
                const providerEaIds = [
                    ...new Set(
                        citasData
                            .map((c) => parseInt(c.ea_provider_id))
                            .filter((n) => !isNaN(n)),
                    ),
                ];

                const [services, doctors] = await Promise.all([
                    getServiciosByEaIds(serviceEaIds),
                    getDoctoresByEaIds(providerEaIds),
                ]);

                setServiceMap(
                    new Map(
                        (services as Servicio[]).map((s) => [s.ea_id, s.nombre]),
                    ),
                );
                setDoctorMap(
                    new Map(
                        (doctors as Doctor[]).map((d) => [
                            d.ea_id,
                            `${d.nombres} ${d.apellidos}`,
                        ]),
                    ),
                );
            }

            setCitas(citasData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Error al cargar las citas",
            );
        } finally {
            setLoading(false);
            setHasLoadedOnce(true);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (hasLoadedOnce) {
                loadCitas(false);
            } else {
                loadCitas(true);
            }
        }, [loadCitas, hasLoadedOnce]),
    );

    const handleAgendar = () => {
        router.push("/(citas)/ubicacion");
    };

    // ─── Loading ─────────────────────────────────────────────
    if (loading) {
        return (
            <TabScreenView className="flex-1 bg-sos-white">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator
                        size="large"
                        color={THEME_COLORS.sosBluegreen}
                    />
                    <Text className="mt-4 text-sm text-sos-gray font-poppins-medium">
                        Cargando citas...
                    </Text>
                </View>
            </TabScreenView>
        );
    }

    // ─── Error ───────────────────────────────────────────────
    if (error) {
        return (
            <TabScreenView className="flex-1 bg-sos-white">
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-base text-center text-red-600 font-poppins-medium">
                        {error}
                    </Text>
                    <Pressable
                        onPress={() => loadCitas(true)}
                        className="mt-4 px-6 py-3 rounded-xl bg-sos-bluegreen"
                    >
                        <Text className="text-sm text-sos-white font-poppins-semibold">
                            Reintentar
                        </Text>
                    </Pressable>
                </View>
            </TabScreenView>
        );
    }

    // ─── Render ──────────────────────────────────────────────
    return (
        <TabScreenView className="flex-1 bg-sos-white">
            <TabScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="pt-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-2xl text-sos-bluegreen font-poppins-bold">
                            Mis Citas
                        </Text>
                        <Pressable
                            onPress={handleAgendar}
                            accessibilityRole="button"
                            accessibilityLabel="Agendar cita"
                            className="flex-row items-center gap-1 px-3 py-2 rounded-xl bg-sos-bluegreen"
                        >
                            <MaterialIcons
                                name="add"
                                size={18}
                                color="#FFFFFF"
                            />
                            <Text className="text-sm text-sos-white font-poppins-semibold">
                                Agendar
                            </Text>
                        </Pressable>
                    </View>

                    {/* Lista o estado vacío */}
                    {citas.length === 0 ? (
                        <View className="items-center px-4 py-12 rounded-2xl bg-gray-50">
                            <MaterialIcons
                                name="event-busy"
                                size={48}
                                color="#9CA3AF"
                            />
                            <Text className="mt-4 text-base text-center text-gray-500 font-poppins-semibold">
                                Sin citas programadas
                            </Text>
                            <Text className="mt-1 text-sm text-center text-sos-gray font-poppins-medium">
                                Presiona "Agendar" para reservar tu primera cita médica.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {citas.map((cita) => (
                                <CitaCard
                                    key={cita.$id}
                                    cita={cita}
                                    servicio={
                                        serviceMap.get(
                                            parseInt(cita.ea_service_id),
                                        ) ?? "Servicio no disponible"
                                    }
                                    doctor={
                                        doctorMap.get(
                                            parseInt(cita.ea_provider_id),
                                        ) ?? "Doctor no disponible"
                                    }
                                />
                            ))}
                        </View>
                    )}
                </View>
            </TabScrollView>
        </TabScreenView>
    );
}
